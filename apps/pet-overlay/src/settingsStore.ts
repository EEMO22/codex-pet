import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

import { DEFAULT_SETTINGS } from './constants';
import type { AppSettings } from './mainTypes';
import { readJson } from './stateStore';

function getSettingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function asNumber(value: unknown, fallback: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(Math.max(Number(value), min), max);
}

function asInteger(value: unknown, fallback: number, min: number, max: number) {
  return Math.round(asNumber(value, fallback, min, max));
}

export function normalizeSettings(raw: Partial<AppSettings> | null | undefined): AppSettings {
  const source = raw && typeof raw === 'object' ? raw : {};

  return {
    keyboardActivityEnabled: asBoolean(source.keyboardActivityEnabled, DEFAULT_SETTINGS.keyboardActivityEnabled),
    mouseProximityEnabled: asBoolean(source.mouseProximityEnabled, DEFAULT_SETTINGS.mouseProximityEnabled),
    alwaysOnTopEnabled: asBoolean(source.alwaysOnTopEnabled, DEFAULT_SETTINGS.alwaysOnTopEnabled),
    proximityRadius: asInteger(source.proximityRadius, DEFAULT_SETTINGS.proximityRadius, 40, 600),
    keyboardReviewMs: asInteger(source.keyboardReviewMs, DEFAULT_SETTINGS.keyboardReviewMs, 250, 10000),
    inactivityWaitingMs: asInteger(source.inactivityWaitingMs, DEFAULT_SETTINGS.inactivityWaitingMs, 1000, 60000),
    rapidClickWindowMs: asInteger(source.rapidClickWindowMs, DEFAULT_SETTINGS.rapidClickWindowMs, 250, 5000),
    rapidClickLimit: asInteger(source.rapidClickLimit, DEFAULT_SETTINGS.rapidClickLimit, 2, 20),
    animationFrameMsMultiplier: asNumber(
      source.animationFrameMsMultiplier,
      DEFAULT_SETTINGS.animationFrameMsMultiplier,
      0.25,
      4
    )
  };
}

export function readSettings(): AppSettings {
  return normalizeSettings(readJson<Partial<AppSettings>>(getSettingsPath(), DEFAULT_SETTINGS));
}

export function writeSettings(nextSettings: Partial<AppSettings>): AppSettings {
  const settings = normalizeSettings({ ...readSettings(), ...nextSettings });
  fs.mkdirSync(path.dirname(getSettingsPath()), { recursive: true });
  fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2));
  return settings;
}

export function resetSettings(): AppSettings {
  fs.mkdirSync(path.dirname(getSettingsPath()), { recursive: true });
  fs.writeFileSync(getSettingsPath(), JSON.stringify(DEFAULT_SETTINGS, null, 2));
  return DEFAULT_SETTINGS;
}
