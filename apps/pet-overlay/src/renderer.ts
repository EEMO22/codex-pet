const petElement = document.getElementById('pet');
const bubbleElement = document.getElementById('bubble');
(window as unknown as Record<string, unknown>).__codexPetRendererLoaded = true;

type DragDelta = { x: number; y: number };
type PetAnimation = {
  row: number;
  frames: number;
  frameMs?: number;
  loop?: boolean;
  holdLast?: boolean;
};
type InteractionState = Required<Pick<PetAnimation, 'row' | 'frames' | 'frameMs'>> & {
  loop?: boolean;
  holdLast?: boolean;
};
type PetData = {
  id: string;
  packageId: string;
  displayName: string;
  spritesheetUrl: string;
  layout: {
    columns: number;
    rows: number;
  };
  animations: Record<string, PetAnimation>;
  events: Record<string, string>;
};
type ProximityState = {
  near: boolean;
  distance: number;
};
type Point = {
  x: number;
  y: number;
};
type OverlayLayout = {
  petOffset: Point;
};
type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  moved: boolean;
};
type AppSettings = {
  keyboardActivityEnabled: boolean;
  mouseProximityEnabled: boolean;
  alwaysOnTopEnabled: boolean;
  proximityRadius: number;
  keyboardReviewMs: number;
  inactivityWaitingMs: number;
  rapidClickWindowMs: number;
  rapidClickLimit: number;
  animationFrameMsMultiplier: number;
  eventAnimationOverridesByPet: Record<string, Record<string, string>>;
};

type PetOverlayApi = {
  moveBy(delta: DragDelta): Promise<void>;
  setDragging(dragging: boolean): void;
  showMenu(): void;
  tuckAway(): void;
  onPetData(callback: (pet: PetData) => void): void;
  onProximity(callback: (state: ProximityState) => void): void;
  onTyping(callback: () => void): void;
  onMouseActivity(callback: () => void): void;
  onPetNotice(callback: (notice: { message?: string }) => void): void;
  onOverlayLayout(callback: (layout: OverlayLayout) => void): void;
  getPetData(): Promise<PetData | null>;
  onSettingsData(callback: (settings: AppSettings) => void): void;
  getSettingsData(): Promise<AppSettings>;
};

const overlayApi = (window as unknown as { petOverlay: PetOverlayApi }).petOverlay;

const atlas = {
  columns: 8,
  rows: 9,
  currentFrame: 0,
  currentRow: 0
};

const defaultSettings: AppSettings = {
  keyboardActivityEnabled: true,
  mouseProximityEnabled: true,
  alwaysOnTopEnabled: true,
  proximityRadius: 160,
  keyboardReviewMs: 1000,
  inactivityWaitingMs: 5000,
  rapidClickWindowMs: 1000,
  rapidClickLimit: 4,
  animationFrameMsMultiplier: 1,
  eventAnimationOverridesByPet: {}
};

let states: Record<string, InteractionState> = {
  idle: { row: 0, frames: 6, frameMs: 360 },
  watch: { row: 4, frames: 5, frameMs: 240 },
  react: { row: 3, frames: 4, frameMs: 240, loop: false },
  dragRight: { row: 1, frames: 8, frameMs: 190 },
  dragLeft: { row: 2, frames: 8, frameMs: 190 },
  failed: { row: 5, frames: 8, frameMs: 240, holdLast: true },
  typing: { row: 7, frames: 6, frameMs: 240 },
  review: { row: 8, frames: 6, frameMs: 240 },
  waiting: { row: 6, frames: 6, frameMs: 240 }
};

let stateName = 'idle';
let dragState: DragState | null = null;
let reactionTimer: number | null = null;
let bubbleTimer: number | null = null;
let frameTimer: number | null = null;
let keyboardReviewTimer: number | null = null;
let inactivityTimer: number | null = null;
let pendingDragDelta = { x: 0, y: 0 };
let dragMoveFrame: number | null = null;
let clickTimes = [];
let failedLocked = false;
let suppressWatchUntilExit = false;
let currentPetData: PetData | null = null;
let overlaySettings = defaultSettings;
let currentPetOffset: Point = { x: 104, y: 88 };

const DRAG_THRESHOLD_PX = 5;
const BUBBLE_GAP_PX = 12;
const BUBBLE_MARGIN_PX = 8;

function assertElement<T extends HTMLElement>(element: T | null, id: string): T {
  if (!element) {
    throw new Error(`Missing #${id}`);
  }

  return element;
}

const petButton = assertElement(petElement, 'pet');
const bubble = assertElement(bubbleElement, 'bubble');

function clamp(value: number, min: number, max: number) {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

function setFrame(row: number, frame: number) {
  const x = atlas.columns === 1 ? 0 : (frame / (atlas.columns - 1)) * 100;
  const y = atlas.rows === 1 ? 0 : (row / (atlas.rows - 1)) * 100;

  petButton.style.backgroundPosition = `${x}% ${y}%`;
}

function queueNextFrame(delay: number) {
  if (frameTimer !== null) {
    clearTimeout(frameTimer);
  }
  frameTimer = window.setTimeout(tick, delay);
}

function setState(nextState: string) {
  if (!states[nextState] || stateName === nextState) {
    return;
  }

  stateName = nextState;
  atlas.currentFrame = 0;
  atlas.currentRow = states[nextState].row;

  petButton.classList.toggle('is-near', nextState === 'watch');
  setFrame(atlas.currentRow, atlas.currentFrame);
  queueNextFrame(states[nextState].frameMs);
}

function showBubble(text: string, duration = 900) {
  bubble.textContent = text;
  positionBubble();
  bubble.classList.add('is-visible');
  window.requestAnimationFrame(positionBubble);

  if (bubbleTimer !== null) {
    clearTimeout(bubbleTimer);
  }
  bubbleTimer = window.setTimeout(() => {
    bubble.classList.remove('is-visible');
  }, duration);
}

function applyOverlayLayout(layout: OverlayLayout | null) {
  if (!layout || !Number.isFinite(layout.petOffset?.x) || !Number.isFinite(layout.petOffset?.y)) {
    return;
  }

  currentPetOffset = {
    x: Math.round(layout.petOffset.x),
    y: Math.round(layout.petOffset.y)
  };
  document.documentElement.style.setProperty('--pet-offset-x', `${currentPetOffset.x}px`);
  document.documentElement.style.setProperty('--pet-offset-y', `${currentPetOffset.y}px`);
  positionBubble();
}

function positionBubble() {
  if (!bubble.textContent) {
    return;
  }

  const petWidth = petButton.offsetWidth;
  const petHeight = petButton.offsetHeight;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const maxBubbleWidth = Math.max(42, viewportWidth - BUBBLE_MARGIN_PX * 2);
  bubble.style.maxWidth = `${maxBubbleWidth}px`;

  const bubbleWidth = bubble.offsetWidth;
  const bubbleHeight = bubble.offsetHeight;
  const petCenterX = currentPetOffset.x + petWidth / 2;
  const preferredLeft = petCenterX - bubbleWidth / 2;
  const left = clamp(preferredLeft, BUBBLE_MARGIN_PX, viewportWidth - BUBBLE_MARGIN_PX - bubbleWidth);
  let top = currentPetOffset.y - BUBBLE_GAP_PX - bubbleHeight;
  let isBelow = false;

  if (top < BUBBLE_MARGIN_PX) {
    top = currentPetOffset.y + petHeight + BUBBLE_GAP_PX;
    isBelow = true;
  }

  top = clamp(top, BUBBLE_MARGIN_PX, viewportHeight - BUBBLE_MARGIN_PX - bubbleHeight);

  bubble.style.left = `${Math.round(left)}px`;
  bubble.style.top = `${Math.round(top)}px`;
  bubble.style.setProperty(
    '--bubble-tail-left',
    `${Math.round(clamp(petCenterX - left, 10, bubbleWidth - 10))}px`
  );
  bubble.classList.toggle('is-below', isBelow);
}

function react() {
  if (reactionTimer !== null) {
    clearTimeout(reactionTimer);
  }
  suppressWatchUntilExit = true;
  petButton.classList.remove('is-near');
  setState('react');
  setFrame(states.react.row, 0);
  showBubble('ready');

  reactionTimer = window.setTimeout(() => {
    setState('idle');
  }, getAnimationDuration('react'));
}

function failAndHold() {
  if (reactionTimer !== null) {
    clearTimeout(reactionTimer);
  }
  clearKeyboardReviewTimer();
  petButton.classList.remove('is-near');
  failedLocked = true;
  setState('failed');
  showBubble('oops', 900);
}

function isPriorityInteractionActive() {
  return stateName === 'react' || stateName === 'failed' || stateName === 'dragRight' || stateName === 'dragLeft';
}

function clearKeyboardReviewTimer() {
  if (keyboardReviewTimer !== null) {
    clearTimeout(keyboardReviewTimer);
  }
  keyboardReviewTimer = null;
}

function resetInactivityTimer() {
  if (inactivityTimer !== null) {
    clearTimeout(inactivityTimer);
  }
  inactivityTimer = window.setTimeout(() => {
    if (!isPriorityInteractionActive()) {
      clearKeyboardReviewTimer();
      setState('waiting');
    }
  }, overlaySettings.inactivityWaitingMs);
}

function showKeyboardActivity() {
  if (isPriorityInteractionActive()) {
    return;
  }

  suppressWatchUntilExit = false;
  setState('typing');
  clearKeyboardReviewTimer();
  keyboardReviewTimer = window.setTimeout(() => {
    if (stateName === 'typing') {
      setState('review');
    }
  }, overlaySettings.keyboardReviewMs);
  resetInactivityTimer();
}

function showMouseActivity() {
  if (isPriorityInteractionActive()) {
    return;
  }

  const wokeFromPassiveState = stateName === 'typing' || stateName === 'review' || stateName === 'waiting';
  clearKeyboardReviewTimer();
  setState('idle');
  suppressWatchUntilExit = wokeFromPassiveState;
  resetInactivityTimer();
}

function handleClick() {
  const now = Date.now();

  if (stateName === 'failed') {
    if (failedLocked) {
      return;
    }

    clickTimes = [];
    react();
    return;
  }

  clickTimes = clickTimes.filter((time) => now - time <= overlaySettings.rapidClickWindowMs);
  clickTimes.push(now);

  if (clickTimes.length >= overlaySettings.rapidClickLimit) {
    clickTimes = [];
    failAndHold();
    return;
  }

  if (stateName === 'react') {
    return;
  }

  react();
}

function getAnimationDuration(targetState: string) {
  const state = states[targetState];
  return state.frames * state.frameMs;
}

function buildInteractionStates(pet: PetData): Record<string, InteractionState> {
  return {
    idle: withTiming(resolveEventAnimation(pet, 'idle', 'idle'), 360),
    watch: withTiming(resolveEventAnimation(pet, 'mouseNear', 'jumping'), 240),
    react: withTiming(resolveEventAnimation(pet, 'click', 'waving'), 240, { loop: false }),
    dragRight: withTiming(resolveEventAnimation(pet, 'dragRight', 'runningRight'), 190),
    dragLeft: withTiming(resolveEventAnimation(pet, 'dragLeft', 'runningLeft'), 190),
    failed: withTiming(resolveEventAnimation(pet, 'rapidClick', 'failed'), 240, { holdLast: true }),
    typing: withTiming(resolveEventAnimation(pet, 'keyboardActive', 'running'), 240),
    review: withTiming(resolveEventAnimation(pet, 'keyboardPaused', 'review'), 240),
    waiting: withTiming(resolveEventAnimation(pet, 'inactive', 'waiting'), 240)
  };
}

function resolveEventAnimation(pet: PetData, eventName: string, fallbackName: string) {
  const petKey = pet.packageId || pet.id;
  const eventOverrides = overlaySettings.eventAnimationOverridesByPet?.[petKey] || {};
  const baseAnimationName = pet.events?.[eventName] || fallbackName;
  const overrideAnimationName = eventOverrides[eventName];
  const animationName = overrideAnimationName && pet.animations[overrideAnimationName]
    ? overrideAnimationName
    : baseAnimationName;

  return pet.animations[animationName] || pet.animations[baseAnimationName] || pet.animations[fallbackName];
}

function withTiming(animation: PetAnimation, frameMs: number, flags: Partial<PetAnimation> = {}): InteractionState {
  return { ...animation, frameMs: scaleFrameMs(frameMs), ...flags };
}

function scaleFrameMs(frameMs: number) {
  return Math.max(16, Math.round(frameMs * overlaySettings.animationFrameMsMultiplier));
}

function tick() {
  const state = states[stateName];
  const lastFrame = state.frames - 1;
  const shouldHoldLast = state.holdLast || state.loop === false;

  if (shouldHoldLast && atlas.currentFrame >= lastFrame) {
    if (stateName === 'failed') {
      failedLocked = false;
    }

    setFrame(state.row, lastFrame);
    queueNextFrame(state.frameMs);
    return;
  }

  atlas.currentFrame = shouldHoldLast
    ? Math.min(atlas.currentFrame + 1, lastFrame)
    : (atlas.currentFrame + 1) % state.frames;
  setFrame(state.row, atlas.currentFrame);
  queueNextFrame(state.frameMs);
}

function queueDragMove(delta: DragDelta) {
  pendingDragDelta.x += delta.x;
  pendingDragDelta.y += delta.y;

  if (dragMoveFrame !== null) {
    return;
  }

  dragMoveFrame = requestAnimationFrame(flushDragMove);
}

function flushDragMove() {
  dragMoveFrame = null;

  if (pendingDragDelta.x === 0 && pendingDragDelta.y === 0) {
    return;
  }

  const delta = {
    x: pendingDragDelta.x,
    y: pendingDragDelta.y
  };
  pendingDragDelta = { x: 0, y: 0 };
  overlayApi.moveBy(delta);
}

function cancelQueuedDragMove() {
  if (dragMoveFrame !== null) {
    cancelAnimationFrame(dragMoveFrame);
    dragMoveFrame = null;
  }

  pendingDragDelta = { x: 0, y: 0 };
}

petButton.addEventListener('pointerdown', (event) => {
  petButton.setPointerCapture(event.pointerId);
  overlayApi.setDragging(true);
  dragState = {
    pointerId: event.pointerId,
    startX: event.screenX,
    startY: event.screenY,
    x: event.screenX,
    y: event.screenY,
    moved: false
  };
});

petButton.addEventListener('pointermove', (event) => {
  if (!dragState || dragState.pointerId !== event.pointerId) {
    return;
  }

  const delta = {
    x: event.screenX - dragState.x,
    y: event.screenY - dragState.y
  };
  const totalDistance = Math.hypot(
    event.screenX - dragState.startX,
    event.screenY - dragState.startY
  );

  if (totalDistance >= DRAG_THRESHOLD_PX) {
    const moveDelta = dragState.moved
      ? delta
      : {
          x: event.screenX - dragState.startX,
          y: event.screenY - dragState.startY
        };

    dragState.moved = true;
    if (stateName !== 'failed') {
      if (moveDelta.x > 0) {
        setState('dragRight');
      } else if (moveDelta.x < 0) {
        setState('dragLeft');
      }
    }
    queueDragMove(moveDelta);
    dragState.x = event.screenX;
    dragState.y = event.screenY;
  }
});

petButton.addEventListener('pointerup', (event) => {
  if (dragState && dragState.pointerId === event.pointerId && !dragState.moved) {
    handleClick();
  } else if (stateName !== 'failed') {
    flushDragMove();
    setState('idle');
  }

  dragState = null;
  overlayApi.setDragging(false);
});

petButton.addEventListener('lostpointercapture', () => {
  if (!dragState) {
    return;
  }

  dragState = null;
  flushDragMove();
  cancelQueuedDragMove();
  overlayApi.setDragging(false);
  if (stateName !== 'failed' && stateName !== 'react') {
    setState('idle');
  }
});

window.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  overlayApi.showMenu();
});

function applyPetData(pet: PetData | null) {
  if (!pet) {
    return;
  }

  currentPetData = pet;
  atlas.columns = pet.layout.columns;
  atlas.rows = pet.layout.rows;
  states = buildInteractionStates(pet);
  petButton.style.backgroundImage = `url("${pet.spritesheetUrl}")`;
  petButton.setAttribute('aria-label', pet.displayName);
  showBubble(pet.displayName, 1200);
  setFrame(0, 0);
}

function applySettings(settings: AppSettings | null) {
  if (!settings) {
    return;
  }

  overlaySettings = { ...defaultSettings, ...settings };

  if (currentPetData) {
    states = buildInteractionStates(currentPetData);
    queueNextFrame(states[stateName].frameMs);
  }

  resetInactivityTimer();
}

overlayApi.onPetData((pet) => {
  applyPetData(pet);
});

overlayApi.onSettingsData((settings) => {
  applySettings(settings);
});

overlayApi.onProximity(({ near }) => {
  if (suppressWatchUntilExit) {
    if (near) {
      return;
    }

    suppressWatchUntilExit = false;
  }

  if (
    stateName === 'react' ||
    stateName === 'dragRight' ||
    stateName === 'dragLeft' ||
    stateName === 'failed' ||
    stateName === 'typing' ||
    stateName === 'review' ||
    stateName === 'waiting'
  ) {
    return;
  }

  setState(near ? 'watch' : 'idle');
});

overlayApi.onTyping(() => {
  showKeyboardActivity();
});

overlayApi.onMouseActivity(() => {
  showMouseActivity();
});

overlayApi.onPetNotice((notice) => {
  showBubble(notice.message || 'pet notice', 1800);
});

overlayApi.onOverlayLayout((layout) => {
  applyOverlayLayout(layout);
});

window.addEventListener('resize', () => {
  positionBubble();
});

overlayApi.getPetData().then(applyPetData).catch((error) => {
  console.error('Failed to load pet data', error);
});

overlayApi.getSettingsData().then(applySettings).catch((error) => {
  console.error('Failed to load settings data', error);
});

queueNextFrame(states[stateName].frameMs);
resetInactivityTimer();

