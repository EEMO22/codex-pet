import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

import type { OverlayState } from './mainTypes';

export function configureUserData(userDataDir: string) {
  fs.mkdirSync(userDataDir, { recursive: true });
  app.setPath('userData', userDataDir);
}

export function readJson<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

export function getStatePath() {
  return path.join(app.getPath('userData'), 'overlay-state.json');
}

export function readSavedState(): OverlayState {
  return readJson<OverlayState>(getStatePath(), {});
}

export function writeSavedState(nextState: OverlayState) {
  const currentState = readSavedState();
  fs.writeFileSync(getStatePath(), JSON.stringify({ ...currentState, ...nextState }, null, 2));
}
