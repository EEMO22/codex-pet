# Patch Notes

## 2026-05-15 - Settings Window

- Added a dedicated settings window opened from `Settings > Open Settings Window`.
- Added form controls for keyboard activity, mouse proximity, always-on-top, proximity radius, idle timing, rapid-click timing, and animation timing.
- Added settings save/reset IPC methods through the existing preload bridge.
- Settings save now closes the settings window.
- Disabling always-on-top now exposes the pet in the taskbar so it can be brought forward again.
- Updated smoke tests to load the settings window and verify its form and settings IPC.

Validation:

- `npm run check`
- `npm run validate:pets`
- `npm run smoke`

## 2026-05-15 - Runtime Settings

- Added a validated `settings.json` store under Electron `userData`.
- Added default settings for keyboard activity, mouse proximity, always-on-top behavior, reaction timing, idle timing, rapid-click detection, and animation frame timing.
- Added a right-click `Settings` submenu for keyboard activity, mouse proximity, always-on-top, and reset.
- Wired runtime settings through IPC so the renderer updates timing without relaunching.
- Extended smoke coverage to verify settings IPC is available.

Validation:

- `npm run check`
- `npm run validate:pets`
- `npm run smoke`

## 2026-05-15 - Pet Package Management

- Added `npm run validate:pets` to validate installed pet packages from the terminal.
- Validates `pet.json`, `spritesheetPath`, atlas layout values, animation frame ranges, and event mappings.
- Marks invalid pet packages as disabled in the right-click `Pets` menu.
- Falls back to the default pet when the saved startup pet is invalid.
- Added right-click menu actions for `Open Pets Folder`, `Reload Current Pet`, and `Validate Pets`.
- Reloaded spritesheets include a file-modified cache key so edited assets refresh without renaming files.
- Added renderer notices for pet validation and reload feedback.

Validation:

- `npm run check`
- `npm run validate:pets`
- `npm run smoke`
