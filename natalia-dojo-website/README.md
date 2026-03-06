# Natalia Dojo Website

Angular 20 site for Bujinkan Ninjutsu Israel Dojo: landing page, blog, events, team, and Hebrew/RTL support with optional SSR.

## Prerequisites

- Node.js 18.x, 20.x, or 22.x (LTS recommended)
- npm (comes with Node)

## Setup

```bash
npm install
```

Patches (e.g. for Windows/CI) are applied automatically via `postinstall` when applicable.

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

Unit tests use **Vitest** (Node + jsdom). Do not pass `--browsers=ChromeHeadless` — that option was for the old Karma setup.

```bash
npm test
# or
npm run test:ci
```

Runs tests once (no watch). For watch mode during development, use `ng test` (without `--watch=false`).

Run from the `natalia-dojo-website` folder.

## Project structure

- `src/app/` – Application code (components, services, routes)
- `src/assets/` – Images, fonts, audio, and third-party libs (e.g. Owl Carousel)
- `src/environments/` – Environment config (API URL, production flag)
- `server.ts` – Express SSR server entry (production)
- `angular.json` – Build and serve configurations

## Docs in this folder

- [TRANSLATION_BEST_PRACTICES.md](TRANSLATION_BEST_PRACTICES.md) – Translation and RTL practices
- [SSR_FIXES_SUMMARY.md](SSR_FIXES_SUMMARY.md) – SSR and browser-API safety notes

## Angular CLI

Generate components, services, etc.:

```bash
npx ng generate component my-component
npx ng help
```

[Angular CLI Overview](https://angular.dev/tools/cli)
