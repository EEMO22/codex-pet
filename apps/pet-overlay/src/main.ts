import { app, BrowserWindow, Menu, ipcMain, screen, shell } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

import {
  DEFAULT_PET_ID,
  KEYBOARD_HOOK_SCRIPT,
  PETS_ROOT,
  SMOKE_TEST,
  USER_DATA_DIR,
  VALIDATE_PETS,
  WINDOW_SIZE
} from './constants';
import { startKeyboardActivityHook, stopKeyboardActivityHook } from './keyboardActivityHook';
import type { Point, ResolvedPet } from './mainTypes';
import {
  formatPetIssues,
  listAvailablePets,
  listPetValidations,
  loadPetManifest,
  PetPackageError
} from './petCatalog';
import {
  clampToVisibleWorkArea,
  clampToWorkArea,
  getDragTargetDisplay,
  getPetHitboxRect,
  getRectCenter,
  isCursorInPetHitbox
} from './screenGeometry';
import { runSmokeCheck } from './smokeTest';
import { configureUserData, readSavedState, writeSavedState } from './stateStore';

let overlayWindow: BrowserWindow | null = null;
let proximityTimer: NodeJS.Timeout | null = null;
let lastMousePoint: Point | null = null;
let currentPet: ResolvedPet | null = null;
let isDragging = false;
let isIgnoringMouseEvents = false;

configureUserData(USER_DATA_DIR);
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('password-store', 'basic');

function parsePetId() {
  const arg = process.argv.find((value) => value.startsWith('--pet='));
  const argPetId = arg ? arg.slice('--pet='.length).trim() : '';
  if (argPetId) {
    return argPetId;
  }

  return readSavedState().selectedPetId || DEFAULT_PET_ID;
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

function resolveInitialPosition() {
  const savedState = readSavedState();
  if (Number.isFinite(savedState.x) && Number.isFinite(savedState.y)) {
    return clampToVisibleWorkArea({ x: savedState.x, y: savedState.y });
  }

  const { workArea } = screen.getPrimaryDisplay();
  return clampToVisibleWorkArea({
    x: workArea.x + workArea.width - WINDOW_SIZE.width - 32,
    y: workArea.y + workArea.height - WINDOW_SIZE.height - 48
  });
}

function createOverlayWindow(pet: ResolvedPet) {
  const window = new BrowserWindow({
    ...WINDOW_SIZE,
    ...resolveInitialPosition(),
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

  window.setAlwaysOnTop(true, 'floating');
  if (SMOKE_TEST) {
    window.webContents.on('console-message', (details) => {
      console.log('[renderer]', details.message);
    });
  }

  window.loadFile(path.join(__dirname, 'index.html'));

  window.webContents.once('did-finish-load', () => {
    window.webContents.send('pet:data', pet);

    if (SMOKE_TEST) {
      setTimeout(() => runSmokeCheck(overlayWindow, pet), 900);
    }
  });

  window.on('moved', () => {
    const [x, y] = window.getPosition();
    writeSavedState({ x, y });
  });

  window.on('closed', () => {
    overlayWindow = null;
    stopProximityWatcher();
  });

  startProximityWatcher();
  startKeyboardActivityHook({
    disabled: SMOKE_TEST,
    scriptPath: KEYBOARD_HOOK_SCRIPT,
    onActivity: () => {
      if (!overlayWindow || overlayWindow.isDestroyed()) {
        return;
      }

      overlayWindow.webContents.send('pet:typing');
    }
  });
}

function startProximityWatcher() {
  stopProximityWatcher();
  proximityTimer = setInterval(() => {
    if (!overlayWindow || overlayWindow.isDestroyed()) {
      return;
    }

    const cursor = screen.getCursorScreenPoint();
    const bounds = overlayWindow.getBounds();
    const center = getRectCenter(getPetHitboxRect({ x: bounds.x, y: bounds.y }));
    const distance = Math.hypot(cursor.x - center.x, cursor.y - center.y);

    if (hasMouseMoved(cursor)) {
      overlayWindow.webContents.send('pet:mouse-activity');
    }

    overlayWindow.webContents.send('pet:proximity', {
      near: distance < 160,
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

  const shouldIgnore = !isDragging && !isCursorInPetHitbox(cursor, bounds);
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
      label: 'Reset Position',
      click: () => {
        const { workArea } = screen.getPrimaryDisplay();
        const nextPosition = clampToVisibleWorkArea({
          x: workArea.x + workArea.width - WINDOW_SIZE.width - 32,
          y: workArea.y + workArea.height - WINDOW_SIZE.height - 48
        });
        overlayWindow.setPosition(nextPosition.x, nextPosition.y);
        writeSavedState(nextPosition);
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

  const [x, y] = overlayWindow.getPosition();
  const cursor = screen.getCursorScreenPoint();
  const currentPosition = { x, y };
  const rawPosition = {
    x: Math.round(x + delta.x),
    y: Math.round(y + delta.y)
  };
  const targetDisplay = getDragTargetDisplay(currentPosition, rawPosition, delta, cursor);
  const nextPosition = clampToWorkArea(rawPosition, targetDisplay.workArea);

  overlayWindow.setPosition(nextPosition.x, nextPosition.y);
});

ipcMain.handle('pet:get-data', () => currentPet);

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
  if (VALIDATE_PETS) {
    app.exit(printPetValidationReport() ? 0 : 1);
    return;
  }

  try {
    createOverlayWindow(loadStartupPet());
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
  stopKeyboardActivityHook();
});
