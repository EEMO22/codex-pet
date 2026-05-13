import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  CODEX_DEFAULT_ANIMATIONS,
  CODEX_DEFAULT_LAYOUT,
  DEFAULT_EVENT_MAP,
  PETS_ROOT
} from './constants';
import type { ListedPet, PetAnimation, PetManifest, ResolvedPet } from './mainTypes';
import { readJson } from './stateStore';

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

export function loadPetManifest(petId: string): ResolvedPet {
  const manifestPath = path.join(PETS_ROOT, petId, 'pet.json');
  const manifest = readJson<PetManifest | null>(manifestPath, null);

  if (!manifest || !manifest.spritesheetPath) {
    throw new Error(`Could not load pet manifest for "${petId}" at ${manifestPath}`);
  }

  const spritesheetPath = path.resolve(path.dirname(manifestPath), manifest.spritesheetPath);
  if (!fs.existsSync(spritesheetPath)) {
    throw new Error(`Could not find spritesheet for "${petId}" at ${spritesheetPath}`);
  }

  const animations = mergeRecord(CODEX_DEFAULT_ANIMATIONS, manifest.animations);

  return {
    id: manifest.id || petId,
    displayName: manifest.displayName || petId,
    description: manifest.description || '',
    spritesheetUrl: pathToFileURL(spritesheetPath).toString(),
    layout: { ...CODEX_DEFAULT_LAYOUT, ...manifest.layout },
    animations,
    events: mergeEventMap(DEFAULT_EVENT_MAP, manifest.events, animations)
  };
}

export function listAvailablePets(): ListedPet[] {
  if (!fs.existsSync(PETS_ROOT)) {
    return [];
  }

  return fs.readdirSync(PETS_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const petId = entry.name;
      const manifest = readJson<PetManifest | null>(path.join(PETS_ROOT, petId, 'pet.json'), null);
      return {
        id: manifest?.id || petId,
        displayName: manifest?.displayName || petId
      };
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}
