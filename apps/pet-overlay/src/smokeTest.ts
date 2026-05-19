import { app, BrowserWindow, screen } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

import { PET_EDGE_BUMPER, PET_HITBOX, PETS_ROOT } from './constants';
import type { ResolvedPet } from './mainTypes';
import { importPetPackage } from './petCatalog';
import { resolveOverlayFrameForHitbox } from './screenGeometry';

export async function runSmokeCheck(overlayWindow: BrowserWindow | null, pet: ResolvedPet) {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    app.exit(1);
    return;
  }

  try {
    const result = await overlayWindow.webContents.executeJavaScript(`
      (async () => {
        const pet = document.getElementById('pet');
        const styles = pet ? getComputedStyle(pet) : null;
        const settings = window.petOverlay ? await window.petOverlay.getSettingsData() : null;
        const imageResult = await new Promise((resolve) => {
          const image = new Image();
          image.onload = () => resolve({
            loaded: true,
            width: image.naturalWidth,
            height: image.naturalHeight
          });
          image.onerror = () => resolve({ loaded: false, width: 0, height: 0 });
          image.src = ${JSON.stringify(pet.spritesheetUrl)};
        });

        return {
          hasApi: Boolean(window.petOverlay),
          hasSettings: Boolean(settings && typeof settings.proximityRadius === 'number'),
          rendererLoaded: Boolean(window.__codexPetRendererLoaded),
          hasPet: Boolean(pet),
          backgroundImage: styles ? styles.backgroundImage : '',
          imageResult
        };
      })();
    `);

    console.log('[smoke]', JSON.stringify(result));

    if (!result.hasApi || !result.hasSettings || !result.hasPet || result.backgroundImage === 'none' || !result.imageResult.loaded) {
      app.exit(1);
      return;
    }

    const keyboardMouseResult = await runKeyboardMouseActivitySmokeCheck(overlayWindow);
    console.log('[smoke:keyboard-mouse]', JSON.stringify(keyboardMouseResult));

    if (keyboardMouseResult.state !== 'typing') {
      app.exit(1);
      return;
    }

    const bubbleResult = await runBubbleSmokeCheck(overlayWindow);
    console.log('[smoke:bubble]', JSON.stringify(bubbleResult));

    if (!bubbleResult.visible || !bubbleResult.withinViewport || bubbleResult.lineCount > 2) {
      app.exit(1);
      return;
    }

    console.log('[smoke:bubble:screenshot]', await captureBubbleSmokeScreenshot(overlayWindow, 'smoke-bubble.png'));

    const edgeBubbleResults = await runEdgeBubbleSmokeChecks(overlayWindow);
    console.log('[smoke:bubble:edges]', JSON.stringify(edgeBubbleResults));

    if (edgeBubbleResults.some((result) => !result.bubble.visible || !result.bubble.withinViewport)) {
      app.exit(1);
      return;
    }

    const settingsResult = await runSettingsWindowSmokeCheck();
    console.log('[smoke:settings]', JSON.stringify(settingsResult));

    if (!settingsResult.hasApi || !settingsResult.hasCloseApi || !settingsResult.hasPetListApi || !settingsResult.hasForm || !settingsResult.hasSettings || !settingsResult.hasLanguageSetting || !settingsResult.hasLanguageSelect || !settingsResult.canPreviewKorean || !settingsResult.hasLaunchAtLogin || !settingsResult.hasEventOverrides || !settingsResult.hasPetData || !settingsResult.hasPetList || !settingsResult.hasPetManager || settingsResult.petRowCount < 3 || settingsResult.eventSelectCount < 9 || !settingsResult.fieldCount) {
      app.exit(1);
      return;
    }

    const importResult = importPetPackage(path.join(PETS_ROOT, 'scopey'));
    console.log('[smoke:import]', JSON.stringify({
      displayName: importResult.pet.displayName,
      copied: importResult.copied
    }));

    if (importResult.pet.packageId !== 'scopey' || importResult.copied) {
      app.exit(1);
      return;
    }

    app.quit();
  } catch (error) {
    console.error('[smoke] failed', error);
    app.exit(1);
  }
}

async function runKeyboardMouseActivitySmokeCheck(overlayWindow: BrowserWindow) {
  overlayWindow.webContents.send('pet:typing');
  await new Promise((resolve) => setTimeout(resolve, 80));
  overlayWindow.webContents.send('pet:mouse-activity');
  await new Promise((resolve) => setTimeout(resolve, 80));

  return overlayWindow.webContents.executeJavaScript(`
    (() => {
      const pet = document.getElementById('pet');
      return {
        state: pet?.dataset.state || '',
        backgroundPosition: pet ? getComputedStyle(pet).backgroundPosition : ''
      };
    })();
  `);
}

async function runBubbleSmokeCheck(overlayWindow: BrowserWindow) {
  overlayWindow.webContents.send('pet:notice', { message: 'Could not import pet folder.' });
  await new Promise((resolve) => setTimeout(resolve, 180));

  return overlayWindow.webContents.executeJavaScript(`
    (() => {
      const bubble = document.getElementById('bubble');
      if (!bubble) {
        return { visible: false, withinViewport: false, lineCount: 0 };
      }

      const rect = bubble.getBoundingClientRect();
      const styles = getComputedStyle(bubble);
      const lineHeight = Number.parseFloat(styles.lineHeight) || 1;
      const verticalChrome =
        Number.parseFloat(styles.paddingTop) +
        Number.parseFloat(styles.paddingBottom) +
        Number.parseFloat(styles.borderTopWidth) +
        Number.parseFloat(styles.borderBottomWidth);
      const lineCount = Math.round((rect.height - verticalChrome) / lineHeight);

      return {
        visible: rect.width > 0 && rect.height > 0,
        withinViewport: rect.top >= 0 && rect.left >= 0 && rect.right <= window.innerWidth && rect.bottom <= window.innerHeight,
        lineCount,
        rect: {
          top: Math.round(rect.top),
          right: Math.round(rect.right),
          bottom: Math.round(rect.bottom),
          left: Math.round(rect.left),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    })();
  `);
}

async function runEdgeBubbleSmokeChecks(overlayWindow: BrowserWindow) {
  const { workArea } = screen.getPrimaryDisplay();
  const targets = [
    {
      name: 'top-left',
      hitboxPosition: {
        x: workArea.x + PET_EDGE_BUMPER,
        y: workArea.y + PET_EDGE_BUMPER
      }
    },
    {
      name: 'top-right',
      hitboxPosition: {
        x: workArea.x + workArea.width - PET_HITBOX.width - PET_EDGE_BUMPER,
        y: workArea.y + PET_EDGE_BUMPER
      }
    },
    {
      name: 'bottom-left',
      hitboxPosition: {
        x: workArea.x + PET_EDGE_BUMPER,
        y: workArea.y + workArea.height - PET_HITBOX.height - PET_EDGE_BUMPER
      }
    },
    {
      name: 'bottom-right',
      hitboxPosition: {
        x: workArea.x + workArea.width - PET_HITBOX.width - PET_EDGE_BUMPER,
        y: workArea.y + workArea.height - PET_HITBOX.height - PET_EDGE_BUMPER
      }
    }
  ];
  const results = [];

  for (const target of targets) {
    const frame = resolveOverlayFrameForHitbox(target.hitboxPosition, workArea);
    overlayWindow.setPosition(frame.windowPosition.x, frame.windowPosition.y);
    overlayWindow.webContents.send('overlay:layout', { petOffset: frame.petOffset });
    await new Promise((resolve) => setTimeout(resolve, 120));

    const bubble = await runBubbleSmokeCheck(overlayWindow);
    const screenshot = await captureBubbleSmokeScreenshot(overlayWindow, `smoke-bubble-${target.name}.png`);
    results.push({
      name: target.name,
      petOffset: frame.petOffset,
      windowPosition: frame.windowPosition,
      bubble,
      screenshot
    });
  }

  return results;
}

async function captureBubbleSmokeScreenshot(overlayWindow: BrowserWindow, fileName: string) {
  await new Promise((resolve) => setTimeout(resolve, 180));
  const screenshotPath = path.join(app.getPath('userData'), fileName);
  fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
  const image = await overlayWindow.webContents.capturePage();
  fs.writeFileSync(screenshotPath, image.toPNG());
  return screenshotPath;
}

async function runSettingsWindowSmokeCheck() {
  const settingsWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  try {
    await settingsWindow.loadFile(path.join(__dirname, 'settings.html'));
    return await settingsWindow.webContents.executeJavaScript(`
      (async () => {
        const settings = window.petOverlay ? await window.petOverlay.getSettingsData() : null;
        const pet = window.petOverlay ? await window.petOverlay.getPetData() : null;
        const pets = window.petOverlay ? await window.petOverlay.getPetListData() : null;
        await new Promise((resolve) => setTimeout(resolve, 120));
        const languageSelect = document.getElementById('language');
        if (languageSelect) {
          languageSelect.value = 'ko';
          languageSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const koreanTitle = document.querySelector('h1')?.textContent || '';
        if (languageSelect && settings) {
          languageSelect.value = settings.language || 'system';
          languageSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        return {
          hasApi: Boolean(window.petOverlay),
          hasCloseApi: Boolean(window.petOverlay && typeof window.petOverlay.closeSettingsWindow === 'function'),
          hasPetListApi: Boolean(window.petOverlay && typeof window.petOverlay.getPetListData === 'function'),
          hasForm: Boolean(document.getElementById('settings-form')),
          hasSettings: Boolean(settings && typeof settings.rapidClickLimit === 'number'),
          hasLanguageSetting: Boolean(settings && typeof settings.language === 'string'),
          hasLanguageSelect: Boolean(languageSelect),
          canPreviewKorean: koreanTitle === '설정',
          hasLaunchAtLogin: Boolean(settings && typeof settings.launchAtLoginEnabled === 'boolean'),
          hasEventOverrides: Boolean(settings && settings.eventAnimationOverridesByPet && typeof settings.eventAnimationOverridesByPet === 'object'),
          hasPetData: Boolean(pet && pet.animations && pet.events),
          hasPetList: Array.isArray(pets) && pets.some((item) => item.selected),
          hasPetManager: Boolean(document.getElementById('petManager')),
          petRowCount: document.querySelectorAll('.pet-row').length,
          eventSelectCount: document.querySelectorAll('select[data-event-mapping]').length,
          fieldCount: document.querySelectorAll('input').length
        };
      })();
    `);
  } finally {
    settingsWindow.destroy();
  }
}
