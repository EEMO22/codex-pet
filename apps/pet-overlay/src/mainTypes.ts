export type Point = { x: number; y: number };
export type Size = { width: number; height: number };
export type Rect = { left: number; top: number; right: number; bottom: number };
export type WorkArea = Electron.Rectangle;

export type OverlayState = {
  x?: number;
  y?: number;
  petX?: number;
  petY?: number;
  selectedPetId?: string;
};

export type AppSettings = {
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
  eventAnimationOverridesByPet: Record<string, Record<string, string>>;
};

export type PetAnimation = {
  row: number;
  frames: number;
};

export type PetLayout = {
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
};

export type PetManifest = {
  id?: string;
  displayName?: string;
  description?: string;
  spritesheetPath?: string;
  layout?: Partial<PetLayout>;
  animations?: Record<string, Partial<PetAnimation>>;
  events?: Record<string, string>;
};

export type PetValidationSeverity = 'error' | 'warning';

export type PetValidationIssue = {
  severity: PetValidationSeverity;
  message: string;
};

export type PetPackageValidation = {
  petId: string;
  displayName: string;
  packageDir: string;
  manifestPath: string;
  spritesheetPath?: string;
  manifest: PetManifest | null;
  issues: PetValidationIssue[];
  hasErrors: boolean;
};

export type ResolvedPet = {
  id: string;
  packageId: string;
  displayName: string;
  description: string;
  spritesheetUrl: string;
  layout: PetLayout;
  animations: Record<string, PetAnimation>;
  events: Record<string, string>;
};

export type ListedPet = {
  id: string;
  displayName: string;
  valid: boolean;
  issues: PetValidationIssue[];
};

export type ImportedPetPackage = {
  pet: ResolvedPet;
  sourceDir: string;
  targetDir: string;
  copied: boolean;
};

export type OverlayLayout = {
  petOffset: Point;
};

export type OverlayFrame = OverlayLayout & {
  windowPosition: Point;
  hitboxPosition: Point;
};
