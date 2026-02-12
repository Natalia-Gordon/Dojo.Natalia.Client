# Karma patches (Windows and CI)

Patches in `patches/karma+6.4.2.patch` fix Karma test runs on Windows and on CI (e.g. GitHub Actions):

- **file-list `mg.found` undefined** – Guard with `mg.found || []` and handle absolute paths (Windows and Linux) by resolving single files instead of Glob.
- **Invalid absolute URLs** – Build URLs as `absolute/` + normalized path and strip `/absolute/` correctly when resolving.
- **`describe is not defined`** – Ensures Jasmine framework files are found and served so globals are available.

These are applied automatically after every `npm install` / `npm ci` via the `postinstall` script (`patch-package`). Commit the `patches/` directory so CI gets the same fixes.

The project also uses a custom test entry (`src/test.ts`) and `sourceMap: false` for tests in `angular.json`.
