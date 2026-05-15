# Codex Pet Overlay Handoff

This file exists because Codex conversation context is local to a machine. When
resuming work on another PC, ask Codex to read this file, `README.md`,
`PATCH_NOTES.md`, and the repo root `AGENTS.md` before making changes.

## Current Branch

- Branch: `feature/electron-overlay`
- Remote: `origin` -> `https://github.com/EEMO22/codex-pet.git`
- Last synced feature commit before this handoff was added:
  `30ac1b1 feat(pet-overlay): add tray controls`

## Current App State

The Electron overlay app lives at:

```text
apps/pet-overlay
```

Implemented:

- Transparent desktop pet overlay using Codex-style pet packages.
- TypeScript main/preload/renderer/settings code.
- Codex pet package loading from repo-level `pets/`.
- Packaged app support for bundled pets plus imported user pets.
- Mouse reactions, drag reactions, rapid-click failure reaction, and keyboard
  activity reactions.
- Runtime settings stored in Electron `userData/settings.json`.
- Settings window and right-click menu controls.
- Pet import, reload, validation, and folder opening.
- Bubble positioning that stays visible near screen edges.
- Multi-monitor drag support with a small visible bumper.
- Windows packaging through `electron-builder`.
- Single-instance lock so a second launch focuses the existing pet.
- Launch-at-login setting.
- Generated Vera-based Windows app icon.
- Windows tray icon and tray menu for show pet, settings, pets folder,
  validation, always-on-top, launch-at-login, and close.

## Important Decisions

- Keep Codex pet atlas compatibility as the default package format.
- Later, allow users to remap overlay events to animation names through settings.
- Keep installer/zip/unpacked outputs as generated artifacts, not source files.
- Unsigned Windows builds may trigger SmartScreen or Smart App Control. Code
  signing is intentionally deferred.
- `npm start` runs the latest local source after build. Installed builds only
  update after rebuilding and reinstalling.

## Commands

Install and run:

```powershell
cd C:\Projects\codex-pet\apps\pet-overlay
npm install
npm start
```

If Electron cache permissions are troublesome:

```powershell
npm run install:local-cache
```

Validation:

```powershell
npm run check
npm run validate:pets
npm run smoke
```

Packaging:

```powershell
npm run package:win
npm run dist:win
```

Generated distributables are written under timestamped folders:

```text
apps/pet-overlay/out/unpacked-YYYYMMDD-HHMMSS/
apps/pet-overlay/out/dist-YYYYMMDD-HHMMSS/
```

## Runtime State

Development runtime state is under:

```text
apps/pet-overlay/tmp/user-data/
```

Installed runtime state is under Electron user data for `Codex Pet Overlay`,
normally:

```text
%APPDATA%\Codex Pet Overlay\
```

For exact state transfer between PCs, copy at least:

- `settings.json`
- `overlay-state.json`
- `pets/` if user-imported pets exist

Do not commit cache folders from `tmp/user-data`.

## Suggested Next Stages

1. Add version/release workflow:
   - bump app version intentionally
   - generate release artifacts
   - document GitHub Release upload steps
2. Add event-to-animation mapping settings:
   - keep Codex pet defaults
   - let each event choose an available animation from the selected pet
3. Add pet manager polish:
   - imported pet list
   - remove imported pet
   - open selected pet folder
4. Add optional startup/testing polish:
   - first-run notice
   - diagnostics window or copied environment summary
   - better packaging smoke checks if practical

## Resume Prompt

When opening this repo on another PC, a good first message to Codex is:

```text
Read AGENTS.md, apps/pet-overlay/HANDOFF.md, README.md, and PATCH_NOTES.md.
Then continue Codex Pet Overlay from the next suggested stage. Keep changes
small, test each stage, update PATCH_NOTES.md, and give me a commit message.
```

