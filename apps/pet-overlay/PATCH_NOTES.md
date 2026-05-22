# Patch Notes

## 2026-05-22 - Vera Clear Gesture Rows

- Regenerated the Vera Clear Spinner Candidate `idle`, `jumping`, and `waving`
  rows from the original single canonical Vera Clear reference and the saved
  row prompts.
- Replaced the failed partial-composite jumping attempt with a full regenerated
  gesture row so the arm no longer appears clipped.
- Kept `waving` as the original blown-kiss action, not a hand wave.
- Corrected the blown-kiss timing so the wink happens when the hand extends
  forward, using Vera's left eye.
- Retargeted the `jumping` action away from a width-changing hair flick toward
  a subtler behind-ear hair-tidy gesture that can stay closer to the idle
  silhouette.
- Tightened the `jumping` prompt so the hand starts in front of the ear before
  sweeping the hair behind it, while matching the existing `idle`/`waving`
  outline style more closely.

Validation:

- `validate_atlas.py pets/vera-clear-spinner-candidate/spritesheet.webp`
- `npm run validate:pets`

## 2026-05-19 - Korean Language Support

- Added a `Language` setting with `System`, `English`, and `Korean` options.
- Localized the settings window, tray menu, pet context menu, and pet notices
  for Korean.
- Kept `System` as the default so Korean Windows environments open in Korean
  while English environments remain in English.
- Added smoke coverage for switching the settings window preview to Korean.

Validation:

- `npm run check`
- `npm run smoke`
- `npm run validate:pets`

## 2026-05-19 - Mixed Keyboard and Mouse Activity

- Kept the pet in keyboard work mode when mouse movement arrives immediately
  after keyboard activity.
- This prevents `running` and `idle` from flickering during workflows such as
  holding Space and dragging a canvas in design tools.
- Added smoke coverage for keyboard activity followed by mouse activity.

Validation:

- `npm run check`
- `npm run smoke`
- `npm run validate:pets`

## 2026-05-19 - Release Hash Compatibility

- Fixed Windows release and package verification scripts so SHA-256 hashes can
  still be generated when `Get-FileHash` is unavailable in the spawned
  PowerShell process.
- The scripts now fall back to .NET `SHA256` hashing for release manifests and
  manifest verification.
- Confirmed a local 0.2.0 rehearsal release writes `release-manifest.json`.

Validation:

- PowerShell syntax parse for `scripts/release-win.ps1`
- PowerShell syntax parse for `scripts/verify-package-output.ps1`
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/release-win.ps1 -AllowDirty -SkipValidation`
- `npm run package:verify`

## 2026-05-18 - 0.2.0 Release Prep

- Bumped Codex Pet Overlay from `0.1.0` to `0.2.0`.
- Prepared the release from a clean worktree so local in-progress pet folders
  under `pets/` are not bundled into distributables.
- Pushed tag `v0.2.0` to GitHub at source commit `5bf857c`.
- Created a GitHub draft release for `v0.2.0` and uploaded the installer, zip,
  and manifest.
- Draft release URL:
  `https://github.com/EEMO22/codex-pet/releases/tag/untagged-1f1075b91536b62467a3`.
- Generated Windows release artifacts at
  `C:\Projects\codex-pet-release\apps\pet-overlay\out\dist-20260518-165843`.
- Primary artifacts:
  - `Codex Pet Overlay-0.2.0-x64.exe`
    - Size: `107602881` bytes
    - SHA-256:
      `af2a9dc8059782cbc647407b56e510fde645f4c60d14245bc28733a95f3ae8cb`
  - `Codex Pet Overlay-0.2.0-x64.zip`
    - Size: `145673735` bytes
    - SHA-256:
      `3021db8fcf38951917a155c3e0c7a8500be4beb6e8e17fb76d3c49488e560d45`
  - `release-manifest.json`

Validation:

- `npm ci` in `C:\Projects\codex-pet-release\apps\pet-overlay`
- `npm run release:win` in the clean worktree
  - Ran `npm run check`
  - Ran `npm run validate:pets`
  - Ran `npm run smoke`
  - Ran `npm run dist:win`
  - Wrote `release-manifest.json`
- `npm run package:verify` in the clean worktree
- The clean worktree contained only valid built-in pets: `scopey`,
  `vera-clear`, and `vera-reviewer`.

## 2026-05-18 - Startup and Testing Polish

- Added a one-time first-run pet notice that points to the right-click menu and
  settings surface.
- Added `Copy Diagnostics` to both the tray menu and pet right-click menu.
- Diagnostics copy app version, runtime mode, Electron/Node/Chrome versions,
  user-data paths, pet roots, current pet, settings summary, event override
  scope, and pet validation status.
- Added `firstRunNoticeDismissed` to validated runtime settings.
- Added `npm run package:verify` and `scripts/verify-package-output.ps1`.
- `package:win` now verifies the generated unpacked app output after
  `electron-builder` finishes.
- Package verification checks the unpacked executable, `app.asar`, bundled pets,
  and the keyboard activity helper. It also verifies release-manifest hashes
  when a manifest is present.
- Updated README controls, settings, and packaging documentation.

Validation:

- PowerShell syntax parse for `scripts/package-win.ps1`
- PowerShell syntax parse for `scripts/verify-package-output.ps1`
- `npm run check`
- `npm run smoke`
- `npm run validate:pets` currently fails because local work-in-progress folders
  `pets/mira`, `pets/noir`, `pets/noir-dual`, and `pets/noir-hq` are missing
  `pet.json`; `Scopey`, `Vera`, and `Vera Clear` validate successfully.
- `npm run package:win`
- `npm run package:verify`

## 2026-05-18 - Pet Manager Polish

- Added a `Pet Manager` section to the settings window.
- The manager lists installed pet packages, marks the current pet, and shows
  invalid package status inline.
- Added settings-window actions to select a pet, open a specific pet folder, and
  remove imported pets.
- Built-in pet packages are protected from removal. In local development, repo
  `pets/` packages are treated as built-in so local pet work is not deleted from
  the app UI.
- Removing an imported current pet falls back to the default pet and clears that
  pet's saved event animation overrides.
- Added IPC and preload methods for pet list, select, open-folder, and remove
  actions.
- Settings smoke coverage now verifies the pet manager API and rendered pet
  rows.
- Updated README controls documentation.

Validation:

- `npm run check`
- `npm run smoke`
- `npm run validate:pets` currently fails because local work-in-progress folders
  `pets/mira`, `pets/noir`, `pets/noir-dual`, and `pets/noir-hq` are missing
  `pet.json`; `Scopey`, `Vera`, and `Vera Clear` validate successfully.

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
