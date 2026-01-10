# Quick Start Guide

This guide gets you running locally in a few minutes and gives you the core commands you’ll use day-to-day.

---

## ✅ Prerequisites

- **Node.js:** 20.x (CI uses Node 20)
- **npm:** 9+

---

## ⚡ Run locally

### 1) Install dependencies

```bash
npm install
```

### 2) Start the dev server

```bash
npm start
```

### 3) Open the app

Open: `http://localhost:4200`

---

## 🧭 Routes to try

- `/` (frontpage)
- `/people` and `/people/:id`
- `/films` and `/films/:id`
- `/planets` and `/planets/:id`

---

## 🧩 What’s implemented (at a glance)

- **Registry-driven resources:** One generic list + detail implementation driven by a central registry.
- **Supported resource pages:** People, Films, Planets.
- **Client-side pagination:** SWAPI Reborn list endpoints return arrays (not paginated responses).
- **Related sections:** Configured per resource (single + list blocks).
- **Images:** Deterministic placeholders via Picsum (seeded URLs).
- **Theme:** Light/dark mode toggle.
- **UI-only features:** Search bar and “Add” modals do not persist data (API is read-only).

---

## ⚙️ Common commands

```bash
# Dev server
npm start

# Lint / format
npm run lint
npm run format
npm run format:check

# Tests
npm test
npm run test:ci

# Builds
npm run build
npm run build:prod
npm run watch
```

Notes:

- `npm run build` uses Angular’s default configuration for this repo, which is **production**.
- `npm run build:prod` additionally sets the GitHub Pages `base-href`.

---

## 🏗 Build output

The production build output is located at:

`dist/star-wars-angular-app/browser/`

---

## 🚢 Deployment (GitHub Pages)

- Deployment is handled by `.github/workflows/deploy.yml`.
- The script `npm run build:prod` uses:

```json
"build:prod": "ng build --configuration production --base-href /star-wars-angular-app/"
```

If your repository name differs, update the `base-href` accordingly.

---

## 🐛 Troubleshooting

### Port 4200 already in use

```bash
lsof -i :4200
```

Then stop the process that is using the port, or run Angular on a different port:

```bash
npm start -- --port 4201
```

### Tests fail in headless mode

```bash
npm install
npm run test:ci
```

### “Clean install” when things are weird

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📖 Next reading

See **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** for:

- architecture and key design decisions
- how the resource registry works
- how to add a new resource and wire routes/tests

