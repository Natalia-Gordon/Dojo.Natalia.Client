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

## Quick checks

- Production build: `npm run build -- --configuration production`
- Run SSR server: `npm run serve:ssr:natalia-dojo-website`
- Ensure no NG02100 (or similar) errors in build or at runtime.
