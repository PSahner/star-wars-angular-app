# Implementation Guide: Star Wars Angular App

## 📋 Table of Contents
1. [Overview](#overview)
2. [What's Already Implemented](#whats-already-implemented)
3. [What You Need to Implement](#what-you-need-to-implement)
4. [Step-by-Step Implementation Guide](#step-by-step-implementation-guide)
5. [Code Patterns & Best Practices](#code-patterns--best-practices)
6. [Testing Guidelines](#testing-guidelines)
7. [Deployment Instructions](#deployment-instructions)

---

## 🎯 Overview

This project provides a **complete reference implementation** of the People (Charaktere) feature that you can replicate for Films and Planets features. The architecture, services, and components are production-ready and follow Angular 18 best practices.

**Time Estimate:** 3-4 hours to complete Films and Planets features

---

## ✅ What's Already Implemented

### Complete Service Layer
- ✅ `SwapiService` (base service with HTTP, caching, error handling, retry logic)
- ✅ `PeopleService` with GET methods and unit tests
- ✅ `FilmsService` with GET methods and unit tests
- ✅ `StarshipsService` with GET methods and unit tests
- ✅ `PlanetsService` with GET methods and unit tests

### Complete TypeScript Models
- ✅ All interfaces: `Person`, `Film`, `Starship`, `Planet`
- ✅ Helper types: `PersonWithId`, `FilmWithId`, `StarshipWithId`, `PlanetWithId`

### Complete People Feature (Reference Implementation)
- ✅ `PeopleListComponent` - Card grid layout with pagination
- ✅ `PeopleDetailComponent` - Detailed view with related data
- ✅ Full unit tests for both components
- ✅ Routing configuration

### Shared Components
- ✅ `HeaderComponent` - Navigation and search bar
- ✅ `LoadingStateComponent` - Reusable loading UI
- ✅ `ErrorStateComponent` - Reusable error UI with optional retry
- ✅ `AppComponent` - Root component

### Shared Utilities & Directives
- ✅ `src/app/shared/utilities.ts` - Shared helper functions (e.g. `translateGender()`)
- ✅ `appDragScroll` directive - Grab-to-drag horizontal scrolling rows (reusable)
- ✅ `PicsumImageService` - Deterministic seeded placeholder images

### Configuration & CI/CD
- ✅ Angular 18 configuration
- ✅ Tailwind CSS setup
- ✅ GitHub Actions workflows (deploy, test) + reusable CI workflow
- ✅ ESLint + Prettier configured (lint enforced in CI)

---

## 📝 What You Need to Implement

### 0. Frontpage (Startseite)
- [ ] Add a simple landing page route (`/`)
- [ ] Display only the `StarWarsLogoComponent` inside `PageContainerComponent`
- [ ] Apply generous vertical padding (top + bottom)
- [ ] Size the logo to ~75-80% of the layout container with a `max-width: 989px`

### 1. Films Feature
- [ ] `FilmsListComponent` (list view)
- [ ] `FilmsDetailComponent` (detail view)
- [ ] Unit tests for Films components
- [ ] Routing configuration

### 2. Planets Feature
- [ ] `PlanetsListComponent` (list view)
- [ ] `PlanetsDetailComponent` (detail view)
- [ ] Unit tests for Planets components
- [ ] Routing configuration

### 3. Optional Enhancements
- [ ] Starships feature (if time permits)
- [ ] Add modal overlays for "Add" forms (UI-only)
- [ ] Search functionality
- [ ] Advanced filtering

---

## 🚀 Step-by-Step Implementation Guide

### Step 1: Create Films Feature Components

#### 1.1 Generate Films List Component

```bash
cd src/app/features
mkdir -p films/films-list
```

#### 1.2 Copy People Components as Template

The fastest approach is to copy the People components and adapt them:

```bash
# Copy PeopleListComponent to FilmsListComponent
cp people/people-list/people-list.component.ts films/films-list/films-list.component.ts
cp people/people-list/people-list.component.html films/films-list/films-list.component.html
cp people/people-list/people-list.component.spec.ts films/films-list/films-list.component.spec.ts
```

#### 1.3 Update FilmsListComponent TypeScript

**File:** `src/app/features/films/films-list/films-list.component.ts`

**Changes to make:**
1. Rename class: `PeopleListComponent` → `FilmsListComponent`
2. Change selector: `app-people-list` → `app-films-list`
3. Import `FilmsService` instead of `PeopleService`
4. Change data type: `Person[]` → `Film[]`
5. Update method calls: `getPeople()` → `getFilms()`
6. Update image URL method to use films endpoint
7. Update German text: "Charaktere" → "Filme"

**Key code changes:**

```typescript
import { FilmsService } from '@core/services';
import { Film } from '@core/models';

export class FilmsListComponent implements OnInit, OnDestroy {
  films: Film[] = [];  // Changed from people: Person[]
  private allFilms: Film[] = [];
  
  private filmsService = inject(FilmsService); // Changed service
  
  loadFilms(page: number = this.currentPage): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (this.allFilms.length > 0) {
      this.applyPage(page);
      this.isLoading = false;
      return;
    }

    this.filmsService.getFilms()  // Changed method
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (films) => {
          this.allFilms = films;
          this.applyPage(page);
          // ... rest of the logic
        },
        error: (error) => {
          this.errorMessage = 'Fehler beim Laden der Filme...';  // Updated text
          // ...
        }
      });
  }

  private applyPage(page: number): void {
    // Same client-side pagination pattern as PeopleListComponent
  }
  
  // Use PicsumImageService for deterministic seeded placeholder images
  // (see People feature for reference mapping `imageUrl` onto items)
}
```

#### 1.4 Update FilmsListComponent HTML

**File:** `src/app/features/films/films-list/films-list.component.html`

**Changes to make:**
1. Update page title: "Charaktere" → "Filme"
2. Update loading text: "Lade Charaktere..." → "Lade Filme..."
3. Update error messages
4. Change `*ngFor`: `person of people` → `film of films`
5. Update displayed properties:
   - Show: `film.title`, `film.episode_id`, `film.director`, `film.release_date`
   - Remove: birth_year, gender, height
6. Update route link: `/charaktere/` → `/filme/`
7. Update "More Info" button text if needed

**Example card structure:**

```html
<div *ngFor="let film of films" class="bg-sw-white rounded-lg shadow-lg...">
  <div class="relative h-64 bg-gray-200 overflow-hidden">
    <img [src]="film.imageUrl" [alt]="film.title" ... />
  </div>
  
  <div class="p-6">
    <h3 class="text-xl font-bold text-gray-900 mb-3">{{ film.title }}</h3>
    
    <div class="space-y-2 text-sm text-gray-600 mb-4">
      <div class="flex items-center">
        <span class="font-semibold w-32">Episode:</span>
        <span>{{ film.episode_id }}</span>
      </div>
      <div class="flex items-center">
        <span class="font-semibold w-32">Director:</span>
        <span>{{ film.director }}</span>
      </div>
      <div class="flex items-center">
        <span class="font-semibold w-32">Release:</span>
        <span>{{ film.release_date | date: 'dd.MM.yyyy' }}</span>
      </div>
    </div>

    <a [routerLink]="['/filme', extractId(film.url)]" class="...">
      Mehr Informationen
    </a>
  </div>
</div>
```

#### 1.5 Create Films Detail Component

Follow the same process:

```bash
mkdir -p films/films-detail
cp people/people-detail/* films/films-detail/
```

**File:** `src/app/features/films/films-detail/films-detail.component.ts`

**Key changes:**
1. Rename class: `PeopleDetailComponent` → `FilmsDetailComponent`
2. Change selector: `app-people-detail` → `app-films-detail`
3. Import `FilmsService`
4. Change data type: `PersonWithId` → `FilmWithId`
5. Update method calls: `getPersonById()` → `getFilmById()`
6. Load related data: characters, planets, starships
7. Update German text

**Key code changes:**

```typescript
export class FilmsDetailComponent implements OnInit, OnDestroy {
  film: FilmWithId | null = null;
  characters: Person[] = [];
  planets: Planet[] = [];
  starships: Starship[] = [];

  private route = inject(ActivatedRoute);
  private filmsService = inject(FilmsService);
  
  ngOnInit(): void {
    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          const id = parseInt(params['id'], 10);
          this.isLoading = true;
          return this.filmsService.getFilmById(id);
        })
      )
      .subscribe({
        next: (film) => {
          this.film = film;
          this.loadRelatedData();
        },
        // ... error handling
      });
  }
  
  private loadRelatedData(): void {
    if (!this.film) return;
    
    const requests: any = {};
    
    if (this.film.characters && this.film.characters.length > 0) {
      requests.characters = this.filmsService.getCharacters(
        this.film.characters.slice(0, 5)
      );
    }
    
    if (this.film.planets && this.film.planets.length > 0) {
      requests.planets = this.filmsService.getPlanets(
        this.film.planets.slice(0, 5)
      );
    }
    
    // ... similar for starships
    
    forkJoin(requests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.characters = results.characters || [];
          this.planets = results.planets || [];
          this.starships = results.starships || [];
          this.isLoading = false;
        },
        // ... error handling
      });
  }
}
```

**File:** `src/app/features/films/films-detail/films-detail.component.html`

**Key changes:**
1. Update header: "Characterdetails" → "Filmdetails"
2. Update title: `{{ film.title }}`
3. Show film-specific details:
   - Episode ID
   - Director
   - Producer
   - Release date
   - Opening crawl (truncated or in expandable section)
4. Show related data sections:
   - Characters (horizontal scroll)
   - Planets (horizontal scroll)
   - Starships (horizontal scroll)

#### 1.6 Update Routing Configuration

**File:** `src/app/app.routes.ts`

Uncomment and activate the Films routes:

```typescript
import { FilmsListComponent } from './features/films/films-list/films-list.component';
import { FilmsDetailComponent } from './features/films/films-detail/films-detail.component';

export const routes: Routes = [
  // ... existing routes
  
  // Films routes
  {
    path: 'filme',
    component: FilmsListComponent,
    title: 'Filme | Star Wars'
  },
  {
    path: 'filme/:id',
    component: FilmsDetailComponent,
    title: 'Film Details | Star Wars'
  },
  
  // ... rest of routes
];
```

#### 1.7 Create Unit Tests

Copy and adapt the People tests:

```bash
# Already copied in step 1.2
```

**File:** `src/app/features/films/films-list/films-list.component.spec.ts`

**Changes:**
1. Rename all references: `People` → `Films`, `Person` → `Film`
2. Update mock data to use `Film` interface
3. Update service spy: `PeopleService` → `FilmsService`
4. Update method calls: `getPeople()` → `getFilms()`
5. Update test expectations to match Film properties

**File:** `src/app/features/films/films-detail/films-detail.component.spec.ts`

Similar changes as above.

---

### Step 2: Create Planets Feature Components

Follow the **exact same process** as Films:

#### 2.1 Create Directory Structure
```bash
mkdir -p src/app/features/planets/planets-list
mkdir -p src/app/features/planets/planets-detail
```

#### 2.2 Copy and Adapt Components

```bash
# Copy from People components
cp people/people-list/* planets/planets-list/
cp people/people-detail/* planets/planets-detail/
```

#### 2.3 Update TypeScript Files

**Key changes for PlanetsListComponent:**
- Import `PlanetsService`
- Change data type: `Person[]` → `Planet[]`
- Update methods: `getPeople()` → `getPlanets()`
- Update image URL: Use planets endpoint
- Update German text: "Charaktere" → "Planeten"

**Key changes for PlanetsDetailComponent:**
- Import `PlanetsService`
- Change data type: `PersonWithId` → `PlanetWithId`
- Update methods: `getPersonById()` → `getPlanetById()`
- Load related data: residents, films
- Update German text

#### 2.4 Update HTML Templates

**For PlanetsListComponent:**
- Update title: "Planeten"
- Show planet properties:
  - Name
  - Climate
  - Terrain
  - Population
  - Diameter
- Update route: `/planeten/`

**For PlanetsDetailComponent:**
- Update header: "Planetdetails"
- Show planet details:
  - Diameter
  - Rotation period
  - Orbital period
  - Climate
  - Gravity
  - Terrain
  - Surface water
  - Population
- Show related sections:
  - Residents (horizontal scroll)
  - Films (horizontal scroll)

#### 2.5 Update Routing

**File:** `src/app/app.routes.ts`

```typescript
import { PlanetsListComponent } from './features/planets/planets-list/planets-list.component';
import { PlanetsDetailComponent } from './features/planets/planets-detail/planets-detail.component';

export const routes: Routes = [
  // ... existing routes
  
  // Planets routes
  {
    path: 'planeten',
    component: PlanetsListComponent,
    title: 'Planeten | Star Wars'
  },
  {
    path: 'planeten/:id',
    component: PlanetsDetailComponent,
    title: 'Planet Details | Star Wars'
  },
  
  // ... rest of routes
];
```

#### 2.6 Create Unit Tests

Copy and adapt from People tests, following the same pattern as Films.

---

## 💡 Code Patterns & Best Practices

### Pattern 1: Component Structure
Every list component follows this structure:
```typescript
export class [Resource]ListComponent implements OnInit, OnDestroy {
  // Data properties
  items: [Type][] = [];
  isLoading = true;
  errorMessage = '';
  
  // Pagination
  currentPage = 1;
  totalCount = 0;
  hasNextPage = false;
  hasPreviousPage = false;
  
  // Cleanup
  private destroy$ = new Subject<void>();
  
  private service = inject([Resource]Service);
  
  ngOnInit(): void {
    this.loadItems();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadItems(page = this.currentPage): void { /* ... */ }
  loadNextPage(): void { /* ... */ }
  loadPreviousPage(): void { /* ... */ }
  retry(): void { /* ... */ }
  // Prefer shared utilities for common helpers
  extractId = extractIdFromUrl;
}
```

### Pattern 2: Detail Component Structure
```typescript
export class [Resource]DetailComponent implements OnInit, OnDestroy {
  // Main item
  item: [Type]WithId | null = null;
  
  // Related data
  relatedData1: Type1[] = [];
  relatedData2: Type2[] = [];
  
  // State
  isLoading = true;
  errorMessage = '';
  
  private destroy$ = new Subject<void>();

  private route = inject(ActivatedRoute);
  private service = inject([Resource]Service);
  
  ngOnInit(): void {
    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          const id = parseInt(params['id'], 10);
          return this.service.getById(id);
        })
      )
      .subscribe({ /* ... */ });
  }
  
  private loadRelatedData(): void { /* ... */ }
}
```

### Pattern 3: HTML Template Structure

**List View:**
```html
<div class="container">
  <h1>{{ title }}</h1>
  
  <!-- Loading State -->
  <div *ngIf="isLoading">...</div>
  
  <!-- Error State -->
  <div *ngIf="!isLoading && errorMessage">...</div>
  
  <!-- Data Grid -->
  <div *ngIf="!isLoading && !errorMessage && items.length > 0">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div *ngFor="let item of items" class="card">
        <!-- Card content -->
      </div>
    </div>
    
    <!-- Pagination -->
    <div class="pagination">...</div>
  </div>
  
  <!-- Empty State -->
  <div *ngIf="!isLoading && !errorMessage && items.length === 0">...</div>
</div>
```

**Detail View:**
```html
<div class="container">
  <div class="back-button">...</div>
  
  <!-- Loading State -->
  <div *ngIf="isLoading">...</div>
  
  <!-- Error State -->
  <div *ngIf="!isLoading && errorMessage">...</div>
  
  <!-- Detail Content -->
  <div *ngIf="!isLoading && !errorMessage && item">
    <!-- Header -->
    <div class="header">{{ item.name }}</div>
    
    <!-- Main Grid (2 columns on desktop) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Left: Details -->
      <div>...</div>
      
      <!-- Right: Image -->
      <div>...</div>
    </div>
    
    <!-- Related Data Sections -->
    <div *ngIf="relatedData.length > 0">
      <h2>Related Items</h2>
      <div class="horizontal-scroll">...</div>
    </div>
  </div>
</div>
```

### Pattern 4: Error Handling
```typescript
this.service.getData()
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (data) => {
      // Success handling
      this.data = data;
      this.isLoading = false;
    },
    error: (error) => {
      // Error handling
      this.errorMessage = 'Fehler beim Laden...';
      this.isLoading = false;
      console.error('Error:', error);
    }
  });
```

### Pattern 5: Image URLs
```typescript
// The app uses PicsumImageService for deterministic seeded placeholder images.
// Map `imageUrl` onto items when loading data, and use shared fallback handling.

onImageError(event: Event): void {
  handleImageError(event);
}
```

---

## 🧪 Testing Guidelines

### Unit Test Structure
Each component should have tests for:

1. **Creation:** Component instantiates successfully
2. **Data Loading:** Data loads on init
3. **Loading State:** isLoading flag works correctly
4. **Error Handling:** Errors are caught and displayed
5. **Pagination:** Next/previous page navigation works
6. **Helper Methods:** extractId, getImage, etc. work correctly
7. **Cleanup:** Subscriptions are cleaned up on destroy

### Running Tests
```bash
# Run all tests
npm test

# Run tests in CI mode (headless)
npm run test:ci

# Run tests with coverage
npm test -- --code-coverage
```

### Test Coverage Goals
- Services: 90%+ coverage
- Components: 80%+ coverage
- Overall: 85%+ coverage

Note: The coverage summary includes **Branches**, which tracks decision coverage (`if/else`, `switch`, ternaries, `&&`/`||`). It's common for branch coverage to lag behind line/statement coverage until error/edge cases are tested. The red/yellow/green colors reflect whether configured thresholds are met; if thresholds are not enforced in CI, treat the summary as informational.

Backlog: Revisit branch coverage and decide whether to enforce coverage thresholds in Karma/CI (and add missing tests for error and edge-case paths).

---

## 🚢 Deployment Instructions

### Local Development
```bash
# Install dependencies
npm install

# Start dev server
npm start

# Open browser to http://localhost:4200
```

### Build for Production
```bash
# Build with production configuration
npm run build:prod

# Output will be in dist/star-wars-angular-app/browser
```

### Deploy to GitHub Pages

#### 1. Setup GitHub Repository
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/star-wars-angular-app.git
git push -u origin main
```

#### 2. Enable GitHub Pages
1. Go to repository Settings
2. Navigate to Pages section
3. Source: GitHub Actions
4. The workflow will automatically deploy on push to main

#### 3. Update base-href
The `package.json` already includes the correct base-href:
```json
"build:prod": "ng build --configuration production --base-href /star-wars-angular-app/"
```

Update `/star-wars-angular-app/` to match your repository name.

#### 4. Push Changes
```bash
git push origin main
```

The GitHub Actions workflow will automatically:
1. Run Aikido Safe Chain security scan
2. Run unit tests
3. Build for production
4. Deploy to GitHub Pages

### Verify Deployment
Your app will be available at:
```
https://YOUR_USERNAME.github.io/star-wars-angular-app/
```

---

## 📊 Implementation Checklist

### Films Feature
- [ ] Create `films/films-list` directory
- [ ] Copy and adapt `FilmsListComponent` from `PeopleListComponent`
- [ ] Update TypeScript (service, types, methods)
- [ ] Update HTML (title, properties, routes)
- [ ] Update SCSS (if needed)
- [ ] Create `films/films-detail` directory
- [ ] Copy and adapt `FilmsDetailComponent` from `PeopleDetailComponent`
- [ ] Update TypeScript (service, types, related data)
- [ ] Update HTML (details, related sections)
- [ ] Copy and adapt unit tests
- [ ] Update `app.routes.ts` with Films routes
- [ ] Test Films list view locally
- [ ] Test Films detail view locally
- [ ] Run unit tests for Films
- [ ] Commit Films feature

### Planets Feature
- [ ] Create `planets/planets-list` directory
- [ ] Copy and adapt `PlanetsListComponent` from `PeopleListComponent`
- [ ] Update TypeScript (service, types, methods)
- [ ] Update HTML (title, properties, routes)
- [ ] Update SCSS (if needed)
- [ ] Create `planets/planets-detail` directory
- [ ] Copy and adapt `PlanetsDetailComponent` from `PeopleDetailComponent`
- [ ] Update TypeScript (service, types, related data)
- [ ] Update HTML (details, related sections)
- [ ] Copy and adapt unit tests
- [ ] Update `app.routes.ts` with Planets routes
- [ ] Test Planets list view locally
- [ ] Test Planets detail view locally
- [ ] Run unit tests for Planets
- [ ] Commit Planets feature

### Final Steps
- [ ] Run all tests: `npm run test:ci`
- [ ] Build for production: `npm run build:prod`
- [ ] Fix any linting errors
- [ ] Commit all changes
- [ ] Push to GitHub
- [ ] Verify deployment on GitHub Pages
- [ ] Test deployed application
- [ ] Document any changes in README.md

---

## 🎨 UI/UX Consistency

Ensure all features maintain consistency:

### Card Layout
- All list views use 3-column grid on desktop
- Cards have consistent padding (p-6)
- Images are 256px height (h-64)
- Consistent hover effects (shadow-2xl, -translate-y-1)

### Detail Layout
- 2-column grid on desktop (details left, image right)
- Responsive stacking on mobile (image on top)
- Consistent spacing and typography
- Related items in horizontal scroll

### Colors & Styling
- Star Wars yellow: `#FFE81F` (text-sw-yellow)
- Black background: `#000000` (bg-sw-black)
- Use Tailwind utility classes consistently

---

## 📞 Support & Resources

### Documentation
- [Angular 18 Documentation](https://angular.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [SWAPI Documentation](https://swapi.info/)

### Code Reference
- `src/app/features/people/` - Complete reference implementation
- `src/app/core/services/` - All service implementations
- `src/app/core/models/` - All TypeScript interfaces

### Common Issues
1. **Routing not working:** Check `app.routes.ts` imports and paths
2. **Images not loading:** Verify image URL construction in `getImage()` methods
3. **Tests failing:** Ensure mock data matches interface structure
4. **Build errors:** Run `npm install` and check TypeScript strict mode

---

## 🎯 Final Notes

- **Priority:** Focus on Films and Planets first
- **Quality:** Maintain the same code quality as the People feature
- **Testing:** Write tests as you go, don't leave them for last
- **Commits:** Make small, frequent commits with descriptive messages
- **Time Management:** Films (1.5-2h) + Planets (1.5-2h) + Testing (30min)

Good luck with your implementation! 🚀
