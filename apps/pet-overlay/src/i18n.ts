import type { AppLanguage } from './mainTypes';

type Locale = 'en' | 'ko';
type MessageValues = Record<string, string | number | boolean | null | undefined>;

const messages = {
  en: {
    windowSettingsTitle: 'Codex Pet Settings',
    menuShowPet: 'Show Pet',
    menuSettings: 'Settings',
    menuOpenPetsFolder: 'Open Pets Folder',
    menuValidatePets: 'Validate Pets',
    menuCopyDiagnostics: 'Copy Diagnostics',
    menuAlwaysOnTop: 'Always On Top',
    menuLaunchAtLogin: 'Launch at Login',
    menuClosePet: 'Close Pet',
    menuPets: 'Pets',
    menuNoPetsFound: 'No pets found',
    menuInvalidPet: '{name} (invalid)',
    menuImportPetFolder: 'Import Pet Folder',
    menuReloadCurrentPet: 'Reload Current Pet',
    menuOpenSettingsWindow: 'Open Settings Window',
    menuKeyboardActivity: 'Keyboard Activity',
    menuMouseProximity: 'Mouse Proximity',
    menuResetSettings: 'Reset Settings',
    menuResetPosition: 'Reset Position',
    dialogImportPetFolder: 'Import Pet Folder',
    noticePetAlreadyRunning: 'Pet already running.',
    noticeAlwaysOnTopOff: 'Always on top off. Use the taskbar to bring the pet back.',
    noticeAlwaysOnTopOn: 'Always on top on.',
    noticeLaunchAtLoginInstallOnly: 'Launch at login applies after install.',
    noticeLaunchAtLoginOn: 'Launch at login on.',
    noticeLaunchAtLoginOff: 'Launch at login off.',
    noticeKeyboardActivityOff: 'Keyboard activity off.',
    noticeKeyboardActivityOn: 'Keyboard activity on.',
    noticeMouseProximityOff: 'Mouse proximity off.',
    noticeMouseProximityOn: 'Mouse proximity on.',
    noticeCouldNotOpenPetsFolder: 'Could not open pets folder.',
    noticeImportedPet: 'Imported {name}.',
    noticePetAlreadyInstalled: '{name} already installed.',
    noticeCouldNotImportPetFolder: 'Could not import pet folder.',
    noticeNoCurrentPetToReload: 'No current pet to reload.',
    noticeReloadedPet: 'Reloaded {name}.',
    noticeCouldNotReloadPet: 'Could not reload {name}.',
    noticeInvalidPetPackages: '{count} invalid pet package(s).',
    noticePetWarnings: '{count} pet warning(s).',
    noticeAllPetsValid: 'All pets valid.',
    noticeDiagnosticsCopied: 'Diagnostics copied.',
    noticeCouldNotCopyDiagnostics: 'Could not copy diagnostics.',
    noticeSelectedPet: 'Selected {name}.',
    noticeCouldNotLoadPet: 'Could not load pet "{name}".',
    noticeFirstRun: 'Right-click for menu. Settings manages pets.',
    noticeRemovedPet: 'Removed {name}.',
    noticeSettingsSaved: 'Settings saved.',
    noticeSettingsReset: 'Settings reset.'
  },
  ko: {
    windowSettingsTitle: 'Codex Pet 설정',
    menuShowPet: '펫 보이기',
    menuSettings: '설정',
    menuOpenPetsFolder: '펫 폴더 열기',
    menuValidatePets: '펫 검사',
    menuCopyDiagnostics: '진단 정보 복사',
    menuAlwaysOnTop: '항상 위에 표시',
    menuLaunchAtLogin: 'Windows 시작 시 실행',
    menuClosePet: '펫 닫기',
    menuPets: '펫',
    menuNoPetsFound: '펫 없음',
    menuInvalidPet: '{name} (문제 있음)',
    menuImportPetFolder: '펫 폴더 가져오기',
    menuReloadCurrentPet: '현재 펫 다시 불러오기',
    menuOpenSettingsWindow: '설정 창 열기',
    menuKeyboardActivity: '키보드 반응',
    menuMouseProximity: '마우스 근접 반응',
    menuResetSettings: '설정 초기화',
    menuResetPosition: '위치 초기화',
    dialogImportPetFolder: '펫 폴더 가져오기',
    noticePetAlreadyRunning: '펫이 이미 실행 중이에요.',
    noticeAlwaysOnTopOff: '항상 위 표시를 껐어요. 작업표시줄에서 다시 불러올 수 있어요.',
    noticeAlwaysOnTopOn: '항상 위에 표시할게요.',
    noticeLaunchAtLoginInstallOnly: 'Windows 시작 시 실행은 설치 후 적용돼요.',
    noticeLaunchAtLoginOn: 'Windows 시작 시 실행을 켰어요.',
    noticeLaunchAtLoginOff: 'Windows 시작 시 실행을 껐어요.',
    noticeKeyboardActivityOff: '키보드 반응을 껐어요.',
    noticeKeyboardActivityOn: '키보드 반응을 켰어요.',
    noticeMouseProximityOff: '마우스 근접 반응을 껐어요.',
    noticeMouseProximityOn: '마우스 근접 반응을 켰어요.',
    noticeCouldNotOpenPetsFolder: '펫 폴더를 열 수 없어요.',
    noticeImportedPet: '{name} 펫을 가져왔어요.',
    noticePetAlreadyInstalled: '{name} 펫은 이미 설치되어 있어요.',
    noticeCouldNotImportPetFolder: '펫 폴더를 가져올 수 없어요.',
    noticeNoCurrentPetToReload: '다시 불러올 현재 펫이 없어요.',
    noticeReloadedPet: '{name} 펫을 다시 불러왔어요.',
    noticeCouldNotReloadPet: '{name} 펫을 다시 불러올 수 없어요.',
    noticeInvalidPetPackages: '문제 있는 펫 패키지가 {count}개 있어요.',
    noticePetWarnings: '펫 경고가 {count}개 있어요.',
    noticeAllPetsValid: '모든 펫이 정상이에요.',
    noticeDiagnosticsCopied: '진단 정보를 복사했어요.',
    noticeCouldNotCopyDiagnostics: '진단 정보를 복사할 수 없어요.',
    noticeSelectedPet: '{name} 펫을 선택했어요.',
    noticeCouldNotLoadPet: '"{name}" 펫을 불러올 수 없어요.',
    noticeFirstRun: '우클릭하면 메뉴가 열려요. 설정에서 펫을 관리할 수 있어요.',
    noticeRemovedPet: '{name} 펫을 삭제했어요.',
    noticeSettingsSaved: '설정을 저장했어요.',
    noticeSettingsReset: '설정을 초기화했어요.'
  }
} as const;

export type TranslationKey = keyof typeof messages.en;

export function resolveLocale(language: AppLanguage, systemLocale = ''): Locale {
  if (language === 'en' || language === 'ko') {
    return language;
  }

  return systemLocale.toLowerCase().startsWith('ko') ? 'ko' : 'en';
}

export function formatMessage(template: string, values: MessageValues = {}) {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => String(values[key] ?? ''));
}

export function createTranslator(language: AppLanguage, systemLocale = '') {
  const locale = resolveLocale(language, systemLocale);
  const dictionary = messages[locale];

  return (key: TranslationKey, values?: MessageValues) => formatMessage(dictionary[key] || messages.en[key], values);
}

