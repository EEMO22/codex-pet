# Patch Notes

## 2026-05-18 - Event Animation Mapping Settings

- Added per-pet event animation overrides to `settings.json`.
- Added an `Event Animations` section to the settings window with one selector
  per overlay event.
- The settings window now loads the current pet's available animations and keeps
  override choices scoped to that pet.
- The renderer now applies saved overrides above the pet's manifest event map
  and falls back to the pet/default animation when an override is unavailable.
- Settings smoke coverage now verifies the current pet data, event override
  settings shape, and all nine event mapping selectors.
- Updated README settings documentation.

Validation:

- `npm run check`
- `npm run smoke`
- `npm run validate:pets` currently fails because local work-in-progress folders
  `pets/mira`, `pets/noir`, `pets/noir-dual`, and `pets/noir-hq` are missing
  `pet.json`; `Scopey`, `Vera`, and `Vera Clear` validate successfully.

## 2026-05-18 - Release Workflow

- Added `npm run release:version -- <semver>` to update `package.json` and
  `package-lock.json` together.
- Added `npm run release:win` to require a clean working tree, run validation,
  build Windows distributables, and write `release-manifest.json` with artifact
  sizes and SHA-256 hashes.
- Added `RELEASE.md` with the version bump, artifact inspection, and GitHub
  Release upload flow.
- Added a README release section that points to the scripted workflow.
- Updated `HANDOFF.md` so the release workflow stage is marked complete and the
  current unfinished pet-folder validation blocker is visible across machines.

Validation:

- `node --check scripts/set-version.mjs`
- PowerShell syntax parse for `scripts/release-win.ps1`
- `npm pkg get scripts.release:version scripts.release:win`
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/release-win.ps1`
  stops on the current dirty working tree before packaging
- `npm run check`
- `npm run smoke`
- `npm run validate:pets` currently fails because local work-in-progress folders
  `pets/mira`, `pets/noir`, `pets/noir-dual`, and `pets/noir-hq` are missing
  `pet.json`; `Scopey`, `Vera`, and `Vera Clear` validate successfully.

## 2026-05-15 - Tray Controls

- Added a Windows tray icon using the generated Vera app icon.
- Tray click brings the existing pet overlay forward.
- Tray menu includes show pet, settings, open pets folder, validate pets, always-on-top, launch-at-login, and close actions.
- Packaged builds now include generated icon assets inside the app bundle.

Validation:

- `npm run check`
- `npm run validate:pets`
- `npm run smoke`
- `npm run package:win`
- `npm run dist:win`
- Confirmed generated tray icon assets are included in packaged `app.asar`.

## 2026-05-15 - Windows Packaging Setup

- Added `electron-builder` packaging for Windows.
- Prevents duplicate normal app instances; launching the app again focuses the existing pet overlay instead of creating another pet.
- Added a `Launch at Login` setting for packaged Windows builds.
- Added `npm run package:win` for unpacked local verification builds.
- Added `npm run dist:win` for NSIS installer and zip artifacts.
- Writes package artifacts to timestamped `out/unpacked-*` and `out/dist-*` folders so repeated builds do not collide with locked Windows files.
- Uses workspace-local Electron and builder caches under `tmp/`.
- Bundles repo-level default pets into packaged app resources.
- Keeps imported user pets in writable `userData/pets` for packaged builds.
- Includes the keyboard activity PowerShell helper as an app resource.
- Added README install instructions for the installer and zip artifacts.
- Added a generated Vera-based Windows app icon for packaged builds.

Validation:

- `npm run check`
- `npm run validate:pets`
- `npm run smoke`
- `npm run package:win`
- `npm run dist:win`
- Confirmed bundled pet resources and the keyboard activity helper are present in packaged output.
- Confirmed a second normal launch exits without creating another overlay.
- Confirmed extracted app and installer icons use the Vera-based icon.

## 2026-05-15 - Pet Folder Import

- Added `Import Pet Folder` to the right-click menu.
- Validates an external pet folder before importing.
- Copies valid pet folders into `pets/` without overwriting existing folders.
- Switches to the imported pet after a successful import.
- Widened the transparent overlay canvas and bubble sizing so import and validation notices can wrap without clipping.
- Keeps notices visible at the top, left, and right screen edges by repositioning the pet inside the transparent overlay and flipping the bubble below the pet when needed.
- Extended smoke coverage for the already-installed import path and visible bubble bounds at screen edges.

Validation:

- `npm run check`
- `npm run validate:pets`
- `npm run smoke`

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
