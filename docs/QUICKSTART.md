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

Note: SWAPI Reborn is **read-only** (GET requests). List endpoints return **plain arrays**; pagination in the UI is implemented **client-side**.

### 🚧 To Be Implemented
- **Films (Filme)** - See IMPLEMENTATION_GUIDE.md
- **Planets (Planeten)** - See IMPLEMENTATION_GUIDE.md

---

## 📝 Next Steps

1. **Implement Films Feature** (~1.5-2 hours)
   - Copy `people` components to `films`
   - Adapt TypeScript, HTML, SCSS
   - Add routing
   - Write tests

2. **Implement Planets Feature** (~1.5-2 hours)
   - Copy `people` components to `planets`
   - Adapt TypeScript, HTML, SCSS
   - Add routing
   - Write tests

3. **Test Everything**
   ```bash
   npm run test:ci
   ```

4. **Build & Deploy**
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
| `IMPLEMENTATION_GUIDE.md` | Detailed scaffolding guide |

---

## ⚙️ Common Commands

```bash
# Development
npm start                  # Start dev server
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
