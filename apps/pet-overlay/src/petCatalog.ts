import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  BUILT_IN_PETS_ROOT,
  CODEX_DEFAULT_ANIMATIONS,
  CODEX_DEFAULT_LAYOUT,
  DEFAULT_EVENT_MAP,
  PETS_ROOT
} from './constants';
import type {
  ImportedPetPackage,
  ListedPet,
  PetAnimation,
  PetLayout,
  PetManifest,
  PetPackageValidation,
  PetValidationIssue,
  ResolvedPet
} from './mainTypes';
import { readJson } from './stateStore';

export class PetPackageError extends Error {
  validation: PetPackageValidation;

  constructor(validation: PetPackageValidation) {
    super(`Invalid pet package "${validation.petId}": ${formatPetIssues(validation.issues)}`);
    this.name = 'PetPackageError';
    this.validation = validation;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function addIssue(issues: PetValidationIssue[], severity: PetValidationIssue['severity'], message: string) {
  issues.push({ severity, message });
}

function mergeRecord<T extends Record<string, object>>(defaults: T, overrides: Record<string, object> | undefined): T {
  if (!overrides || typeof overrides !== 'object') {
    return defaults;
  }

  const merged = { ...defaults } as T;

  for (const [key, value] of Object.entries(overrides)) {
    if (value && typeof value === 'object') {
      merged[key as keyof T] = (defaults[key] ? { ...defaults[key], ...value } : value) as T[keyof T];
    }
  }

  return merged;
}

function mergeEventMap(
  defaults: Record<string, string>,
  overrides: Record<string, string> | undefined,
  animations: Record<string, PetAnimation>
) {
  if (!overrides || typeof overrides !== 'object') {
    return defaults;
  }

  return Object.fromEntries(
    Object.entries(defaults).map(([eventName, animationName]) => {
      const overrideName = overrides[eventName];
      return [
        eventName,
        typeof overrideName === 'string' && animations[overrideName]
          ? overrideName
          : animationName
      ];
    })
  );
}

function buildLayout(manifest: PetManifest, issues: PetValidationIssue[]) {
  const layout = { ...CODEX_DEFAULT_LAYOUT };

  if (manifest.layout !== undefined) {
    if (!isRecord(manifest.layout)) {
      addIssue(issues, 'error', '`layout` must be an object when provided.');
    } else {
      Object.assign(layout, manifest.layout);
    }
  }

  const layoutFields: Array<keyof PetLayout> = ['columns', 'rows', 'cellWidth', 'cellHeight'];
  for (const field of layoutFields) {
    const value = layout[field];
    if (!Number.isInteger(value) || value <= 0) {
      addIssue(issues, 'error', `layout.${field} must be a positive integer.`);
    }
  }

  return layout;
}

function buildAnimations(manifest: PetManifest, layout: PetLayout, issues: PetValidationIssue[]) {
  let animationOverrides: Record<string, object> | undefined;

  if (manifest.animations !== undefined) {
    if (!isRecord(manifest.animations)) {
      addIssue(issues, 'error', '`animations` must be an object when provided.');
    } else {
      animationOverrides = manifest.animations as Record<string, object>;
    }
  }

  const animations = mergeRecord(CODEX_DEFAULT_ANIMATIONS, animationOverrides);
  const maxRows = Number.isInteger(layout.rows) && layout.rows > 0 ? layout.rows : CODEX_DEFAULT_LAYOUT.rows;
  const maxColumns = Number.isInteger(layout.columns) && layout.columns > 0 ? layout.columns : CODEX_DEFAULT_LAYOUT.columns;

  for (const [animationName, animation] of Object.entries(animations)) {
    if (!Number.isInteger(animation.row)) {
      addIssue(issues, 'error', `animations.${animationName}.row must be an integer.`);
    } else if (animation.row < 0 || animation.row >= maxRows) {
      addIssue(issues, 'error', `animations.${animationName}.row must be between 0 and ${maxRows - 1}.`);
    }

    if (!Number.isInteger(animation.frames)) {
      addIssue(issues, 'error', `animations.${animationName}.frames must be an integer.`);
    } else if (animation.frames <= 0 || animation.frames > maxColumns) {
      addIssue(issues, 'error', `animations.${animationName}.frames must be between 1 and ${maxColumns}.`);
    }
  }

  return animations;
}

function validateEventMap(
  manifest: PetManifest,
  animations: Record<string, PetAnimation>,
  issues: PetValidationIssue[]
) {
  if (manifest.events === undefined) {
    return undefined;
  }

  if (!isRecord(manifest.events)) {
    addIssue(issues, 'error', '`events` must be an object when provided.');
    return undefined;
  }

  const knownEvents = new Set(Object.keys(DEFAULT_EVENT_MAP));
  const eventMap = manifest.events as Record<string, string>;

  for (const [eventName, animationName] of Object.entries(eventMap)) {
    if (!knownEvents.has(eventName)) {
      addIssue(issues, 'warning', `events.${eventName} is not used by the overlay.`);
    }

    if (!isNonEmptyString(animationName)) {
      addIssue(issues, 'error', `events.${eventName} must name an animation.`);
    } else if (!animations[animationName]) {
      addIssue(issues, 'warning', `events.${eventName} points to missing animation "${animationName}" and will use the default.`);
    }
  }

  return eventMap;
}

function getSpritesheetUrl(spritesheetPath: string) {
  const spritesheetUrl = pathToFileURL(spritesheetPath);
  const { mtimeMs } = fs.statSync(spritesheetPath);
  spritesheetUrl.searchParams.set('v', String(Math.round(mtimeMs)));
  return spritesheetUrl.toString();
}

function getPetPackageDir(petId: string) {
  return findPetPackageDir(petId) || path.join(PETS_ROOT, petId);
}

function findPetPackageDir(petId: string) {
  for (const root of getPetLibraryRoots()) {
    const packageDir = path.join(root, petId);
    if (fs.existsSync(packageDir)) {
      return packageDir;
    }
  }

  return null;
}

function getPetLibraryRoots() {
  const roots = [PETS_ROOT, BUILT_IN_PETS_ROOT];
  const seen = new Set<string>();
  return roots.filter((root) => {
    const normalizedRoot = path.resolve(root).toLowerCase();
    if (seen.has(normalizedRoot)) {
      return false;
    }

    seen.add(normalizedRoot);
    return true;
  });
}

function isSamePath(left: string, right: string) {
  return path.resolve(left).toLowerCase() === path.resolve(right).toLowerCase();
}

function isPathInside(parentDir: string, targetPath: string) {
  const relativePath = path.relative(path.resolve(parentDir), path.resolve(targetPath));
  return Boolean(relativePath) && !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
}

function getPetPackageSource(packageDir: string) {
  if (!isSamePath(PETS_ROOT, BUILT_IN_PETS_ROOT) && isPathInside(PETS_ROOT, packageDir)) {
    return 'imported' as const;
  }

  return 'builtIn' as const;
}

function canRemovePetPackage(packageDir: string) {
  return getPetPackageSource(packageDir) === 'imported' && isPathInside(PETS_ROOT, packageDir);
}

function getPetPackageEntries() {
  const entries = new Map<string, string>();

  for (const root of getPetLibraryRoots()) {
    if (!fs.existsSync(root)) {
      continue;
    }

    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (entry.isDirectory() && !entries.has(entry.name)) {
        entries.set(entry.name, path.join(root, entry.name));
      }
    }
  }

  return Array.from(entries, ([petId, packageDir]) => ({ petId, packageDir }));
}

export function validatePetPackageDirectory(petId: string, packageDir: string): PetPackageValidation {
  const manifestPath = path.join(packageDir, 'pet.json');
  const rawManifest = readJson<unknown>(manifestPath, null);
  const issues: PetValidationIssue[] = [];

  if (!isRecord(rawManifest)) {
    addIssue(issues, 'error', `Missing or invalid pet.json at ${manifestPath}.`);
    return {
      petId,
      displayName: petId,
      packageDir,
      manifestPath,
      manifest: null,
      issues,
      hasErrors: true
    };
  }

  const manifest = rawManifest as PetManifest;
  const displayName = isNonEmptyString(manifest.displayName) ? manifest.displayName : petId;

  if (manifest.id !== undefined && !isNonEmptyString(manifest.id)) {
    addIssue(issues, 'warning', '`id` should be a non-empty string when provided.');
  }

  if (manifest.displayName !== undefined && !isNonEmptyString(manifest.displayName)) {
    addIssue(issues, 'warning', '`displayName` should be a non-empty string when provided.');
  }

  if (manifest.description !== undefined && typeof manifest.description !== 'string') {
    addIssue(issues, 'warning', '`description` should be a string when provided.');
  }

  let spritesheetPath: string | undefined;
  if (!isNonEmptyString(manifest.spritesheetPath)) {
    addIssue(issues, 'error', '`spritesheetPath` is required and must be a non-empty string.');
  } else {
    if (path.isAbsolute(manifest.spritesheetPath)) {
      addIssue(issues, 'warning', '`spritesheetPath` should be relative so the pet package stays portable.');
    }

    spritesheetPath = path.resolve(path.dirname(manifestPath), manifest.spritesheetPath);
    if (!fs.existsSync(spritesheetPath)) {
      addIssue(issues, 'error', `Could not find spritesheet at ${spritesheetPath}.`);
    }
  }

  const layout = buildLayout(manifest, issues);
  const animations = buildAnimations(manifest, layout, issues);
  validateEventMap(manifest, animations, issues);

  return {
    petId,
    displayName,
    packageDir,
    manifestPath,
    spritesheetPath,
    manifest,
    issues,
    hasErrors: issues.some((issue) => issue.severity === 'error')
  };
}

export function validatePetPackage(petId: string): PetPackageValidation {
  return validatePetPackageDirectory(petId, getPetPackageDir(petId));
}

export function loadPetManifest(petId: string): ResolvedPet {
  const validation = validatePetPackage(petId);
  if (validation.hasErrors || !validation.manifest || !validation.spritesheetPath) {
    throw new PetPackageError(validation);
  }

  const manifest = validation.manifest;
  const animations = mergeRecord(CODEX_DEFAULT_ANIMATIONS, manifest.animations as Record<string, object> | undefined);

  return {
    id: isNonEmptyString(manifest.id) ? manifest.id : petId,
    packageId: petId,
    displayName: isNonEmptyString(manifest.displayName) ? manifest.displayName : petId,
    description: typeof manifest.description === 'string' ? manifest.description : '',
    spritesheetUrl: getSpritesheetUrl(validation.spritesheetPath),
    layout: { ...CODEX_DEFAULT_LAYOUT, ...manifest.layout },
    animations,
    events: mergeEventMap(DEFAULT_EVENT_MAP, manifest.events, animations)
  };
}

export function importPetPackage(sourceDir: string): ImportedPetPackage {
  const normalizedSourceDir = path.resolve(sourceDir);
  const sourcePetId = path.basename(normalizedSourceDir);
  const sourceValidation = validatePetPackageDirectory(sourcePetId, normalizedSourceDir);

  if (sourceValidation.hasErrors || !sourceValidation.manifest) {
    throw new PetPackageError(sourceValidation);
  }

  fs.mkdirSync(PETS_ROOT, { recursive: true });

  const preferredId = getPreferredImportedPetId(sourceValidation);
  const targetPetId = getUniquePetId(preferredId, normalizedSourceDir);
  const targetDir = path.join(PETS_ROOT, targetPetId);
  const copied = path.resolve(targetDir) !== normalizedSourceDir;

  if (copied) {
    fs.cpSync(normalizedSourceDir, targetDir, {
      recursive: true,
      errorOnExist: true,
      force: false,
      filter: (sourcePath) => !isIgnoredImportPath(sourcePath)
    });
  }

  const pet = loadPetManifest(targetPetId);
  return {
    pet,
    sourceDir: normalizedSourceDir,
    targetDir,
    copied
  };
}

function getPreferredImportedPetId(validation: PetPackageValidation) {
  const manifestId = validation.manifest?.id;
  return sanitizePetId(isNonEmptyString(manifestId) ? manifestId : path.basename(validation.packageDir));
}

function sanitizePetId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'imported-pet';
}

function getUniquePetId(preferredId: string, sourceDir: string) {
  const normalizedSourceDir = path.resolve(sourceDir);

  for (let index = 1; index < 1000; index += 1) {
    const petId = index === 1 ? preferredId : `${preferredId}-${index}`;
    const existingDir = findPetPackageDir(petId);

    if (!existingDir || path.resolve(existingDir) === normalizedSourceDir) {
      return petId;
    }
  }

  throw new Error(`Could not find an available pet folder name for "${preferredId}".`);
}

function isIgnoredImportPath(sourcePath: string) {
  const name = path.basename(sourcePath).toLowerCase();
  return name === 'thumbs.db' || name === '.ds_store';
}

export function listPetValidations(): PetPackageValidation[] {
  return getPetPackageEntries()
    .map((entry) => validatePetPackageDirectory(entry.petId, entry.packageDir))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function listAvailablePets(): ListedPet[] {
  return listPetValidations().map((validation) => ({
    id: validation.petId,
    displayName: validation.displayName,
    valid: !validation.hasErrors,
    source: getPetPackageSource(validation.packageDir),
    packageDir: validation.packageDir,
    canRemove: canRemovePetPackage(validation.packageDir),
    issues: validation.issues
  }));
}

export function removeImportedPetPackage(petId: string): ListedPet {
  const pet = listAvailablePets().find((candidate) => candidate.id === petId);
  if (!pet) {
    throw new Error(`Pet "${petId}" was not found.`);
  }

  if (!pet.canRemove) {
    throw new Error(`Pet "${pet.displayName}" cannot be removed from the app.`);
  }

  fs.rmSync(pet.packageDir, { recursive: true, force: false });
  return pet;
}

export function formatPetIssues(issues: PetValidationIssue[]) {
  if (!issues.length) {
    return 'No issues found.';
  }

  return issues
    .map((issue) => `[${issue.severity}] ${issue.message}`)
    .join(' ');
}
