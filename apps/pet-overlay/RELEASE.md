# Release Workflow

Use this checklist when preparing a Windows release of Codex Pet Overlay. Release
builds should come from a clean working tree because `pets/` is bundled into the
app resources.

## 1. Choose the Version

Set the app version intentionally from `apps/pet-overlay`:

```powershell
npm run release:version -- 0.2.0
```

This updates both `package.json` and `package-lock.json`. Review the diff before
committing.

## 2. Verify Release Readiness

Before building, make sure there are no unfinished or untracked pet folders under
`pets/`. Local pet folders are included in packaged app resources.

Run the release build:

```powershell
npm run release:win
```

The script performs:

- `npm run check`
- `npm run validate:pets`
- `npm run smoke`
- `npm run dist:win`
- SHA-256 hashing for generated artifacts
- `release-manifest.json` generation in the output folder

For a local packaging rehearsal only, the script accepts:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/release-win.ps1 -AllowDirty -SkipValidation
```

Do not upload rehearsal builds.

## 3. Inspect Artifacts

Release outputs are written to a timestamped folder:

```text
apps/pet-overlay/out/dist-YYYYMMDD-HHMMSS/
```

Upload the installer, zip, and `release-manifest.json`. The manifest records the
version, source commit, artifact sizes, and SHA-256 hashes.

## 4. Publish on GitHub

After committing the version bump and release notes, tag the release:

```powershell
git tag v0.2.0
git push origin feature/electron-overlay --tags
```

Create a draft GitHub Release and attach the artifacts:

```powershell
gh release create v0.2.0 `
  out/dist-YYYYMMDD-HHMMSS/*.exe `
  out/dist-YYYYMMDD-HHMMSS/*.zip `
  out/dist-YYYYMMDD-HHMMSS/release-manifest.json `
  --title "Codex Pet Overlay v0.2.0" `
  --notes "Windows installer and zip build for Codex Pet Overlay." `
  --draft
```

If GitHub CLI is unavailable, create the release in the GitHub web UI using the
same tag and upload the same files.
