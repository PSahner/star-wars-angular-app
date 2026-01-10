# 🌟 Star Wars Angular App

A modern, production-ready Angular 18 application for exploring the Star Wars universe using the [SWAPI Reborn](https://swapi.info/) API.

![Angular](https://img.shields.io/badge/Angular-18.0-red?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture (High-Level)](#architecture-high-level)
- [Routes](#routes)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

---

## ✨ Features

### Implemented Features ✅
- **Generic Resources (registry-driven):** List and detail views (read-only)
  - Supported resources: **People**, **Films**, **Planets**
  - Single generic list/detail implementation driven by a central **Resource Registry**
  - Grid view with cards, deterministic placeholder images, and client-side pagination
  - Detail view with related data sections (clickable related items)
  - Loading states and error handling (reusable shared components)
- **Services Layer:** Full service architecture
  - Base `SwapiService` with HTTP client, caching, retry logic
  - Feature services for People, Films, Planets (and Starships)
  - Comprehensive error handling
- **Reusable UI building blocks**
  - `LoadingStateComponent` + `ErrorStateComponent` for consistent async UI
  - `translateGender()` and other shared helpers in `src/app/shared/utilities.ts`
  - `appDragScroll` directive for grab-to-drag horizontal scrolling rows
  - `PicsumImageService` for deterministic seeded placeholder images
- **Responsive Design:** Mobile-first approach with Tailwind CSS
- **Theming:** Light/Dark mode toggle
- **Type Safety:** Full TypeScript strict mode
- **Testing:** Unit tests with Jasmine/Karma (coverage thresholds configured)
- **Code Quality:** ESLint + Prettier (CI enforces lint + tests)
- **CI/CD:** GitHub Actions (reusable workflow for lint/test/build, optional Codecov upload)

### UI-only / Optional Enhancements ✅
- **Frontpage (Startseite):** Landing page (`/`) with centered logo
- **"Add" Modals:** UI-only modal overlays on list pages (no persistence, API is read-only)

### Out of Scope / Future Work 🧩
- **Starships UI:** Services exist (`StarshipsService`), but list/detail pages are not wired
- **Search:** Search bar is UI-only (currently logs to console)
- **Advanced filtering**

---

## 🛠 Tech Stack

### Core Technologies
- **Framework:** Angular 18 (standalone components)
- **Language:** TypeScript 5.4 (strict mode)
- **Styling:** Tailwind CSS 3.4
- **API:** SWAPI Reborn (https://swapi.info/)

### Development Tools
- **Package Manager:** npm
- **Build Tool:** Angular CLI
- **Testing:** Jasmine + Karma
- **Linting:** ESLint (Angular ESLint, flat config)
- **Formatting:** Prettier
- **Version Control:** Git

### CI/CD & Deployment
- **CI/CD:** GitHub Actions
- **Security:** Aikido Safe Chain (no tokens required) is installed in CI/CD to protect `npm ci` from malicious packages
- **Hosting:** GitHub Pages

---

## 📁 Project Structure

```
star-wars-angular-app/
├── .github/
│   └── workflows/
│       ├── reusable-ci.yml     # Reusable CI workflow (lint/test/build)
│       ├── deploy.yml          # Deployment workflow (GitHub Pages)
│       └── test.yml            # CI workflow (calls reusable-ci.yml)
├── src/
│   ├── app/
│   │   ├── core/               # Core functionality
│   │   │   ├── models/         # TypeScript interfaces
│   │   │   │   ├── person.model.ts
│   │   │   │   ├── film.model.ts
│   │   │   │   ├── starship.model.ts
│   │   │   │   └── planet.model.ts
│   │   │   └── services/       # Service layer
│   │   │       ├── swapi.service.ts
│   │   │       ├── people.service.ts
│   │   │       ├── films.service.ts
│   │   │       ├── starships.service.ts
│   │   │       └── planets.service.ts
│   │   ├── features/           # Feature pages
│   │   │   ├── frontpage/      # Landing page
│   │   │   └── resources/      # Generic registry-driven resource pages
│   │   │       ├── resource-registry.ts
│   │   │       ├── resource-list/
│   │   │       └── resource-detail/
│   │   ├── shared/             # Shared components
│   │   │   ├── components/      # Reusable UI components (header, footer, loading/error state, ...)
│   │   │   ├── directives/      # Reusable directives (e.g. appDragScroll)
│   │   │   └── utilities.ts     # Shared helper functions
│   │   ├── app.component.ts    # Root component
│   │   ├── app.config.ts       # App configuration
│   │   └── app.routes.ts       # Routing configuration
│   ├── assets/                 # Static assets
│   ├── styles.scss             # Global styles
│   └── index.html              # HTML entry point
├── angular.json                # Angular configuration
├── package.json                # Dependencies
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── docs/
│   ├── IMPLEMENTATION_GUIDE.md # Development guide
│   └── QUICKSTART.md           # Quick start guide
└── README.md                   # This file
```

---

## 🧠 Architecture (High-Level)

This project is built around a **registry-driven UI**:

- **`ResourceRegistryService`** (`src/app/features/resources/resource-registry.ts`) is the single source of truth for:
  - list/detail titles
  - card + detail field renderers
  - image generation configuration (seed + size)
  - related blocks (single + list)
  - data loaders (`getAll`, `getById`, related `load(...)`)
- **Generic pages** render all supported resources:
  - `ResourceListComponent` (list + client-side pagination)
  - `ResourceDetailComponent` (detail + related sections)

Because SWAPI Reborn list endpoints return **plain arrays** and the API is **read-only**, pagination is implemented **client-side** and "Add" actions are **UI-only**.

---

## 🧭 Routes

- `/` (frontpage)
- `/people` and `/people/:id`
- `/films` and `/films/:id`
- `/planets` and `/planets/:id`

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** 20.x (CI uses Node 20)
- **npm:** 9.x or higher
- **Git:** Latest version

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/star-wars-angular-app.git
   cd star-wars-angular-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Open browser:**
   Navigate to `http://localhost:4200`

---

## 💻 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start dev server on http://localhost:4200 |
| `npm run build` | Build (Angular CLI default config is production in this repo) |
| `npm run build:prod` | Build for production with GitHub Pages base-href |
| `npm run watch` | Continuous build in development mode |
| `npm test` | Run unit tests in watch mode |
| `npm run test:ci` | Run tests once in headless mode |
| `npm run lint` | Lint code |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting (Prettier) |

### Development Workflow

1. **Create a new feature:**
   ```bash
   # For new SWAPI resources, add a new entry to the registry:
   # src/app/features/resources/resource-registry.ts
   #
   # Then add routes in:
   # src/app/app.routes.ts
   ```

2. **Run tests:**
   ```bash
   npm test
   ```

3. **Build and verify:**
   ```bash
   npm run build:prod
   ```

4. **Commit changes:**
   ```bash
   git add .
   git commit -m "feat: add films feature"
   git push origin main
   ```

### Code Style Guidelines

- **TypeScript:** Strict mode enabled
- **Components:** Standalone components only
- **Naming:** Kebab-case for files, PascalCase for classes
- **Documentation:** JSDoc comments for public methods
- **Testing:** Coverage thresholds are enforced in Karma (see `karma.conf.js`)

### Documentation

- **Quick start:** [docs/QUICKSTART.md](./docs/QUICKSTART.md)
- **Architecture & extension guide:** [docs/IMPLEMENTATION_GUIDE.md](./docs/IMPLEMENTATION_GUIDE.md)

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests with watch mode
npm test

# Run tests once (CI mode)
npm run test:ci

# Run with coverage report
npm test -- --code-coverage
```

### Test Coverage

Karma prints an Istanbul coverage summary at the end of a run:
- **Statements/Lines/Functions** are basic execution coverage.
- **Branches** measures decision coverage (e.g. both sides of `if/else`, `switch` cases, ternaries, `&&`/`||` short-circuit paths).

The red/yellow/green colors indicate whether the numbers meet the configured thresholds.

View coverage report:
```bash
# Linux
xdg-open coverage/star-wars-angular-app/index.html

# macOS
open coverage/star-wars-angular-app/index.html
```

### Writing Tests

Each component/service should test:
1. Creation and initialization
2. Data loading and state management
3. Error handling
4. User interactions
5. Cleanup (subscriptions)

Example:
```typescript
describe('ResourceListComponent', () => {
  it('should show an error if the resourceKey route data is invalid', () => {
    // Arrange
    // Provide ActivatedRoute with invalid route.data.resourceKey

    // Act
    component.ngOnInit();

    // Assert
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toContain('Invalid resource');
  });
});
```

---

## 🚢 Deployment

### GitHub Pages Deployment

1. **Setup repository:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/star-wars-angular-app.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: GitHub Actions

3. **Automatic deployment:**
   - Pushes to `main` trigger automatic deployment
   - Workflow runs a dependency security check (`npm audit`), lint, tests, build, and deploy

4. **Access your app:**
   ```
   https://YOUR_USERNAME.github.io/star-wars-angular-app/
   ```

### Manual Deployment

```bash
# Build for production
npm run build:prod

# Deploy to hosting service
# Upload the build output from:
# dist/star-wars-angular-app/browser/
```

### Environment Configuration

Update `base-href` in `package.json` for different hosting:
```json
"build:prod": "ng build --configuration production --base-href /YOUR_REPO_NAME/"
```

---

## 📚 API Documentation

### SWAPI Reborn
Base URL: `https://swapi.info/api`

The SWAPI Reborn API is **read-only** (GET requests). List endpoints return **plain arrays** (not paginated objects).

### Endpoints

| Resource | Endpoint | Description |
|----------|----------|-------------|
| People | `/people/` | List of characters |
| Films | `/films/` | List of films |
| Starships | `/starships/` | List of starships |
| Planets | `/planets/` | List of planets |

### Example Response
```json
[
  {
    "name": "Luke Skywalker",
    "height": "172",
    "mass": "77",
    "hair_color": "blond",
    "eye_color": "blue",
    "birth_year": "19BBY",
    "gender": "male",
    "homeworld": "https://swapi.info/api/planets/1/",
    "films": ["https://swapi.info/api/films/1/"],
    "url": "https://swapi.info/api/people/1/"
  }
]
```

---

## 🤝 Contributing

### Development Guide

See [docs/IMPLEMENTATION_GUIDE.md](./docs/IMPLEMENTATION_GUIDE.md) for detailed instructions on:
- How the Resource Registry works
- How to add additional resources (optional)
- Code patterns and best practices
- Testing guidelines

### Contribution Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Write/update tests
5. Run tests: `npm test`
6. Build: `npm run build:prod`
7. Commit: `git commit -m "feat: add your feature"`
8. Push: `git push origin feature/your-feature`
9. Open a Pull Request

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Accessibility checked

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **SWAPI:** The Star Wars API (https://swapi.info/)
- **Lorem Picsum:** Seeded placeholder images (https://picsum.photos/)
- **Angular Team:** For the amazing framework
- **Tailwind CSS:** For the utility-first CSS framework

---

## 📞 Support

For questions or issues:
1. Check [docs/IMPLEMENTATION_GUIDE.md](./docs/IMPLEMENTATION_GUIDE.md)
2. Review existing issues on GitHub
3. Create a new issue with detailed description

---

**May the Force be with you! 🌌**
