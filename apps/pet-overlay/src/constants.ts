import path from 'node:path';

import type { AppSettings, PetAnimation, PetLayout, Size } from './mainTypes';

export const PETS_ROOT = path.resolve(__dirname, '..', '..', '..', 'pets');
export const USER_DATA_DIR = path.resolve(__dirname, '..', 'tmp', 'user-data');
export const KEYBOARD_HOOK_SCRIPT = path.resolve(__dirname, '..', 'scripts', 'keyboard-activity-hook.ps1');

export const WINDOW_SIZE: Size = { width: 168, height: 188 };
export const PET_HITBOX = { width: 113, height: 122, bottom: 14 };
export const PET_EDGE_BUMPER = 5;
export const DEFAULT_PET_ID = 'vera-clear';
export const SMOKE_TEST = process.argv.includes('--smoke-test');
export const VALIDATE_PETS = process.argv.includes('--validate-pets');

export const DEFAULT_SETTINGS: AppSettings = {
  keyboardActivityEnabled: true,
  mouseProximityEnabled: true,
  alwaysOnTopEnabled: true,
  proximityRadius: 160,
  keyboardReviewMs: 1000,
  inactivityWaitingMs: 5000,
  rapidClickWindowMs: 1000,
  rapidClickLimit: 4,
  animationFrameMsMultiplier: 1
};

export const CODEX_DEFAULT_LAYOUT: PetLayout = {
  columns: 8,
  rows: 9,
  cellWidth: 192,
  cellHeight: 208
};

export const CODEX_DEFAULT_ANIMATIONS: Record<string, PetAnimation> = {
  idle: { row: 0, frames: 6 },
  runningRight: { row: 1, frames: 8 },
  runningLeft: { row: 2, frames: 8 },
  waving: { row: 3, frames: 4 },
  jumping: { row: 4, frames: 5 },
  failed: { row: 5, frames: 8 },
  waiting: { row: 6, frames: 6 },
  running: { row: 7, frames: 6 },
  review: { row: 8, frames: 6 }
};

export const DEFAULT_EVENT_MAP: Record<string, string> = {
  idle: 'idle',
  mouseNear: 'jumping',
  click: 'waving',
  dragRight: 'runningRight',
  dragLeft: 'runningLeft',
  rapidClick: 'failed',
  keyboardActive: 'running',
  keyboardPaused: 'review',
  inactive: 'waiting'
};
