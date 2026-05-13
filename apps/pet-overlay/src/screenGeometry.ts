import { screen } from 'electron';

import { PET_EDGE_BUMPER, PET_HITBOX, WINDOW_SIZE } from './constants';
import type { Point, Rect, WorkArea } from './mainTypes';

export function clamp(value: number, min: number, max: number) {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

export function clampToVisibleWorkArea(position: Point, anchorPoint?: Point) {
  const fallbackPoint = {
    x: position.x + WINDOW_SIZE.width / 2,
    y: position.y + WINDOW_SIZE.height / 2
  };
  const { workArea } = screen.getDisplayNearestPoint(anchorPoint || fallbackPoint);
  return clampToWorkArea(position, workArea);
}

export function clampToWorkArea(position: Point, workArea: WorkArea) {
  const hitboxOffset = getPetHitboxOffset();
  const minX = workArea.x + PET_EDGE_BUMPER - hitboxOffset.x;
  const minY = workArea.y + PET_EDGE_BUMPER - hitboxOffset.y;
  const maxX = workArea.x + workArea.width - PET_HITBOX.width - PET_EDGE_BUMPER - hitboxOffset.x;
  const maxY = workArea.y + workArea.height - PET_HITBOX.height - PET_EDGE_BUMPER - hitboxOffset.y;

  return toWindowPosition({
    x: clamp(position.x, minX, maxX),
    y: clamp(position.y, minY, maxY)
  });
}

export function toWindowPosition(position: Point) {
  return {
    x: Math.round(position.x),
    y: Math.round(position.y)
  };
}

export function getDragTargetDisplay(currentPosition: Point, rawPosition: Point, delta: Point, cursor: Point) {
  const currentHitbox = getPetHitboxRect(currentPosition);
  const currentDisplay = screen.getDisplayNearestPoint(getRectCenter(currentHitbox));
  const cursorDisplay = screen.getDisplayNearestPoint(cursor);

  if (cursorDisplay.id !== currentDisplay.id) {
    return cursorDisplay;
  }

  const handoffPoint = getMonitorHandoffPoint(currentDisplay.workArea, rawPosition, delta);
  if (!handoffPoint) {
    return currentDisplay;
  }

  const handoffDisplay = screen.getDisplayNearestPoint(handoffPoint);
  return handoffDisplay.id === currentDisplay.id ? currentDisplay : handoffDisplay;
}

export function getMonitorHandoffPoint(workArea: WorkArea, position: Point, delta: Point) {
  const hitbox = getPetHitboxRect(position);
  const center = getRectCenter(hitbox);

  if (delta.x > 0 && hitbox.right > workArea.x + workArea.width - PET_EDGE_BUMPER) {
    return { x: workArea.x + workArea.width + 1, y: center.y };
  }

  if (delta.x < 0 && hitbox.left < workArea.x + PET_EDGE_BUMPER) {
    return { x: workArea.x - 1, y: center.y };
  }

  if (delta.y > 0 && hitbox.bottom > workArea.y + workArea.height - PET_EDGE_BUMPER) {
    return { x: center.x, y: workArea.y + workArea.height + 1 };
  }

  if (delta.y < 0 && hitbox.top < workArea.y + PET_EDGE_BUMPER) {
    return { x: center.x, y: workArea.y - 1 };
  }

  return null;
}

export function getPetHitboxOffset() {
  return {
    x: (WINDOW_SIZE.width - PET_HITBOX.width) / 2,
    y: WINDOW_SIZE.height - PET_HITBOX.bottom - PET_HITBOX.height
  };
}

export function getPetHitboxRect(position: Point) {
  const hitboxOffset = getPetHitboxOffset();
  const left = position.x + hitboxOffset.x;
  const top = position.y + hitboxOffset.y;

  return {
    left,
    top,
    right: left + PET_HITBOX.width,
    bottom: top + PET_HITBOX.height
  };
}

export function getRectCenter(rect: Rect) {
  return {
    x: rect.left + (rect.right - rect.left) / 2,
    y: rect.top + (rect.bottom - rect.top) / 2
  };
}

export function isCursorInPetHitbox(cursor: Point, bounds: Electron.Rectangle) {
  const hitboxOffset = getPetHitboxOffset();
  const hitboxLeft = bounds.x + hitboxOffset.x;
  const hitboxTop = bounds.y + hitboxOffset.y;
  const hitboxRight = hitboxLeft + PET_HITBOX.width;
  const hitboxBottom = hitboxTop + PET_HITBOX.height;

  return (
    cursor.x >= hitboxLeft &&
    cursor.x <= hitboxRight &&
    cursor.y >= hitboxTop &&
    cursor.y <= hitboxBottom
  );
}
