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

✅ The following features are fully implemented:
- **Generic Resources (registry-driven)** - List and detail views
  - People: `/people`
  - Films: `/films`
  - Planets: `/planets`
- **Services** - All 4 resource services (People, Films, Starships, Planets)
- **Models** - All TypeScript interfaces
- **Tests** - Unit tests for services and generic resource components
- **Header** - Navigation bar with routing
- **Shared UI building blocks** - loading/error components + shared utilities + reusable directives
- **Code Quality** - ESLint + Prettier
- **CI** - GitHub Actions reusable workflow (lint/test/build)
- **Frontpage (Startseite)** - Landing page (logo-only)

Note: SWAPI Reborn is **read-only** (GET requests). List endpoints return **plain arrays**; pagination in the UI is implemented **client-side**.

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

## 📖 Detailed Instructions

See **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** for:
- Step-by-step implementation
- Code patterns
- Testing guidelines
- Deployment instructions

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

Happy Testing! 🚀
