import { app, type BrowserWindow } from 'electron';

import type { ResolvedPet } from './mainTypes';

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

    app.quit();
  } catch (error) {
    console.error('[smoke] failed', error);
    app.exit(1);
  }
}
