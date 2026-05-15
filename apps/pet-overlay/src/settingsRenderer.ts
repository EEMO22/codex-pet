(() => {
  type SettingsWindowSettings = {
    keyboardActivityEnabled: boolean;
    mouseProximityEnabled: boolean;
    alwaysOnTopEnabled: boolean;
    proximityRadius: number;
    keyboardReviewMs: number;
    inactivityWaitingMs: number;
    rapidClickWindowMs: number;
    rapidClickLimit: number;
    animationFrameMsMultiplier: number;
  };

  type SettingsWindowApi = {
    getSettingsData(): Promise<SettingsWindowSettings>;
    saveSettingsData(settings: Partial<SettingsWindowSettings>): Promise<SettingsWindowSettings>;
    resetSettingsData(): Promise<SettingsWindowSettings>;
    onSettingsData(callback: (settings: SettingsWindowSettings) => void): void;
    closeSettingsWindow(): void;
  };

  const settingsApi = (window as unknown as { petOverlay: SettingsWindowApi }).petOverlay;
  const form = document.getElementById('settings-form') as HTMLFormElement;
  const status = document.getElementById('status') as HTMLDivElement;
  const resetButton = document.getElementById('reset') as HTMLButtonElement;

  const fields = {
    keyboardActivityEnabled: document.getElementById('keyboardActivityEnabled') as HTMLInputElement,
    mouseProximityEnabled: document.getElementById('mouseProximityEnabled') as HTMLInputElement,
    alwaysOnTopEnabled: document.getElementById('alwaysOnTopEnabled') as HTMLInputElement,
    proximityRadius: document.getElementById('proximityRadius') as HTMLInputElement,
    keyboardReviewMs: document.getElementById('keyboardReviewMs') as HTMLInputElement,
    inactivityWaitingMs: document.getElementById('inactivityWaitingMs') as HTMLInputElement,
    rapidClickWindowMs: document.getElementById('rapidClickWindowMs') as HTMLInputElement,
    rapidClickLimit: document.getElementById('rapidClickLimit') as HTMLInputElement,
    animationFrameMsMultiplier: document.getElementById('animationFrameMsMultiplier') as HTMLInputElement
  };

  function setStatus(message: string, isError = false) {
    status.textContent = message;
    status.classList.toggle('is-error', isError);
  }

  function applySettings(settings: SettingsWindowSettings) {
    fields.keyboardActivityEnabled.checked = settings.keyboardActivityEnabled;
    fields.mouseProximityEnabled.checked = settings.mouseProximityEnabled;
    fields.alwaysOnTopEnabled.checked = settings.alwaysOnTopEnabled;
    fields.proximityRadius.value = String(settings.proximityRadius);
    fields.keyboardReviewMs.value = String(settings.keyboardReviewMs);
    fields.inactivityWaitingMs.value = String(settings.inactivityWaitingMs);
    fields.rapidClickWindowMs.value = String(settings.rapidClickWindowMs);
    fields.rapidClickLimit.value = String(settings.rapidClickLimit);
    fields.animationFrameMsMultiplier.value = String(settings.animationFrameMsMultiplier);
  }

  function readFormSettings(): Partial<SettingsWindowSettings> {
    return {
      keyboardActivityEnabled: fields.keyboardActivityEnabled.checked,
      mouseProximityEnabled: fields.mouseProximityEnabled.checked,
      alwaysOnTopEnabled: fields.alwaysOnTopEnabled.checked,
      proximityRadius: Number(fields.proximityRadius.value),
      keyboardReviewMs: Number(fields.keyboardReviewMs.value),
      inactivityWaitingMs: Number(fields.inactivityWaitingMs.value),
      rapidClickWindowMs: Number(fields.rapidClickWindowMs.value),
      rapidClickLimit: Number(fields.rapidClickLimit.value),
      animationFrameMsMultiplier: Number(fields.animationFrameMsMultiplier.value)
    };
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      applySettings(await settingsApi.saveSettingsData(readFormSettings()));
      setStatus('Saved');
      window.setTimeout(() => {
        settingsApi.closeSettingsWindow();
      }, 120);
    } catch (error) {
      console.error(error);
      setStatus('Save failed', true);
    }
  });

  resetButton.addEventListener('click', async () => {
    try {
      applySettings(await settingsApi.resetSettingsData());
      setStatus('Reset');
    } catch (error) {
      console.error(error);
      setStatus('Reset failed', true);
    }
  });

  settingsApi.onSettingsData(applySettings);
  settingsApi.getSettingsData()
    .then((settings) => {
      applySettings(settings);
      setStatus('Ready');
    })
    .catch((error) => {
      console.error(error);
      setStatus('Load failed', true);
    });
})();
