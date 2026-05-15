# Codex Pet Overlay

Tiny Electron MVP for running a Codex-style pet as a transparent desktop overlay.

## Install

Download one of the Windows release artifacts:

- `Codex Pet Overlay-0.1.0-x64.exe`: installer for normal use.
- `Codex Pet Overlay-0.1.0-x64.zip`: zip version for people who do not want to install.

Installer:

1. Run `Codex Pet Overlay-0.1.0-x64.exe`.
2. Follow the installer.
3. Launch `Codex Pet Overlay` from the Start menu or desktop shortcut.

Zip:

1. Extract `Codex Pet Overlay-0.1.0-x64.zip` to a folder.
2. Open the extracted `win-unpacked` folder.
3. Run `Codex Pet Overlay.exe`.

Do not move only the `.exe` out of the extracted folder. The surrounding files
are part of the app. The generated artifacts are currently unsigned, so Windows
SmartScreen or local application control policy may ask for confirmation before
launching.

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

## Package

Build an unpacked Windows app for local verification:

```powershell
npm run package:win
```

The unpacked executable is written under a timestamped folder:

```text
apps/pet-overlay/out/unpacked-YYYYMMDD-HHMMSS/win-unpacked/Codex Pet Overlay.exe
```

Build distributable Windows artifacts:

```powershell
npm run dist:win
```

This is configured to emit an NSIS installer and a zip file under a timestamped
`apps/pet-overlay/out/dist-YYYYMMDD-HHMMSS/` folder. Timestamped output folders
keep repeated builds from failing when Windows temporarily keeps a previous
unpacked `app.asar` locked. Packaging uses workspace-local Electron caches under
`apps/pet-overlay/tmp/` so it does not need to write to the default `AppData`
Electron cache during local builds.

The generated artifacts are currently unsigned. Depending on local Windows
application control or SmartScreen policy, a freshly built unpacked executable
may need an allow/trust action before it can be launched directly.

Bundled pets are packaged from the repo-level `pets/` folder into app resources.
In packaged builds, imported user pets are stored in Electron `userData/pets`
instead of the installation directory.

The Windows app icon is generated from the default Vera pet frame:

```powershell
npm run generate:icon
```

## Code Layout

- `src/main.ts`: wires the Electron app, overlay window, IPC, menu, and lifecycle.
- `src/petCatalog.ts`: loads Codex-style pet packages and merges default event mappings.
- `src/screenGeometry.ts`: clamps the pet hitbox and overlay frame to visible monitor work areas.
- `src/stateStore.ts`: reads and writes overlay position and selected pet state.
- `src/settingsStore.ts`: reads, validates, resets, and writes runtime settings.
- `src/keyboardActivityHook.ts`: starts and stops the Windows keyboard activity helper.
- `src/smokeTest.ts`: verifies the renderer API, pet element, and spritesheet load path.
- `src/renderer.ts`: runs the pet animation state machine in the overlay window.
- `src/settingsRenderer.ts`: runs the settings window form.
- `scripts/generate-icon.mjs`: generates PNG/ICO app icons from the default pet frame.
- The tray icon uses the generated `assets/icon-16.png`.

## Controls

- Drag the pet to move it.
- Dragging is clamped to the visible work area so the overlay cannot disappear
  behind the taskbar or off-screen.
- Click the pet to trigger a short reaction.
- The transparent margin is click-through; only the pet-sized hitbox is interactive.
- Right-click the pet to open the menu.
- Use the tray icon to show the pet, open settings, open the pets folder, validate pets, or close the app.
- Choose a bundled pet from the `Pets` submenu.
- Use `Import Pet Folder` to copy a Codex-style pet folder into `pets/` and select it.
- Use `Open Pets Folder` to add or edit pet packages.
- Use `Reload Current Pet` after editing the current pet's manifest or spritesheet.
- Use `Validate Pets` to check installed pet packages without leaving the overlay.
- Use `Settings` to toggle keyboard activity, mouse proximity, and always-on-top behavior.
- Use `Settings > Open Settings Window` to edit timing and interaction values.
- Use the pet right-click menu to close it.
- Run again to restore it at the last saved position.
- Launching the app again while it is already running brings the existing pet
  overlay forward instead of creating another pet.

## Settings

Runtime settings are stored in Electron `userData` as `settings.json`. During
local development this is:

```text
apps/pet-overlay/tmp/user-data/settings.json
```

The app validates the file and falls back to defaults for missing or invalid
fields. Current settings include:

- `keyboardActivityEnabled`
- `mouseProximityEnabled`
- `alwaysOnTopEnabled`
- `launchAtLoginEnabled`
- `proximityRadius`
- `keyboardReviewMs`
- `inactivityWaitingMs`
- `rapidClickWindowMs`
- `rapidClickLimit`
- `animationFrameMsMultiplier`

The settings window edits the same file and applies changes immediately after
save. `Save` closes the settings window, and `Reset` restores the built-in
defaults. When always-on-top is disabled, the pet is shown in the taskbar so it
can be brought forward again.

`Launch at Login` registers the packaged app to start when you sign in to
Windows. During local development it is saved in settings, but the OS login item
is not changed.

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

Validate all installed pet folders before launching:

```powershell
npm run validate:pets
```

The validator checks that:

- `pet.json` exists and is valid JSON.
- `spritesheetPath` is present and points to an existing image.
- `layout` values are positive integers.
- `animations` rows and frame counts fit inside the atlas.
- `events` point to known animation names, falling back to defaults with a warning when possible.

Invalid pets are shown as disabled entries in the right-click `Pets` menu. If the
saved startup pet is invalid, the app logs the validation errors and falls back
to the default pet.

`Import Pet Folder` expects a folder containing `pet.json` and the referenced
spritesheet. The app validates the source first, copies it without overwriting
existing pet folders, then switches to the imported pet.

## Current Scope

The keyboard activity helper reports activity only. It does not emit, store, or
inspect actual key values.
