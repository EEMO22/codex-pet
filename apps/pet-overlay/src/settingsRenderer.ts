(() => {
  type EventAnimationOverridesByPet = Record<string, Record<string, string>>;

  type SettingsWindowSettings = {
    keyboardActivityEnabled: boolean;
    mouseProximityEnabled: boolean;
    alwaysOnTopEnabled: boolean;
    launchAtLoginEnabled: boolean;
    proximityRadius: number;
    keyboardReviewMs: number;
    inactivityWaitingMs: number;
    rapidClickWindowMs: number;
    rapidClickLimit: number;
    animationFrameMsMultiplier: number;
    eventAnimationOverridesByPet: EventAnimationOverridesByPet;
    firstRunNoticeDismissed: boolean;
  };

  type PetData = {
    id: string;
    packageId: string;
    displayName: string;
    animations: Record<string, unknown>;
    events: Record<string, string>;
  };

  type PetListItem = {
    id: string;
    displayName: string;
    valid: boolean;
    selected: boolean;
    source: 'builtIn' | 'imported';
    canRemove: boolean;
    issues: Array<{ severity: string; message: string }>;
  };

  type PetActionResult = {
    pet?: PetData | null;
    currentPet?: PetData | null;
    pets?: PetListItem[];
    removedPet?: PetListItem;
  };

  type SettingsWindowApi = {
    getPetData(): Promise<PetData | null>;
    getPetListData(): Promise<PetListItem[]>;
    selectPet(petId: string): Promise<PetActionResult>;
    openPetFolder(petId: string): Promise<boolean>;
    removePet(petId: string): Promise<PetActionResult>;
    getSettingsData(): Promise<SettingsWindowSettings>;
    saveSettingsData(settings: Partial<SettingsWindowSettings>): Promise<SettingsWindowSettings>;
    resetSettingsData(): Promise<SettingsWindowSettings>;
    onPetData(callback: (pet: PetData) => void): void;
    onPetListData(callback: (pets: PetListItem[]) => void): void;
    onSettingsData(callback: (settings: SettingsWindowSettings) => void): void;
    closeSettingsWindow(): void;
  };

  const eventDefinitions = [
    { name: 'idle', label: 'Idle' },
    { name: 'mouseNear', label: 'Mouse Near' },
    { name: 'click', label: 'Click' },
    { name: 'dragRight', label: 'Drag Right' },
    { name: 'dragLeft', label: 'Drag Left' },
    { name: 'rapidClick', label: 'Rapid Click' },
    { name: 'keyboardActive', label: 'Keyboard Active' },
    { name: 'keyboardPaused', label: 'Keyboard Paused' },
    { name: 'inactive', label: 'Inactive' }
  ];

  const settingsApi = (window as unknown as { petOverlay: SettingsWindowApi }).petOverlay;
  const form = document.getElementById('settings-form') as HTMLFormElement;
  const status = document.getElementById('status') as HTMLDivElement;
  const resetButton = document.getElementById('reset') as HTMLButtonElement;
  const petManager = document.getElementById('petManager') as HTMLDivElement;
  const eventMappings = document.getElementById('eventMappings') as HTMLDivElement;

  const fields = {
    keyboardActivityEnabled: document.getElementById('keyboardActivityEnabled') as HTMLInputElement,
    mouseProximityEnabled: document.getElementById('mouseProximityEnabled') as HTMLInputElement,
    alwaysOnTopEnabled: document.getElementById('alwaysOnTopEnabled') as HTMLInputElement,
    launchAtLoginEnabled: document.getElementById('launchAtLoginEnabled') as HTMLInputElement,
    proximityRadius: document.getElementById('proximityRadius') as HTMLInputElement,
    keyboardReviewMs: document.getElementById('keyboardReviewMs') as HTMLInputElement,
    inactivityWaitingMs: document.getElementById('inactivityWaitingMs') as HTMLInputElement,
    rapidClickWindowMs: document.getElementById('rapidClickWindowMs') as HTMLInputElement,
    rapidClickLimit: document.getElementById('rapidClickLimit') as HTMLInputElement,
    animationFrameMsMultiplier: document.getElementById('animationFrameMsMultiplier') as HTMLInputElement
  };

  let currentSettings: SettingsWindowSettings | null = null;
  let currentPet: PetData | null = null;
  let currentPetList: PetListItem[] = [];

  function setStatus(message: string, isError = false) {
    status.textContent = message;
    status.classList.toggle('is-error', isError);
  }

  function getPetKey(pet: PetData) {
    return pet.packageId || pet.id;
  }

  function applySettings(settings: SettingsWindowSettings) {
    currentSettings = {
      ...settings,
      eventAnimationOverridesByPet: settings.eventAnimationOverridesByPet || {}
    };
    fields.keyboardActivityEnabled.checked = settings.keyboardActivityEnabled;
    fields.mouseProximityEnabled.checked = settings.mouseProximityEnabled;
    fields.alwaysOnTopEnabled.checked = settings.alwaysOnTopEnabled;
    fields.launchAtLoginEnabled.checked = settings.launchAtLoginEnabled;
    fields.proximityRadius.value = String(settings.proximityRadius);
    fields.keyboardReviewMs.value = String(settings.keyboardReviewMs);
    fields.inactivityWaitingMs.value = String(settings.inactivityWaitingMs);
    fields.rapidClickWindowMs.value = String(settings.rapidClickWindowMs);
    fields.rapidClickLimit.value = String(settings.rapidClickLimit);
    fields.animationFrameMsMultiplier.value = String(settings.animationFrameMsMultiplier);
    renderEventMappings();
  }

  function applyPetData(pet: PetData | null) {
    currentPet = pet;
    renderPetManager();
    renderEventMappings();
  }

  function applyPetListData(pets: PetListItem[] | null) {
    currentPetList = Array.isArray(pets) ? pets : [];
    renderPetManager();
  }

  function getIssueSummary(pet: PetListItem) {
    if (pet.valid) {
      return pet.source === 'imported' ? 'Imported' : 'Built-in';
    }

    return pet.issues?.[0]?.message || 'Invalid pet package';
  }

  function renderPetManager() {
    if (!petManager) {
      return;
    }

    petManager.textContent = '';

    if (!currentPetList.length) {
      const note = document.createElement('p');
      note.className = 'mapping-note';
      note.textContent = 'No pet packages found.';
      petManager.appendChild(note);
      return;
    }

    for (const pet of currentPetList) {
      const row = document.createElement('div');
      row.className = 'pet-row';

      const meta = document.createElement('div');
      meta.className = 'pet-meta';

      const title = document.createElement('div');
      title.className = 'pet-title';

      const name = document.createElement('strong');
      name.textContent = pet.displayName;
      title.appendChild(name);

      if (pet.selected || !pet.valid) {
        const badge = document.createElement('span');
        badge.className = pet.valid ? 'pet-badge' : 'pet-badge is-invalid';
        badge.textContent = pet.valid ? 'Current' : 'Invalid';
        title.appendChild(badge);
      }

      const summary = document.createElement('small');
      summary.textContent = getIssueSummary(pet);
      meta.append(title, summary);

      const actions = document.createElement('div');
      actions.className = 'pet-actions';

      const useButton = document.createElement('button');
      useButton.type = 'button';
      useButton.className = 'secondary';
      useButton.textContent = 'Use';
      useButton.disabled = !pet.valid || pet.selected;
      useButton.addEventListener('click', () => selectPetFromManager(pet));

      const openButton = document.createElement('button');
      openButton.type = 'button';
      openButton.className = 'secondary';
      openButton.textContent = 'Open';
      openButton.addEventListener('click', () => openPetFromManager(pet));

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'secondary';
      removeButton.textContent = 'Remove';
      removeButton.disabled = !pet.canRemove;
      removeButton.title = pet.canRemove ? 'Remove imported pet' : 'Built-in pets cannot be removed here';
      removeButton.addEventListener('click', () => removePetFromManager(pet));

      actions.append(useButton, openButton, removeButton);
      row.append(meta, actions);
      petManager.appendChild(row);
    }
  }

  function applyPetActionResult(result: PetActionResult | null) {
    if (!result) {
      return;
    }

    if (result.pets) {
      applyPetListData(result.pets);
    }

    if (result.pet || result.currentPet) {
      applyPetData((result.pet || result.currentPet) ?? null);
    }
  }

  async function selectPetFromManager(pet: PetListItem) {
    try {
      applyPetActionResult(await settingsApi.selectPet(pet.id));
      setStatus(`Selected ${pet.displayName}`);
    } catch (error) {
      console.error(error);
      setStatus('Select failed', true);
    }
  }

  async function openPetFromManager(pet: PetListItem) {
    try {
      await settingsApi.openPetFolder(pet.id);
      setStatus('Opened folder');
    } catch (error) {
      console.error(error);
      setStatus('Open failed', true);
    }
  }

  async function removePetFromManager(pet: PetListItem) {
    if (!window.confirm(`Remove "${pet.displayName}" from imported pets?`)) {
      return;
    }

    try {
      applyPetActionResult(await settingsApi.removePet(pet.id));
      setStatus(`Removed ${pet.displayName}`);
    } catch (error) {
      console.error(error);
      setStatus('Remove failed', true);
    }
  }

  function renderEventMappings() {
    if (!eventMappings) {
      return;
    }

    eventMappings.textContent = '';

    if (!currentPet || !currentSettings) {
      const note = document.createElement('p');
      note.className = 'mapping-note';
      note.textContent = 'Current pet animations will appear here.';
      eventMappings.appendChild(note);
      return;
    }

    const petKey = getPetKey(currentPet);
    const overrides = currentSettings.eventAnimationOverridesByPet?.[petKey] || {};
    const animationNames = Object.keys(currentPet.animations || {}).sort((left, right) => left.localeCompare(right));

    for (const eventDefinition of eventDefinitions) {
      const row = document.createElement('label');
      row.className = 'mapping-row';

      const text = document.createElement('span');
      const title = document.createElement('strong');
      title.textContent = eventDefinition.label;
      const help = document.createElement('small');
      const defaultAnimation = currentPet.events?.[eventDefinition.name] || 'idle';
      help.textContent = `Default: ${defaultAnimation}`;
      text.append(title, help);

      const select = document.createElement('select');
      select.dataset.eventMapping = eventDefinition.name;

      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Default';
      select.appendChild(defaultOption);

      for (const animationName of animationNames) {
        const option = document.createElement('option');
        option.value = animationName;
        option.textContent = animationName;
        select.appendChild(option);
      }

      const overrideAnimation = overrides[eventDefinition.name];
      select.value = overrideAnimation && animationNames.includes(overrideAnimation) ? overrideAnimation : '';
      row.append(text, select);
      eventMappings.appendChild(row);
    }
  }

  function readEventAnimationOverridesByPet() {
    const nextOverrides: EventAnimationOverridesByPet = {
      ...(currentSettings?.eventAnimationOverridesByPet || {})
    };

    if (!currentPet) {
      return nextOverrides;
    }

    const petKey = getPetKey(currentPet);
    const petOverrides: Record<string, string> = {};
    const selects = eventMappings.querySelectorAll<HTMLSelectElement>('select[data-event-mapping]');

    for (const select of selects) {
      const eventName = select.dataset.eventMapping;
      if (eventName && select.value) {
        petOverrides[eventName] = select.value;
      }
    }

    if (Object.keys(petOverrides).length > 0) {
      nextOverrides[petKey] = petOverrides;
    } else {
      delete nextOverrides[petKey];
    }

    return nextOverrides;
  }

  function readFormSettings(): Partial<SettingsWindowSettings> {
    return {
      keyboardActivityEnabled: fields.keyboardActivityEnabled.checked,
      mouseProximityEnabled: fields.mouseProximityEnabled.checked,
      alwaysOnTopEnabled: fields.alwaysOnTopEnabled.checked,
      launchAtLoginEnabled: fields.launchAtLoginEnabled.checked,
      proximityRadius: Number(fields.proximityRadius.value),
      keyboardReviewMs: Number(fields.keyboardReviewMs.value),
      inactivityWaitingMs: Number(fields.inactivityWaitingMs.value),
      rapidClickWindowMs: Number(fields.rapidClickWindowMs.value),
      rapidClickLimit: Number(fields.rapidClickLimit.value),
      animationFrameMsMultiplier: Number(fields.animationFrameMsMultiplier.value),
      eventAnimationOverridesByPet: readEventAnimationOverridesByPet()
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

  settingsApi.onPetData(applyPetData);
  settingsApi.onPetListData(applyPetListData);
  settingsApi.onSettingsData(applySettings);

  Promise.all([
    settingsApi.getSettingsData(),
    settingsApi.getPetData(),
    settingsApi.getPetListData()
  ])
    .then(([settings, pet, pets]) => {
      applySettings(settings);
      applyPetData(pet);
      applyPetListData(pets);
      setStatus('Ready');
    })
    .catch((error) => {
      console.error(error);
      setStatus('Load failed', true);
    });
})();
