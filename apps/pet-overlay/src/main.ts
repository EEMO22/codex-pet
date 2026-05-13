import { app, BrowserWindow, Menu, ipcMain, screen } from 'electron';
import path from 'node:path';

import {
  DEFAULT_PET_ID,
  KEYBOARD_HOOK_SCRIPT,
  SMOKE_TEST,
  USER_DATA_DIR,
  WINDOW_SIZE
} from './constants';
import { startKeyboardActivityHook, stopKeyboardActivityHook } from './keyboardActivityHook';
import type { Point, ResolvedPet } from './mainTypes';
import { listAvailablePets, loadPetManifest } from './petCatalog';
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
    label: pet.displayName,
    type: 'radio' as const,
    checked: pet.id === currentPet?.id,
    click: () => selectPet(pet.id)
  }));

  Menu.buildFromTemplate([
    {
      label: 'Pets',
      submenu: petItems.length ? petItems : [{ label: 'No pets found', enabled: false }]
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

function selectPet(petId: string) {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    return;
  }

  try {
    const pet = loadPetManifest(petId);
    currentPet = pet;
    writeSavedState({ selectedPetId: pet.id });
    overlayWindow.webContents.send('pet:data', pet);
  } catch (error) {
    console.error(error);
  }
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
  try {
    createOverlayWindow(loadPetManifest(parsePetId()));
  } catch (error) {
    console.error(error);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createOverlayWindow(loadPetManifest(parsePetId()));
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
