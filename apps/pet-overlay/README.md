# Codex Pet Overlay

Tiny Electron MVP for running a Codex-style pet as a transparent desktop overlay.

## Run

```powershell
cd C:\Projects\codex-pet\apps\pet-overlay
npm install
npm start
```

If Electron install is blocked from writing to `AppData` inside a sandboxed Codex
session, use the workspace-local cache installer instead:

```powershell
npm run install:local-cache
```

Use another bundled pet:

```powershell
npm run start:scopey
npm run start:vera-reviewer
```

The app is authored in TypeScript and compiled to `dist/` before Electron runs:

```powershell
npm run build
```

## Code Layout

- `src/main.ts`: wires the Electron app, overlay window, IPC, menu, and lifecycle.
- `src/petCatalog.ts`: loads Codex-style pet packages and merges default event mappings.
- `src/screenGeometry.ts`: clamps the pet hitbox to visible monitor work areas.
- `src/stateStore.ts`: reads and writes overlay position and selected pet state.
- `src/keyboardActivityHook.ts`: starts and stops the Windows keyboard activity helper.
- `src/smokeTest.ts`: verifies the renderer API, pet element, and spritesheet load path.
- `src/renderer.ts`: runs the pet animation state machine in the overlay window.

## Controls

- Drag the pet to move it.
- Dragging is clamped to the visible work area so the overlay cannot disappear
  behind the taskbar or off-screen.
- Click the pet to trigger a short reaction.
- The transparent margin is click-through; only the pet-sized hitbox is interactive.
- Right-click the pet to open the menu.
- Choose a bundled pet from the `Pets` submenu.
- Use the pet right-click menu to close it.
- Run again to restore it at the last saved position.

## Keyboard Activity

On Windows, the app starts a small hidden PowerShell/C# helper that listens for
global keyboard activity and emits only the word `activity`. It does not emit,
store, or inspect actual key values.

Keyboard and idle states currently map like this:

- Keyboard activity: `running`
- After 1 second without keyboard input: `review`
- After 5 seconds without keyboard or mouse movement: `waiting`
- Mouse movement: `idle`

## Pet Package Format

The default package format follows the Codex pet atlas:

- `1536 x 1872` spritesheet
- `8 x 9` atlas
- `192 x 208` frame cell
- `pet.json` next to `spritesheet.webp`

Minimal Codex-compatible package:

```json
{
  "id": "vera-clear",
  "displayName": "Vera Clear",
  "description": "An AI teammate.",
  "spritesheetPath": "spritesheet.webp"
}
```

If `animations` or `events` are omitted, the app uses the Codex defaults. A pet
can override event mapping without changing the atlas layout:

```json
{
  "id": "example-pet",
  "displayName": "Example Pet",
  "spritesheetPath": "spritesheet.webp",
  "events": {
    "idle": "idle",
    "mouseNear": "jumping",
    "click": "waving",
    "dragRight": "runningRight",
    "dragLeft": "runningLeft",
    "rapidClick": "failed",
    "keyboardActive": "running",
    "keyboardPaused": "review",
    "inactive": "waiting"
  }
}
```

## Current Scope

This first pass intentionally avoids global key logging. It only renders the overlay,
tracks mouse proximity, and reacts to direct pointer interaction inside the pet window.
Keyboard activity can be added later as an explicit opt-in native hook that reports
activity only, not actual key values.
