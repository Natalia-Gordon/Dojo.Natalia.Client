# Patches

`postinstall` no longer runs **patch-package** automatically (the old `karma+6.4.2.patch` no longer applied cleanly).

If you still have `patches/karma+6.4.2.patch` locally, **delete it** to avoid errors if you re-enable postinstall later.

To patch a package again:

1. `npm install patch-package --save-dev`
2. Edit files under `node_modules/<package>`
3. `npx patch-package <package-name>`
4. Add to `package.json`: `"postinstall": "patch-package"`
