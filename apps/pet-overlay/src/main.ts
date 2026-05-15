import { app, BrowserWindow, Menu, Tray, ipcMain, nativeImage, screen, shell, dialog } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

import {
  APP_TRAY_ICON,
  DEFAULT_PET_ID,
  KEYBOARD_HOOK_SCRIPT,
  PETS_ROOT,
  SMOKE_TEST,
  USER_DATA_DIR,
  VALIDATE_PETS,
  WINDOW_SIZE
} from './constants';
import { startKeyboardActivityHook, stopKeyboardActivityHook } from './keyboardActivityHook';
import type { AppSettings, OverlayFrame, Point, ResolvedPet } from './mainTypes';
import {
  formatPetIssues,
  importPetPackage,
  listAvailablePets,
  listPetValidations,
  loadPetManifest,
  PetPackageError
} from './petCatalog';
import {
  getDefaultPetHitboxOffset,
  getDragTargetDisplay,
  getPetHitboxRect,
  getRectCenter,
  isCursorInPetHitbox,
  resolveOverlayFrameForHitbox,
  resolveOverlayFrameForWindowPosition
} from './screenGeometry';
import { runSmokeCheck } from './smokeTest';
import { readSettings, resetSettings, writeSettings } from './settingsStore';
import { configureUserData, readSavedState, writeSavedState } from './stateStore';

let overlayWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let proximityTimer: NodeJS.Timeout | null = null;
let lastMousePoint: Point | null = null;
let currentPet: ResolvedPet | null = null;
let isDragging = false;
let isIgnoringMouseEvents = false;
let currentPetOffset = getDefaultPetHitboxOffset();
let shouldCreateApplication = true;

if (!app.isPackaged) {
  configureUserData(USER_DATA_DIR);
}
let settings = readSettings();
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('password-store', 'basic');

if (!SMOKE_TEST && !VALIDATE_PETS) {
  const hasSingleInstanceLock = app.requestSingleInstanceLock();

  if (!hasSingleInstanceLock) {
    shouldCreateApplication = false;
    app.quit();
  } else {
    app.on('second-instance', () => {
      showExistingOverlay();
    });
  }
}

function parsePetId() {
  const arg = process.argv.find((value) => value.startsWith('--pet='));
  const argPetId = arg ? arg.slice('--pet='.length).trim() : '';
  if (argPetId) {
    return argPetId;
  }

  return readSavedState().selectedPetId || DEFAULT_PET_ID;
}

function createSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show();
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 460,
    height: 640,
    minWidth: 420,
    minHeight: 560,
    title: 'Codex Pet Settings',
    show: false,
    backgroundColor: '#f7f8fb',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  settingsWindow.removeMenu();
  settingsWindow.loadFile(path.join(__dirname, 'settings.html'));
  settingsWindow.once('ready-to-show', () => {
    settingsWindow?.show();
  });
  settingsWindow.webContents.once('did-finish-load', () => {
    sendSettingsData();
  });
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function loadStartupPet() {
  const requestedPetId = parsePetId();

  try {
    return loadPetManifest(requestedPetId);
  } catch (error) {
    console.error(getPetLoadErrorMessage(requestedPetId, error));

    if (requestedPetId === DEFAULT_PET_ID) {
      throw error;
    }

    const fallbackPet = loadPetManifest(DEFAULT_PET_ID);
    writeSavedState({ selectedPetId: fallbackPet.packageId });
    console.warn(`Falling back to default pet "${DEFAULT_PET_ID}".`);
    return fallbackPet;
  }
}

function resolveInitialFrame() {
  const savedState = readSavedState();
  if (Number.isFinite(savedState.petX) && Number.isFinite(savedState.petY)) {
    const hitboxPosition = { x: savedState.petX as number, y: savedState.petY as number };
    const { workArea } = screen.getDisplayNearestPoint(hitboxPosition);
    return resolveOverlayFrameForHitbox(hitboxPosition, workArea);
  }

  if (Number.isFinite(savedState.x) && Number.isFinite(savedState.y)) {
    const windowPosition = { x: savedState.x as number, y: savedState.y as number };
    const { workArea } = screen.getDisplayNearestPoint(windowPosition);
    return resolveOverlayFrameForWindowPosition(windowPosition, workArea);
  }

  const { workArea } = screen.getPrimaryDisplay();
  return resolveOverlayFrameForWindowPosition({
    x: workArea.x + workArea.width - WINDOW_SIZE.width - 32,
    y: workArea.y + workArea.height - WINDOW_SIZE.height - 48
  }, workArea);
}

function createOverlayWindow(pet: ResolvedPet) {
  const initialFrame = resolveInitialFrame();
  currentPetOffset = initialFrame.petOffset;

  const window = new BrowserWindow({
    ...WINDOW_SIZE,
    ...initialFrame.windowPosition,
    frame: false,
    transparent: true,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    title: 'Codex Pet Overlay',
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
      partition: 'temp:codex-pet-overlay'
    }
  });

  overlayWindow = window;
  currentPet = pet;

  applyAlwaysOnTopSetting();
  if (SMOKE_TEST) {
    window.webContents.on('console-message', (details) => {
      console.log('[renderer]', details.message);
    });
  }

  window.loadFile(path.join(__dirname, 'index.html'));

  window.webContents.once('did-finish-load', () => {
    window.webContents.send('pet:data', pet);
    sendOverlayLayout();
    sendSettingsData();

    if (SMOKE_TEST) {
      setTimeout(() => runSmokeCheck(overlayWindow, pet), 900);
    }
  });

  window.on('moved', () => {
    if (SMOKE_TEST) {
      return;
    }

    saveCurrentOverlayState();
  });

  window.on('closed', () => {
    overlayWindow = null;
    stopProximityWatcher();
  });

  startProximityWatcher();
  syncKeyboardActivityHook();
}

function createTray() {
  if (tray) {
    return;
  }

  const icon = nativeImage.createFromPath(APP_TRAY_ICON);
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
  tray.setToolTip('Codex Pet Overlay');
  tray.setContextMenu(buildTrayMenu());
  tray.on('click', () => {
    showExistingOverlay();
  });
}

function buildTrayMenu() {
  return Menu.buildFromTemplate([
    {
      label: 'Show Pet',
      click: showExistingOverlay
    },
    {
      label: 'Settings',
      click: createSettingsWindow
    },
    { type: 'separator' },
    {
      label: 'Open Pets Folder',
      click: openPetsFolder
    },
    {
      label: 'Validate Pets',
      click: validatePetsFromMenu
    },
    { type: 'separator' },
    {
      label: 'Always On Top',
      type: 'checkbox' as const,
      checked: settings.alwaysOnTopEnabled,
      click: () => updateSettings({
        alwaysOnTopEnabled: !settings.alwaysOnTopEnabled
      }, settings.alwaysOnTopEnabled ? 'Always on top off. Use the taskbar to bring the pet back.' : 'Always on top on.')
    },
    {
      label: 'Launch at Login',
      type: 'checkbox' as const,
      checked: settings.launchAtLoginEnabled,
      click: () => updateSettings({
        launchAtLoginEnabled: !settings.launchAtLoginEnabled
      }, getLaunchAtLoginNotice(!settings.launchAtLoginEnabled))
    },
    { type: 'separator' },
    {
      label: 'Close Pet',
      click: () => app.quit()
    }
  ]);
}

function refreshTrayMenu() {
  if (!tray) {
    return;
  }

  tray.setContextMenu(buildTrayMenu());
}

function showExistingOverlay() {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    return;
  }

  if (overlayWindow.isMinimized()) {
    overlayWindow.restore();
  }

  overlayWindow.show();
  applyAlwaysOnTopSetting();
  overlayWindow.focus();
  sendPetNotice('Pet already running.');
}

function startProximityWatcher() {
  stopProximityWatcher();
  proximityTimer = setInterval(() => {
    if (!overlayWindow || overlayWindow.isDestroyed()) {
      return;
    }

    const cursor = screen.getCursorScreenPoint();
    const bounds = overlayWindow.getBounds();
    const center = getRectCenter(getPetHitboxRect({ x: bounds.x, y: bounds.y }, currentPetOffset));
    const distance = Math.hypot(cursor.x - center.x, cursor.y - center.y);

    if (hasMouseMoved(cursor)) {
      overlayWindow.webContents.send('pet:mouse-activity');
    }

    overlayWindow.webContents.send('pet:proximity', {
      near: settings.mouseProximityEnabled && distance < settings.proximityRadius,
      distance
    });

    updateMousePassthrough(cursor, bounds);
  }, 160);
}

function stopProximityWatcher() {
  if (proximityTimer) {
    clearInterval(proximityTimer);
    proximityTimer = null;
  }
}

function hasMouseMoved(cursor: Point) {
  if (!lastMousePoint) {
    lastMousePoint = cursor;
    return false;
  }

  const moved = cursor.x !== lastMousePoint.x || cursor.y !== lastMousePoint.y;
  lastMousePoint = cursor;
  return moved;
}

function updateMousePassthrough(cursor: Point, bounds: Electron.Rectangle) {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    return;
  }

  const shouldIgnore = !isDragging && !isCursorInPetHitbox(cursor, bounds, currentPetOffset);
  if (shouldIgnore === isIgnoringMouseEvents) {
    return;
  }

  isIgnoringMouseEvents = shouldIgnore;
  overlayWindow.setIgnoreMouseEvents(shouldIgnore, { forward: true });
}

function showContextMenu() {
  if (!overlayWindow) {
    return;
  }

  const petItems = listAvailablePets().map((pet) => ({
    label: pet.valid ? pet.displayName : `${pet.displayName} (invalid)`,
    type: 'radio' as const,
    enabled: pet.valid,
    checked: pet.valid && pet.id === currentPet?.packageId,
    click: () => selectPet(pet.id)
  }));

  Menu.buildFromTemplate([
    {
      label: 'Pets',
      submenu: petItems.length ? petItems : [{ label: 'No pets found', enabled: false }]
    },
    { type: 'separator' },
    {
      label: 'Import Pet Folder',
      click: importPetFolder
    },
    {
      label: 'Open Pets Folder',
      click: openPetsFolder
    },
    {
      label: 'Reload Current Pet',
      enabled: Boolean(currentPet),
      click: reloadCurrentPet
    },
    {
      label: 'Validate Pets',
      click: validatePetsFromMenu
    },
    { type: 'separator' },
    {
      label: 'Settings',
      submenu: [
        {
          label: 'Open Settings Window',
          click: createSettingsWindow
        },
        { type: 'separator' },
        {
          label: 'Keyboard Activity',
          type: 'checkbox' as const,
          checked: settings.keyboardActivityEnabled,
          click: () => updateSettings({
            keyboardActivityEnabled: !settings.keyboardActivityEnabled
          }, settings.keyboardActivityEnabled ? 'Keyboard activity off.' : 'Keyboard activity on.')
        },
        {
          label: 'Mouse Proximity',
          type: 'checkbox' as const,
          checked: settings.mouseProximityEnabled,
          click: () => updateSettings({
            mouseProximityEnabled: !settings.mouseProximityEnabled
          }, settings.mouseProximityEnabled ? 'Mouse proximity off.' : 'Mouse proximity on.')
        },
        {
          label: 'Always On Top',
          type: 'checkbox' as const,
          checked: settings.alwaysOnTopEnabled,
          click: () => updateSettings({
            alwaysOnTopEnabled: !settings.alwaysOnTopEnabled
          }, settings.alwaysOnTopEnabled ? 'Always on top off. Use the taskbar to bring the pet back.' : 'Always on top on.')
        },
        {
          label: 'Launch at Login',
          type: 'checkbox' as const,
          checked: settings.launchAtLoginEnabled,
          click: () => updateSettings({
            launchAtLoginEnabled: !settings.launchAtLoginEnabled
          }, getLaunchAtLoginNotice(!settings.launchAtLoginEnabled))
        },
        { type: 'separator' },
        {
          label: 'Reset Settings',
          click: () => resetAllSettings()
        }
      ]
    },
    { type: 'separator' },
    {
      label: 'Reset Position',
      click: () => {
        const { workArea } = screen.getPrimaryDisplay();
        const nextFrame = resolveOverlayFrameForWindowPosition({
          x: workArea.x + workArea.width - WINDOW_SIZE.width - 32,
          y: workArea.y + workArea.height - WINDOW_SIZE.height - 48
        }, workArea);
        applyOverlayFrame(nextFrame);
      }
    },
    { type: 'separator' },
    {
      label: 'Close Pet',
      click: () => app.quit()
    }
  ]).popup({ window: overlayWindow });
}

async function openPetsFolder() {
  fs.mkdirSync(PETS_ROOT, { recursive: true });
  const errorMessage = await shell.openPath(PETS_ROOT);
  if (errorMessage) {
    console.error(`Could not open pets folder: ${errorMessage}`);
    sendPetNotice('Could not open pets folder.');
  }
}

async function importPetFolder() {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    return;
  }

  const result = await dialog.showOpenDialog(overlayWindow, {
    title: 'Import Pet Folder',
    properties: ['openDirectory']
  });

  if (result.canceled || !result.filePaths[0]) {
    return;
  }

  const sourceDir = result.filePaths[0];

  try {
    const imported = importPetPackage(sourceDir);
    currentPet = imported.pet;
    writeSavedState({ selectedPetId: imported.pet.packageId });
    overlayWindow.webContents.send('pet:data', imported.pet);
    sendPetNotice(imported.copied
      ? `Imported ${imported.pet.displayName}.`
      : `${imported.pet.displayName} already installed.`);
  } catch (error) {
    console.error(getPetLoadErrorMessage(path.basename(sourceDir), error));
    sendPetNotice('Could not import pet folder.');
  }
}

function reloadCurrentPet() {
  if (!currentPet) {
    sendPetNotice('No current pet to reload.');
    return;
  }

  try {
    const pet = loadPetManifest(currentPet.packageId);
    currentPet = pet;
    writeSavedState({ selectedPetId: pet.packageId });
    overlayWindow?.webContents.send('pet:data', pet);
    sendPetNotice(`Reloaded ${pet.displayName}.`);
  } catch (error) {
    console.error(getPetLoadErrorMessage(currentPet.packageId, error));
    sendPetNotice(`Could not reload ${currentPet.displayName}.`);
  }
}

function validatePetsFromMenu() {
  const validations = listPetValidations();
  if (!validations.length) {
    console.log('No pet packages found.');
    sendPetNotice('No pet packages found.');
    return;
  }

  let invalidCount = 0;
  let warningCount = 0;

  for (const validation of validations) {
    if (validation.hasErrors) {
      invalidCount += 1;
    }

    warningCount += validation.issues.filter((issue) => issue.severity === 'warning').length;
    const status = validation.hasErrors ? 'invalid' : 'ok';
    console.log(`${validation.displayName} (${validation.petId}): ${status}`);

    for (const issue of validation.issues) {
      console.log(`  [${issue.severity}] ${issue.message}`);
    }
  }

  if (invalidCount > 0) {
    sendPetNotice(`${invalidCount} invalid pet package(s).`);
  } else if (warningCount > 0) {
    sendPetNotice(`${warningCount} pet warning(s).`);
  } else {
    sendPetNotice('All pets valid.');
  }
}

function selectPet(petId: string) {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    return;
  }

  try {
    const pet = loadPetManifest(petId);
    currentPet = pet;
    writeSavedState({ selectedPetId: pet.packageId });
    overlayWindow.webContents.send('pet:data', pet);
  } catch (error) {
    console.error(getPetLoadErrorMessage(petId, error));
    sendPetNotice(`Could not load pet "${petId}".`);
  }
}

function sendPetNotice(message: string) {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    return;
  }

  overlayWindow.webContents.send('pet:notice', { message });
}

function applyOverlayFrame(frame: OverlayFrame) {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    return;
  }

  currentPetOffset = frame.petOffset;
  overlayWindow.setPosition(frame.windowPosition.x, frame.windowPosition.y);
  sendOverlayLayout();
  if (!SMOKE_TEST) {
    saveCurrentOverlayState();
  }
}

function sendOverlayLayout() {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    return;
  }

  overlayWindow.webContents.send('overlay:layout', { petOffset: currentPetOffset });
}

function saveCurrentOverlayState() {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    return;
  }

  const [x, y] = overlayWindow.getPosition();
  writeSavedState({
    x,
    y,
    petX: x + currentPetOffset.x,
    petY: y + currentPetOffset.y
  });
}

function getCurrentHitboxPosition() {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    return { x: 0, y: 0 };
  }

  const [x, y] = overlayWindow.getPosition();
  return {
    x: x + currentPetOffset.x,
    y: y + currentPetOffset.y
  };
}

function updateSettings(nextSettings: Partial<AppSettings>, notice?: string) {
  settings = writeSettings(nextSettings);
  applyRuntimeSettings();
  if (notice) {
    sendPetNotice(notice);
  }
}

function resetAllSettings(notice = 'Settings reset.') {
  settings = resetSettings();
  applyRuntimeSettings();
  if (notice) {
    sendPetNotice(notice);
  }
}

function applyRuntimeSettings() {
  applyAlwaysOnTopSetting();
  syncLaunchAtLogin();
  syncKeyboardActivityHook();
  refreshTrayMenu();
  sendSettingsData();
}

function applyAlwaysOnTopSetting() {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    return;
  }

  if (settings.alwaysOnTopEnabled) {
    overlayWindow.setAlwaysOnTop(true, 'floating');
    overlayWindow.setSkipTaskbar(true);
  } else {
    overlayWindow.setAlwaysOnTop(false);
    overlayWindow.setSkipTaskbar(false);
    overlayWindow.show();
  }
}

function syncKeyboardActivityHook() {
  if (SMOKE_TEST || !settings.keyboardActivityEnabled) {
    stopKeyboardActivityHook();
    return;
  }

  startKeyboardActivityHook({
    disabled: false,
    scriptPath: KEYBOARD_HOOK_SCRIPT,
    onActivity: () => {
      if (!overlayWindow || overlayWindow.isDestroyed()) {
        return;
      }

      overlayWindow.webContents.send('pet:typing');
    }
  });
}

function syncLaunchAtLogin() {
  if (SMOKE_TEST || VALIDATE_PETS || !app.isPackaged) {
    return;
  }

  app.setLoginItemSettings({
    openAtLogin: settings.launchAtLoginEnabled,
    path: process.execPath
  });
}

function getLaunchAtLoginNotice(enabled: boolean) {
  if (!app.isPackaged) {
    return 'Launch at login applies after install.';
  }

  return enabled ? 'Launch at login on.' : 'Launch at login off.';
}

function sendSettingsData() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.webContents.send('settings:data', settings);
  }

  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.webContents.send('settings:data', settings);
  }
}

function getPetLoadErrorMessage(petId: string, error: unknown) {
  if (error instanceof PetPackageError) {
    return `Could not load pet "${petId}". ${formatPetIssues(error.validation.issues)}`;
  }

  return error instanceof Error
    ? `Could not load pet "${petId}". ${error.message}`
    : `Could not load pet "${petId}". ${String(error)}`;
}

function printPetValidationReport() {
  const validations = listPetValidations();
  if (!validations.length) {
    console.log('No pet packages found.');
    return true;
  }

  let ok = true;
  for (const validation of validations) {
    if (validation.hasErrors) {
      ok = false;
    }

    const status = validation.hasErrors ? 'invalid' : 'ok';
    console.log(`${validation.displayName} (${validation.petId}): ${status}`);

    for (const issue of validation.issues) {
      console.log(`  [${issue.severity}] ${issue.message}`);
    }
  }

  return ok;
}

ipcMain.handle('overlay:move-by', (_event, delta: Point) => {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    return;
  }

  const cursor = screen.getCursorScreenPoint();
  const currentHitboxPosition = getCurrentHitboxPosition();
  const rawHitboxPosition = {
    x: Math.round(currentHitboxPosition.x + delta.x),
    y: Math.round(currentHitboxPosition.y + delta.y)
  };
  const targetDisplay = getDragTargetDisplay(currentHitboxPosition, rawHitboxPosition, delta, cursor);
  const nextFrame = resolveOverlayFrameForHitbox(rawHitboxPosition, targetDisplay.workArea);

  applyOverlayFrame(nextFrame);
});

ipcMain.handle('pet:get-data', () => currentPet);
ipcMain.handle('settings:get-data', () => settings);
ipcMain.handle('settings:save-data', (_event, nextSettings: Partial<AppSettings>) => {
  updateSettings(nextSettings, 'Settings saved.');
  return settings;
});
ipcMain.handle('settings:reset-data', () => {
  resetAllSettings('Settings reset.');
  return settings;
});
ipcMain.on('settings:close-window', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window && window === settingsWindow) {
    window.close();
  }
});

ipcMain.on('overlay:set-dragging', (_event, dragging: boolean) => {
  isDragging = Boolean(dragging);
  if (isDragging && overlayWindow && !overlayWindow.isDestroyed() && isIgnoringMouseEvents) {
    isIgnoringMouseEvents = false;
    overlayWindow.setIgnoreMouseEvents(false);
  }
});

ipcMain.on('overlay:show-menu', showContextMenu);
ipcMain.on('overlay:tuck-away', () => app.quit());

app.whenReady().then(() => {
  if (!shouldCreateApplication) {
    return;
  }

  if (VALIDATE_PETS) {
    app.exit(printPetValidationReport() ? 0 : 1);
    return;
  }

  try {
    createOverlayWindow(loadStartupPet());
    createTray();
    syncLaunchAtLogin();
  } catch (error) {
    console.error(error);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createOverlayWindow(loadStartupPet());
    }
  });
});

app.on('window-all-closed', () => {
  stopKeyboardActivityHook();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  tray?.destroy();
  tray = null;
  stopKeyboardActivityHook();
});
