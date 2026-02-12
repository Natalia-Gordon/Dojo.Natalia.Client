# Natalia Dojo Website

Angular 18 site for Bujinkan Ninjutsu Israel Dojo: landing page, blog, events, team, and Hebrew/RTL support with optional SSR.

## Prerequisites

- Node.js 18.x, 20.x, or 22.x (LTS recommended)
- npm (comes with Node)

## Setup

```bash
npm install
```

Patches for Karma (tests on Windows/CI) are applied automatically via `postinstall`. See [KARMA_WINDOWS_PATCHES.md](KARMA_WINDOWS_PATCHES.md) for details.

## Development

```bash
npm start
# or
npm run dev
```

Open [http://localhost:4200](http://localhost:4200).

## Build

| Command | Output | SSR |
|--------|--------|-----|
| `npm run build` | `dist/natalia-dojo-website/` | Yes (production) |
| `ng build --configuration development` | Dev build | No |
| `ng build --configuration production-no-ssr` | Production build | No |

## Tests

```bash
npm test
```

Runs unit tests with Karma and ChromeHeadless. For CI / single run:

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

Run from the `natalia-dojo-website` folder so the correct `node_modules` (and Karma builder) are used.

## Project structure

- `src/app/` – Application code (components, services, routes)
- `src/assets/` – Images, fonts, audio, and third-party libs (e.g. Owl Carousel)
- `src/environments/` – Environment config (API URL, production flag)
- `server.ts` – Express SSR server entry (production)
- `angular.json` – Build and serve configurations

## Docs in this folder

- [KARMA_WINDOWS_PATCHES.md](KARMA_WINDOWS_PATCHES.md) – Karma patches for Windows and CI
- [TRANSLATION_BEST_PRACTICES.md](TRANSLATION_BEST_PRACTICES.md) – Translation and RTL practices
- [SSR_FIXES_SUMMARY.md](SSR_FIXES_SUMMARY.md) – SSR and browser-API safety notes

## Angular CLI

Generate components, services, etc.:

```bash
npx ng generate component my-component
npx ng help
```

[Angular CLI Overview](https://angular.dev/tools/cli)
