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

## Progress Tracking

Use this file as the cross-machine source of truth for project progress. Before
starting a new stage, read this section and `PATCH_NOTES.md`.

When completing a stage:

- Mark the stage checkbox below as done.
- Add the completion date, commit reference, and a short note.
- Move any remaining follow-up work into a new unchecked item.
- Update `PATCH_NOTES.md` with the user-facing change summary and validation
  commands that were run.
- Commit the code and documentation together so another machine can resume from
  the same state.

If a stage is partially complete, leave it unchecked and add a short `Progress:`
note under the item.

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

- [x] Add version/release workflow.
  - Scope: bump app version intentionally, generate release artifacts, document
    GitHub Release upload steps.
  - Completion: 2026-05-18, commit `250eb11`. Added `release:version`,
    `release:win`, `RELEASE.md`, and README release instructions.
  - Validation: `npm run check`, `npm run smoke`, and `npm run validate:pets`.
    `validate:pets` currently fails because local work-in-progress pet folders
    `pets/mira`, `pets/noir`, `pets/noir-dual`, and `pets/noir-hq` are missing
    `pet.json`; release builds intentionally require a clean working tree before
    bundling `pets/`.
- [x] Add event-to-animation mapping settings.
  - Scope: keep Codex pet defaults, let each event choose an available animation
    from the selected pet.
  - Completion: 2026-05-18, commit `3f9d023`. Added per-pet event animation
    overrides in settings, settings-window selectors for all overlay events, and
    renderer support for applying overrides above pet manifest defaults.
  - Validation: `npm run check`, `npm run smoke`, and `npm run validate:pets`.
    `validate:pets` currently fails because local work-in-progress pet folders
    `pets/mira`, `pets/noir`, `pets/noir-dual`, and `pets/noir-hq` are missing
    `pet.json`; `Scopey`, `Vera`, and `Vera Clear` validate successfully.
- [x] Add pet manager polish.
  - Scope: imported pet list, remove imported pet, open selected pet folder.
  - Completion: 2026-05-18, commit `ca617af`. Added settings-window pet
    manager rows, current/invalid status, select/open/remove actions, and
    packaged imported-pet removal safeguards.
  - Validation: `npm run check`, `npm run smoke`, and `npm run validate:pets`.
    `validate:pets` currently fails because local work-in-progress pet folders
    `pets/mira`, `pets/noir`, `pets/noir-dual`, and `pets/noir-hq` are missing
    `pet.json`; `Scopey`, `Vera`, and `Vera Clear` validate successfully.
- [x] Add optional startup/testing polish.
  - Scope: first-run notice, diagnostics window or copied environment summary,
    better packaging smoke checks if practical.
  - Completion: 2026-05-18, commit `58752c3`. Added a one-time first-run
    notice, Copy Diagnostics menu actions, diagnostics environment summaries,
    and package output verification.
  - Validation: PowerShell syntax parse for `scripts/package-win.ps1` and
    `scripts/verify-package-output.ps1`, `npm run check`, `npm run smoke`,
    `npm run validate:pets`, `npm run package:win`, and `npm run package:verify`.
    `validate:pets` currently fails because local work-in-progress pet folders
    `pets/mira`, `pets/noir`, `pets/noir-dual`, and `pets/noir-hq` are missing
    `pet.json`; `Scopey`, `Vera`, and `Vera Clear` validate successfully.

## Release Status

- [x] Prepare `0.2.0` Windows release.
  - Started: 2026-05-18.
  - Completion: 2026-05-18, source commit `5bf857c`. Built from clean detached
    worktree `C:\Projects\codex-pet-release`.
  - Scope: version bump, clean worktree release validation, Windows artifacts,
    and release manifest.
  - Output:
    `C:\Projects\codex-pet-release\apps\pet-overlay\out\dist-20260518-165843`.
  - Artifacts: `Codex Pet Overlay-0.2.0-x64.exe`,
    `Codex Pet Overlay-0.2.0-x64.zip`, and `release-manifest.json`.
  - Validation: `npm ci`, `npm run release:win`, and
    `npm run package:verify` in the clean worktree. The release script ran
    `npm run check`, `npm run validate:pets`, `npm run smoke`, and
    `npm run dist:win`. The clean worktree contained only valid built-in pets.
- [x] Create `0.2.0` GitHub draft release.
  - Completion: 2026-05-18.
  - Tag: `v0.2.0` pushed to `origin`, pointing at commit `5bf857c`.
  - Draft release:
    `https://github.com/EEMO22/codex-pet/releases/tag/untagged-1f1075b91536b62467a3`.
  - Uploaded assets: `Codex.Pet.Overlay-0.2.0-x64.exe`,
    `Codex.Pet.Overlay-0.2.0-x64.zip`, and `release-manifest.json`.
  - Note: GitHub shows the current draft URL with an `untagged-*` path even
    though the release `tagName` is `v0.2.0`.
- [ ] Publish `0.2.0` draft as final release.
  - Scope: review the GitHub draft release notes/assets, publish the draft,
    and record the final public release URL if it changes after publication.
- [ ] Commit release hash compatibility fix.
  - Started: 2026-05-19.
  - Scope: remove direct `Get-FileHash` dependency from release manifest
    generation and package manifest verification.
  - Progress: local rehearsal release
    `C:\Projects\codex-pet\apps\pet-overlay\out\dist-20260519-093405`
    generated `release-manifest.json`; `npm run package:verify` passes.
- [ ] Commit mixed keyboard/mouse activity smoothing.
  - Started: 2026-05-19.
  - Scope: keep keyboard work animation active when mouse movement follows
    recent keyboard activity, such as Space plus drag canvas panning.
  - Progress: implemented in renderer state machine and smoke coverage added.
- [ ] Commit Korean language support.
  - Started: 2026-05-19.
  - Scope: add language setting and Korean text for settings window, tray menu,
    pet context menu, and pet notices.
  - Progress: implemented `system/en/ko` setting and smoke coverage for Korean
    settings-window preview.

## Resume Prompt

When opening this repo on another PC, a good first message to Codex is:

```text
Read AGENTS.md, apps/pet-overlay/HANDOFF.md, README.md, and PATCH_NOTES.md.
Then continue Codex Pet Overlay from the next suggested stage. Keep changes
small, test each stage, update PATCH_NOTES.md, and give me a commit message.
```

