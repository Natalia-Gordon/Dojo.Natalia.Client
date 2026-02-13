# Dojo Natalia — Ninjutsu & Martial Arts Platform

**Web presence and training platform for Bujinkan Ninjutsu Israel.**  
Landing, events, community, and the client for the broader Ninjutsu Training Platform.

---

## What We Offer

- **Dojo Natalia website** — Public site (Hebrew/RTL): classes, events, blog, contact, testimonials. Live at [natalianinjutsu.com](https://natalianinjutsu.com). SSR-capable, Angular 19.
- **Ninjutsu Training Platform** — Full training ecosystem: user progression (ranks, levels, Sensei diplomas), training modules & techniques, resource library, marketplace, one-on-one sessions, events & gradings, memberships, achievements, and payments. (React/Vite UI; [Figma design](https://www.figma.com/design/4pYQcBx8EIpte6HOpcArSW/Ninjutsu-Training-Platform).)
- **Templates** — Reusable static themes (e.g. gym/martial-arts) for fast rollout.

---

## Platform Capabilities (from product schema)

| Area | Features |
|------|----------|
| **Users & progression** | Auth, profiles, ranks (White → Dan 20, Daishihan), Sensei eligibility (Dan 5+), training hours & streaks, discipline stats |
| **Training** | Modules & lessons, technique library with steps, progress tracking, one-on-one sessions |
| **Content & commerce** | Resource library (scrolls, videos, guides), marketplace (digital art, weapons, equipment, books), cart, orders, teacher analytics |
| **Community** | Events (seminars, workshops, gradings), registrations, reviews & ratings, notifications |
| **Business** | Membership plans, recurring billing, payment processing, achievements & skills |

---

## Tech Stack

- **Dojo website:** Angular 19, standalone components, SSR (Node/Express), Bootstrap 5, Hebrew/RTL.
- **Backend:** ASP.NET Core (Dojo.Natalia.Backend), PostgreSQL (Neon), JWT, Docker, Cloud Run.
- **CI:** GitHub Actions (Node 18/20/22 — install, build, tests).

---

## Quick Start (Dojo Natalia website)

```bash
cd natalia-dojo-website
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200).

| Command | Description |
|--------|-------------|
| `npm run dev` | Dev server (development config) |
| `npm run build` | Production build (with SSR) |
| `npm test` | Unit tests (Karma + Jasmine) |
| `npm run serve:ssr:natalia-dojo-website` | Run production SSR server (after build) |

---

## License

See [LICENSE](LICENSE).
