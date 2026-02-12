# Dojo.Natalia.Client

Monorepo for the Bujinkan Ninjutsu Israel Dojo web presence and related tooling.

## Projects

| Project | Description |
|--------|-------------|
| **natalia-dojo-website** | Main Angular 18 site (landing, blog, events, team). SSR-capable, Hebrew/RTL. |
| **Ninjutsu Training Platform** | Figma-derived UI bundle (React/Vite). [Figma design](https://www.figma.com/design/4pYQcBx8EIpte6HOpcArSW/Ninjutsu-Training-Platform). |
| **templates** | Static HTML/CSS/JS templates (e.g. gym theme). |

## Quick start (natalia-dojo-website)

From the repo root:

```bash
cd natalia-dojo-website
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200).

## Commands (natalia-dojo-website)

Run these from `natalia-dojo-website/`:

| Command | Description |
|--------|-------------|
| `npm start` | Dev server (default config) |
| `npm run dev` | Dev server with development config |
| `npm run build` | Production build (with SSR) |
| `npm test` | Unit tests (Karma + Jasmine) |
| `npm run serve:ssr:natalia-dojo-website` | Run production SSR server (after build) |

## CI

- GitHub Actions: `.github/workflows/node.js.yml` runs install, build, and tests for Node 18.x, 20.x, and 22.x.
- Tests run from `natalia-dojo-website` with ChromeHeadless. A Karma patch is applied via `patch-package` on install; see `natalia-dojo-website/KARMA_WINDOWS_PATCHES.md`.

## License

See [LICENSE](LICENSE).
