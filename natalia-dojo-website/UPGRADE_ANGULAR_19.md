# Angular 18 → 19 Upgrade

## Done

- **package.json** – Bumped to Angular 19.2.x:
  - All `@angular/*` packages: `^19.2.18` (core, router, forms, etc.)
  - `@angular/cli` and `@angular-devkit/build-angular`: `^19.2.19`
  - `@angular/ssr`: `^19.2.19`
  - `zone.js`: `~0.15.1`
  - `typescript`: `~5.6.0`
- Project already uses **standalone components** and **provideRouter** / **provideHttpClient**, so no structural migration was required.

## Next steps (run locally)

1. **Install and patch**
   ```bash
   cd natalia-dojo-website
   npm install
   ```
   (Patches for Karma will apply via `postinstall`.)

2. **Build**
   ```bash
   npm run build
   # or without SSR first: npm run build -- --configuration=production-no-ssr
   ```

3. **Tests**
   ```bash
   npm test -- --watch=false --browsers=ChromeHeadless
   ```

4. **Serve (optional)**
   ```bash
   npm start
   ```

## If something breaks

- **Control flow (@if / @for)**: Prefer the new syntax (`@if`, `@for`, `@switch`). If you see “Unexpected character EOF” or “unescaped ‘{’”, ensure the template has a **newline at end of file** and use explicit closing tags (e.g. `</app-login>`) inside blocks. If the error persists, you can temporarily use `*ngIf` / `*ngFor` with `CommonModule` as a fallback.
- **Karma / tests**: The existing `patches/karma+6.4.2.patch` may still apply; if Karma’s version changes with Angular 19, re-create the patch with `npx patch-package karma` after fixing locally.
- **SSR**: If you see `document`/`window` or router errors in SSR, keep using the patterns in `SSR_FIXES_SUMMARY.md` (e.g. `isPlatformBrowser`, `skipPrerender`).
- **TypeScript**: 5.6 is recommended for Angular 19; if you see type errors, check [Angular 19 changelog](https://github.com/angular/angular/blob/main/CHANGELOG.md) and the [update guide](https://angular.dev/update-guide).

## Optional migrations (Angular 19)

- **Signal inputs**: `ng generate @angular/core:signal-input-migration`
- **Control flow**: `@if`, `@for`, `@switch` in templates
- **Router testing**: Use `provideRouter()` in tests instead of `RouterTestingModule` if you adopt the new testing APIs.

These are optional; the app runs on Angular 19 without them.

## Carousel images (NG0913 / performance)

The home carousel uses **NgOptimizedImage** (`ngSrc`, `width`, `height`; `priority` on the first slide for LCP). To avoid NG0913 warnings and keep good performance:

1. **Resize the source files**  
   Resize `src/assets/img/carousel-1.jpg` through `carousel-4.jpg` to the **display size** (e.g. **1920×1080**). Oversized originals cause the warning and extra bandwidth.

2. **Keep dimensions in sync**  
   The template uses `width="1920"` and `height="1080"` to match the intrinsic image size. If you change the image dimensions, update both the image files and these attributes so the aspect ratio matches (avoids NG02952).

3. **Do not disable the warning**  
   Keeping NG0913 enabled helps catch oversized images; fixing the assets is the intended approach.
