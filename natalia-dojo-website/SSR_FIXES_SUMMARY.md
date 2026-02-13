# SSR and Browser-API Safety

Notes on keeping the app safe for Server-Side Rendering (no `document`/`window` access during SSR).

## Patterns used

### Routes that call APIs

- Routes that fetch data at load (e.g. `/events`, `/events/:id`) use `skipPrerender: true` in `app.routes.ts` so they are not prerendered.

### Browser-only code

- **API calls**: Guard with `isPlatformBrowser(this.platformId)`; skip or no-op on the server.
- **Window/document**: Use `isPlatformBrowser` before `window.addEventListener`, `document` handlers, `window.open`, etc.
- **Images**: Resolve image URLs only in the browser; use a property (e.g. `displayImageUrl`) set when `isPlatformBrowser` is true.

### Components to keep in mind

- `footer.component.ts` – scroll listener only in browser (no `@HostListener('window:scroll')` during SSR).
- `contact.service.ts` – `window.open` only in browser.
- `gallery-image.component.ts`, `user-menu.component.ts`, `nav.component.ts` – document/window handlers only in browser.
- `events.component.ts`, `event-detail.component.ts` – API calls and init only in browser; use try/catch for fallbacks.

## "8 rules skipped due to selector errors" (Beasties / critical CSS)

When you run the **SSR server** (or a production build that inlines critical CSS), you may see:

```
8 rules skipped due to selector errors:
  .form-floating>~label -> Did not expect successive traversals.
  .btn-group>+.btn -> ...
```

**Why:** The critical-CSS step uses **Beasties** (via the `critters` override). Its CSS selector parser does **not** allow two combinators in a row (e.g. `>~` or `>+`). **Bootstrap** uses those valid selectors (`.form-floating>~label`, `.btn-group>+.btn`, etc.), so those rules fail to parse and are skipped only for the inlining step.

**Impact:** None on appearance or behavior. The full Bootstrap CSS is still loaded; only the *critical* inlining optimization skips these 8 rules. Safe to ignore unless you are tuning critical CSS.

---

## Quick checks

- Production build: `npm run build -- --configuration production`
- Run SSR server: `npm run serve:ssr:natalia-dojo-website` (listens on port 4000 by default)
- If port 4000 is in use: set `PORT=4001` (cmd) or `$env:PORT=4001` (PowerShell) before running the script.
- Ensure no NG02100 (or similar) errors in build or at runtime.

## NG0401 (Missing Platform) on SSR

If you see **NG0401** when loading a page with the SSR server, the server bootstrap was not passing the **BootstrapContext**. In `main.server.ts`, the bootstrap must accept the context and pass it to `bootstrapApplication`:

```ts
import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
const bootstrap = (context: BootstrapContext) => bootstrapApplication(AppComponent, config, context);
export default bootstrap;
```
