(() => {
  type EventAnimationOverridesByPet = Record<string, Record<string, string>>;
  type LanguageSetting = 'system' | 'en' | 'ko';
  type Locale = 'en' | 'ko';

  type SettingsWindowSettings = {
    language: LanguageSetting;
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
    { name: 'idle', labelKey: 'eventIdle' },
    { name: 'mouseNear', labelKey: 'eventMouseNear' },
    { name: 'click', labelKey: 'eventClick' },
    { name: 'dragRight', labelKey: 'eventDragRight' },
    { name: 'dragLeft', labelKey: 'eventDragLeft' },
    { name: 'rapidClick', labelKey: 'eventRapidClick' },
    { name: 'keyboardActive', labelKey: 'eventKeyboardActive' },
    { name: 'keyboardPaused', labelKey: 'eventKeyboardPaused' },
    { name: 'inactive', labelKey: 'eventInactive' }
  ];

  const messages = {
    en: {
      documentTitle: 'Codex Pet Settings',
      title: 'Settings',
      sectionGeneral: 'General',
      languageLabel: 'Language',
      languageSystem: 'System',
      languageEnglish: 'English',
      languageKorean: 'Korean',
      sectionInput: 'Input',
      keyboardActivityTitle: 'Keyboard Activity',
      keyboardActivityHelp: 'React when typing is detected.',
      mouseProximityTitle: 'Mouse Proximity',
      mouseProximityHelp: 'React when the pointer is nearby.',
      alwaysOnTopTitle: 'Always On Top',
      alwaysOnTopHelp: 'Keep the pet above normal windows.',
      launchAtLoginTitle: 'Launch at Login',
      launchAtLoginHelp: 'Start the pet when you sign in to Windows.',
      sectionTiming: 'Timing',
      proximityRadius: 'Proximity Radius',
      keyboardReviewDelay: 'Keyboard Review Delay',
      waitingDelay: 'Waiting Delay',
      rapidClickWindow: 'Rapid Click Window',
      rapidClickLimit: 'Rapid Click Limit',
      animationSpeedMultiplier: 'Animation Speed Multiplier',
      sectionPetManager: 'Pet Manager',
      sectionEventAnimations: 'Event Animations',
      reset: 'Reset',
      save: 'Save',
      imported: 'Imported',
      builtIn: 'Built-in',
      invalidPetPackage: 'Invalid pet package',
      noPetPackagesFound: 'No pet packages found.',
      current: 'Current',
      invalid: 'Invalid',
      use: 'Use',
      open: 'Open',
      remove: 'Remove',
      removeImportedPetTitle: 'Remove imported pet',
      builtInCannotRemoveTitle: 'Built-in pets cannot be removed here',
      selectedPet: 'Selected {name}',
      selectFailed: 'Select failed',
      openedFolder: 'Opened folder',
      openFailed: 'Open failed',
      removeConfirm: 'Remove "{name}" from imported pets?',
      removedPet: 'Removed {name}',
      removeFailed: 'Remove failed',
      currentPetAnimationsPlaceholder: 'Current pet animations will appear here.',
      defaultAnimation: 'Default: {name}',
      defaultOption: 'Default',
      saved: 'Saved',
      saveFailed: 'Save failed',
      resetStatus: 'Reset',
      resetFailed: 'Reset failed',
      ready: 'Ready',
      loadFailed: 'Load failed',
      eventIdle: 'Idle',
      eventMouseNear: 'Mouse Near',
      eventClick: 'Click',
      eventDragRight: 'Drag Right',
      eventDragLeft: 'Drag Left',
      eventRapidClick: 'Rapid Click',
      eventKeyboardActive: 'Keyboard Active',
      eventKeyboardPaused: 'Keyboard Paused',
      eventInactive: 'Inactive'
    },
    ko: {
      documentTitle: 'Codex Pet 설정',
      title: '설정',
      sectionGeneral: '일반',
      languageLabel: '언어',
      languageSystem: '시스템 설정',
      languageEnglish: 'English',
      languageKorean: '한국어',
      sectionInput: '입력',
      keyboardActivityTitle: '키보드 반응',
      keyboardActivityHelp: '타이핑이 감지되면 반응해요.',
      mouseProximityTitle: '마우스 근접 반응',
      mouseProximityHelp: '포인터가 가까이 오면 반응해요.',
      alwaysOnTopTitle: '항상 위에 표시',
      alwaysOnTopHelp: '일반 창보다 위에 펫을 둬요.',
      launchAtLoginTitle: 'Windows 시작 시 실행',
      launchAtLoginHelp: 'Windows에 로그인하면 펫을 자동으로 시작해요.',
      sectionTiming: '타이밍',
      proximityRadius: '근접 반응 거리',
      keyboardReviewDelay: '키보드 멈춤 전환 시간',
      waitingDelay: '대기 전환 시간',
      rapidClickWindow: '연속 클릭 판정 시간',
      rapidClickLimit: '연속 클릭 횟수',
      animationSpeedMultiplier: '애니메이션 속도 배율',
      sectionPetManager: '펫 관리',
      sectionEventAnimations: '이벤트 애니메이션',
      reset: '초기화',
      save: '저장',
      imported: '가져온 펫',
      builtIn: '기본 펫',
      invalidPetPackage: '문제 있는 펫 패키지',
      noPetPackagesFound: '펫 패키지가 없어요.',
      current: '현재',
      invalid: '문제 있음',
      use: '사용',
      open: '열기',
      remove: '삭제',
      removeImportedPetTitle: '가져온 펫 삭제',
      builtInCannotRemoveTitle: '기본 펫은 여기서 삭제할 수 없어요',
      selectedPet: '{name} 선택됨',
      selectFailed: '선택 실패',
      openedFolder: '폴더를 열었어요',
      openFailed: '열기 실패',
      removeConfirm: '가져온 펫 "{name}"을 삭제할까요?',
      removedPet: '{name} 삭제됨',
      removeFailed: '삭제 실패',
      currentPetAnimationsPlaceholder: '현재 펫의 애니메이션이 여기에 표시돼요.',
      defaultAnimation: '기본값: {name}',
      defaultOption: '기본값',
      saved: '저장됨',
      saveFailed: '저장 실패',
      resetStatus: '초기화됨',
      resetFailed: '초기화 실패',
      ready: '준비됨',
      loadFailed: '불러오기 실패',
      eventIdle: '기본',
      eventMouseNear: '마우스 근접',
      eventClick: '클릭',
      eventDragRight: '오른쪽 드래그',
      eventDragLeft: '왼쪽 드래그',
      eventRapidClick: '연속 클릭',
      eventKeyboardActive: '키보드 입력 중',
      eventKeyboardPaused: '키보드 멈춤',
      eventInactive: '비활성'
    }
  } as const;

  type MessageKey = keyof typeof messages.en;

  const settingsApi = (window as unknown as { petOverlay: SettingsWindowApi }).petOverlay;
  const form = document.getElementById('settings-form') as HTMLFormElement;
  const status = document.getElementById('status') as HTMLDivElement;
  const resetButton = document.getElementById('reset') as HTMLButtonElement;
  const petManager = document.getElementById('petManager') as HTMLDivElement;
  const eventMappings = document.getElementById('eventMappings') as HTMLDivElement;

  const fields = {
    language: document.getElementById('language') as HTMLSelectElement,
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

  function resolveLocale(language: LanguageSetting | undefined): Locale {
    if (language === 'en' || language === 'ko') {
      return language;
    }

    return navigator.language.toLowerCase().startsWith('ko') ? 'ko' : 'en';
  }

  function formatMessage(template: string, values: Record<string, string | number> = {}) {
    return template.replace(/\{(\w+)\}/g, (_match, key: string) => String(values[key] ?? ''));
  }

  function t(key: MessageKey, values?: Record<string, string | number>) {
    const locale = resolveLocale(currentSettings?.language || (fields.language.value as LanguageSetting));
    return formatMessage(messages[locale][key] || messages.en[key], values);
  }

  function localizeStaticText() {
    const locale = resolveLocale(currentSettings?.language || (fields.language.value as LanguageSetting));
    document.documentElement.lang = locale;
    document.title = t('documentTitle');

    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
      const key = element.dataset.i18n as MessageKey | undefined;
      if (key) {
        element.textContent = t(key);
      }
    });

    fields.language.options[0].textContent = t('languageSystem');
    fields.language.options[1].textContent = t('languageEnglish');
    fields.language.options[2].textContent = t('languageKorean');
  }

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
    fields.language.value = settings.language || 'system';
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
    localizeStaticText();
    renderPetManager();
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
      return pet.source === 'imported' ? t('imported') : t('builtIn');
    }

    return pet.issues?.[0]?.message || t('invalidPetPackage');
  }

  function renderPetManager() {
    if (!petManager) {
      return;
    }

    petManager.textContent = '';

    if (!currentPetList.length) {
      const note = document.createElement('p');
      note.className = 'mapping-note';
      note.textContent = t('noPetPackagesFound');
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
        badge.textContent = pet.valid ? t('current') : t('invalid');
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
      useButton.textContent = t('use');
      useButton.disabled = !pet.valid || pet.selected;
      useButton.addEventListener('click', () => selectPetFromManager(pet));

      const openButton = document.createElement('button');
      openButton.type = 'button';
      openButton.className = 'secondary';
      openButton.textContent = t('open');
      openButton.addEventListener('click', () => openPetFromManager(pet));

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'secondary';
      removeButton.textContent = t('remove');
      removeButton.disabled = !pet.canRemove;
      removeButton.title = pet.canRemove ? t('removeImportedPetTitle') : t('builtInCannotRemoveTitle');
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
      setStatus(t('selectedPet', { name: pet.displayName }));
    } catch (error) {
      console.error(error);
      setStatus(t('selectFailed'), true);
    }
  }

  async function openPetFromManager(pet: PetListItem) {
    try {
      await settingsApi.openPetFolder(pet.id);
      setStatus(t('openedFolder'));
    } catch (error) {
      console.error(error);
      setStatus(t('openFailed'), true);
    }
  }

  async function removePetFromManager(pet: PetListItem) {
    if (!window.confirm(t('removeConfirm', { name: pet.displayName }))) {
      return;
    }

    try {
      applyPetActionResult(await settingsApi.removePet(pet.id));
      setStatus(t('removedPet', { name: pet.displayName }));
    } catch (error) {
      console.error(error);
      setStatus(t('removeFailed'), true);
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
      note.textContent = t('currentPetAnimationsPlaceholder');
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
      title.textContent = t(eventDefinition.labelKey as MessageKey);
      const help = document.createElement('small');
      const defaultAnimation = currentPet.events?.[eventDefinition.name] || 'idle';
      help.textContent = t('defaultAnimation', { name: defaultAnimation });
      text.append(title, help);

      const select = document.createElement('select');
      select.dataset.eventMapping = eventDefinition.name;

      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = t('defaultOption');
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
      language: fields.language.value as LanguageSetting,
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
      setStatus(t('saved'));
      window.setTimeout(() => {
        settingsApi.closeSettingsWindow();
      }, 120);
    } catch (error) {
      console.error(error);
      setStatus(t('saveFailed'), true);
    }
  });

  resetButton.addEventListener('click', async () => {
    try {
      applySettings(await settingsApi.resetSettingsData());
      setStatus(t('resetStatus'));
    } catch (error) {
      console.error(error);
      setStatus(t('resetFailed'), true);
    }
  });

  fields.language.addEventListener('change', () => {
    if (currentSettings) {
      currentSettings = {
        ...currentSettings,
        language: fields.language.value as LanguageSetting
      };
    }
    localizeStaticText();
    renderPetManager();
    renderEventMappings();
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
      setStatus(t('ready'));
    })
    .catch((error) => {
      console.error(error);
      setStatus(t('loadFailed'), true);
    });
})();
