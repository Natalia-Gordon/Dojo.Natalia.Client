# Karma patches for Windows

These patches fix Karma test runs on Windows (file-list `mg.found` undefined, absolute path URLs, and `describe is not defined` because Jasmine files were not loaded).

**If you run `npm install` or `npm ci`, these changes in `node_modules/karma` will be lost.** To re-apply them you can:

1. **Use patch-package** (recommended): Install `patch-package`, add a `postinstall` script, then run `npx patch-package karma` to generate `patches/karma+6.4.2.patch`. Commit the patch file so it applies after every install.

2. **Re-apply manually** by editing:
   - `node_modules/karma/lib/file-list.js` – guard `mg.found` with `|| []`, and handle absolute paths (resolve as single file, set `file.contentPath`, use forward-slash path for URL).
   - `node_modules/karma/lib/middleware/karma.js` – in `filePathToUrlPath`, use `'absolute/' + normalizedPath` and normalize backslashes.
   - `node_modules/karma/lib/middleware/source_files.js` – in `composeUrl`, use `.replace(/^\/absolute\/?/, '')` so `/absolute/` is stripped.

Your project also uses a custom test entry (`src/test.ts`) and `sourceMap: false` for tests in `angular.json`, and the app component spec was updated to match the current app title.
