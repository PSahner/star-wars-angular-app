# Quick Start Guide

## ⚡ Get Started in 3 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
```

### 3. Open Browser
Navigate to: **http://localhost:4200**

---

## 🛠️ What Works Now?

### ✅ Fully Implemented
- **Characters (Charaktere)** - List and detail views
- **Services** - All 4 resource services (People, Films, Starships, Planets)
- **Models** - All TypeScript interfaces
- **Tests** - Unit tests for services and People components
- **Header** - Navigation bar with routing
- **Shared UI building blocks** - loading/error components + shared utilities + reusable directives
- **Code Quality** - ESLint + Prettier
- **CI** - GitHub Actions reusable workflow (lint/test/build)

Note: SWAPI Reborn is **read-only** (GET requests). List endpoints return **plain arrays**; pagination in the UI is implemented **client-side**.

### 🚧 To Be Implemented
- **Frontpage (Startseite)** - Landing page (logo-only)
- **Films (Filme)** - See IMPLEMENTATION_GUIDE.md
- **Planets (Planeten)** - See IMPLEMENTATION_GUIDE.md

---

## 📝 Next Steps

1. **Implement Frontpage (Startseite)** (~15-30 minutes)
   - Use `PageContainerComponent` + `StarWarsLogoComponent`
   - Only logo on the page with generous vertical padding
   - Logo width ~75-80% of the container, `max-width: 989px`

2. **Implement Films Feature** (~1.5-2 hours)
   - Copy `people` components to `films`
   - Adapt TypeScript and HTML
   - Add routing
   - Write tests

3. **Implement Planets Feature** (~1.5-2 hours)
   - Copy `people` components to `planets`
   - Adapt TypeScript and HTML
   - Add routing
   - Write tests

4. **Test Everything**
   ```bash
   npm run test:ci
   ```

5. **Build & Deploy**
   ```bash
   npm run build:prod
   git push origin main
   ```

---

## 📖 Detailed Instructions

See **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** for:
- Step-by-step implementation
- Code patterns
- Testing guidelines
- Deployment instructions

---

## 🎯 Key Files to Reference

| File | Purpose |
|------|--------|
| `src/app/features/people/` | **Complete reference implementation** |
| `src/app/core/services/films.service.ts` | Films service (ready to use) |
| `src/app/core/services/planets.service.ts` | Planets service (ready to use) |
| `src/app/core/models/` | All TypeScript interfaces |
| `docs/IMPLEMENTATION_GUIDE.md` | Detailed scaffolding guide |

---

## ⚙️ Common Commands

```bash
# Development
npm start                  # Start dev server
npm run lint               # Lint
npm run format             # Format (Prettier)
npm run format:check       # Check formatting (Prettier)
npm test                   # Run tests in watch mode
npm run test:ci            # Run tests once (CI mode)

# Build
npm run build              # Build for development
npm run build:prod         # Build for production

# Git
git add .
git commit -m "feat: add films feature"
git push origin main
```

---

## 🐛 Troubleshooting

### Port 4200 already in use?
```bash
npx kill-port 4200
npm start
```

### Tests failing?
```bash
npm install
npm test
```

### Build errors?
```bash
rm -rf node_modules package-lock.json
npm install
npm run build:prod
```

---

Good luck! 🚀
