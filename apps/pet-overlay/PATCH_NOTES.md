# Patch Notes

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
