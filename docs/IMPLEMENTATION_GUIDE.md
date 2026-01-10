# Implementation Guide: Star Wars Angular App

## 📋 Table of Contents
1. [Overview](#overview)
2. [What's Already Implemented](#whats-already-implemented)
3. [What's Not Yet Implemented](#whats-not-yet-implemented)
4. [Step-by-Step Implementation Guide](#step-by-step-implementation-guide)
5. [Code Patterns & Best Practices](#code-patterns--best-practices)
6. [Testing Guidelines](#testing-guidelines)
7. [Deployment Instructions](#deployment-instructions)
8. [UI/UX Consistency](#ui-ux-consistency)
9. [Support & Resources](#support--resources)

---

## 🎯 Overview

This project uses a **registry-driven approach** to render SWAPI resources with a single generic list and detail implementation. The UI for each resource (People, Films, Planets) is configured in a central **Resource Registry**.

If you want to add additional resources (e.g. Starships UI), you typically only need to:
- Add a new definition in `src/app/features/resources/resource-registry.ts`
- Add routes in `src/app/app.routes.ts`
- (Optional) Add navigation entries and tests

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
- ✅ Generic list/detail pages:
  - `ResourceListComponent` (list view)
  - `ResourceDetailComponent` (detail view)
- ✅ Resource Registry definitions for:
  - People (`/people`)
  - Films (`/films`)
  - Planets (`/planets`)
- ✅ Unit tests for generic resource components
- ✅ Routing configuration for `/people`, `/films`, `/planets`

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

### 0. Frontpage (Startseite)
- ✅ Add a simple landing page route (`/`)
- ✅ Display only the `StarWarsLogoComponent` inside `PageContainerComponent`
- ✅ Apply generous vertical padding (top + bottom)
- ✅ Size the logo to ~75-80% of the layout container with a `max-width: 989px`

---

## 📝 What's Not Yet Implemented

### Optional Enhancements
- [ ] Starships UI (services exist; UI is not wired yet)
- [ ] Add modal overlays for "Add" forms (UI-only)
- [ ] Search functionality
- [ ] Advanced filtering

---

## 🚀 Step-by-Step Implementation Guide

### Step 1: Add a New Resource via the Resource Registry

Most UI behavior is configured in:

- `src/app/features/resources/resource-registry.ts`

Add a new entry in `ResourceRegistryService.getDefinition(...)` and provide:
- `routeBase` (e.g. `starships`)
- List configuration (`getAll`, card title/fields, image seed/size, optional sorting)
- Detail configuration (`getById`, detail fields, related blocks)

### Step 2: Wire Routes

Add routes in `src/app/app.routes.ts` and point to the generic pages:

```ts
{
  path: 'starships',
  component: ResourceListComponent,
  data: { resourceKey: 'starships' },
  title: 'Starships | Star Wars'
},
{
  path: 'starships/:id',
  component: ResourceDetailComponent,
  data: { resourceKey: 'starships' },
  title: 'Starship Details | Star Wars'
}
```

### Step 3: Update Navigation (Optional)

If you want the new resource to appear in the header navigation, update:

- `src/app/shared/components/header/header.component.html`

### Step 4: Add / Update Unit Tests

The generic resource pages already have unit tests. For a new resource definition you should add:

- A small registry test (or extend existing tests) to ensure the new `resourceKey` returns a valid definition.
- A smoke test verifying that list/detail pages load when the route data selects the new resource.

### Step 5: Related Data Sections

Related sections are configured in the registry as:
- `kind: 'single'` (e.g. homeworld)
- `kind: 'list'` (e.g. films, residents)

Notes:
- Related failures are handled per-block so one failing related request won’t break the page.
- `limit` is supported for large related lists.

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
- Black background: `#000000` (bg-sw-dark-blue)
- Use Tailwind utility classes consistently

---

## 📞 Support & Resources

### Documentation
- [Angular 18 Documentation](https://angular.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [SWAPI Documentation](https://swapi.info/)

### Code Reference
- `src/app/features/resources/` - Generic registry-driven resource pages
- `src/app/core/services/` - All service implementations
- `src/app/core/models/` - All TypeScript interfaces

### Common Issues
1. **Routing not working:** Check `app.routes.ts` imports and paths
2. **Images not loading:** Verify image URL construction in `getImage()` methods
3. **Tests failing:** Ensure mock data matches interface structure
4. **Build errors:** Run `npm install` and check TypeScript strict mode
