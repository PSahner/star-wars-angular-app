# Implementation Guide: Star Wars Angular App

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Key Files](#key-files)
4. [How Data Flows](#how-data-flows)
5. [Adding a New Resource](#adding-a-new-resource)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [FAQ](#faq)

---

## 🎯 Overview

This project renders multiple SWAPI resources using a **registry-driven UI**.

Instead of implementing separate list/detail pages for each resource, we use:

- **`ResourceRegistryService`** to describe how a resource is displayed and loaded
- **`ResourceListComponent`** and **`ResourceDetailComponent`** as generic pages

Supported resource pages today:

- People: `/people`
- Films: `/films`
- Planets: `/planets`

Important constraints:

- **SWAPI Reborn is read-only** (GET only)
- List endpoints return **arrays**, so pagination is implemented **client-side**
- "Add" modals and the header search are **UI-only**

---

## 🧠 Architecture

### Registry-driven resources

The registry lives in:

- `src/app/features/resources/resource-registry.ts`

It defines:

- titles for list/detail (including document titles)
- how to load list and detail data
- card + detail fields (label/value render functions)
- image seeding (Picsum placeholder images)
- related blocks:
  - `kind: 'single'` (load one related entity)
  - `kind: 'list'` (load a list of related entities)

### Generic pages

- `ResourceListComponent`
  - reads `route.data.resourceKey`
  - loads the list once
  - paginates locally using the registry `pageSize`
  - maps each item to a view-model containing `id` and `imageUrl`
- `ResourceDetailComponent`
  - reads `route.data.resourceKey`
  - subscribes to `route.params` for `:id`
  - loads the main item and then resolves related blocks
  - related failures are handled per-block and won’t break the page

---

## 🗂 Key Files

- **Routes**: `src/app/app.routes.ts`
- **Resource UI + loaders**: `src/app/features/resources/resource-registry.ts`
- **Generic pages**:
  - `src/app/features/resources/resource-list/resource-list.component.ts`
  - `src/app/features/resources/resource-detail/resource-detail.component.ts`
- **Core services**:
  - `src/app/core/services/swapi.service.ts` (HTTP + caching + retry + normalization)
  - `src/app/core/services/*.service.ts` (People, Films, Planets, Starships)
- **Theming**: `src/app/core/services/theme.service.ts`
- **Shared utilities**: `src/app/shared/utilities.ts`

---

## 🔁 How Data Flows

1. User navigates to `/people`.
2. `app.routes.ts` maps the route to `ResourceListComponent` and provides `data: { resourceKey: 'people' }`.
3. `ResourceListComponent` asks `ResourceRegistryService` for the definition.
4. The definition’s `list.getAll()` calls a typed feature service (e.g. `PeopleService.getPeople()`).
5. List items are mapped to include:
   - `id` (extracted from SWAPI URL)
   - `imageUrl` (generated via `PicsumImageService` with a deterministic seed)
6. Clicking a card navigates to `/people/:id`.
7. `ResourceDetailComponent` loads the main item and related blocks as configured.

---

## ➕ Adding a New Resource

If you want to add a new SWAPI resource page (e.g. Starships UI), there are **three required updates**:

### 1) Update the resource key types

In `src/app/features/resources/resource-registry.ts`:

- extend the `ResourceKey` union
- extend `isResourceKey(...)`

This keeps routing + registry selection type-safe.

### 2) Add a new registry definition

In `ResourceRegistryService.getDefinition(...)`:

- add a new `case` for your key
- implement a `getXDefinition()` method that fills out list + detail config

### 3) Wire routes

In `src/app/app.routes.ts`:

- add list + detail routes
- pass `data: { resourceKey: 'yourKey' }`

Optional but recommended:

- add a nav entry in `src/app/shared/components/header/header.component.ts`
- add/extend tests in:
  - `src/app/features/resources/resource-registry.spec.ts`
  - `src/app/features/resources/resource-list/resource-list.component.spec.ts`
  - `src/app/features/resources/resource-detail/resource-detail.component.spec.ts`

---

## 🧪 Testing

Commands:

```bash
npm test
npm run test:ci
```

Coverage output:

- `coverage/star-wars-angular-app/`

CI runs:

- `npm run lint`
- `npm run test:ci`
- `npm run build`

Note: Karma coverage thresholds are configured in `karma.conf.js`.

---

## 🚢 Deployment

Deployment target: **GitHub Pages**.

Relevant files:

- `.github/workflows/deploy.yml`
- `package.json` (`build:prod` sets the Pages `base-href`)

Build output:

- `dist/star-wars-angular-app/browser/`

If your repository name differs from `star-wars-angular-app`, update the `--base-href` in `package.json`.

---

## ❓ FAQ

### Why is pagination client-side?

SWAPI Reborn list endpoints return arrays (not paginated responses), so the app loads once per list and paginates in-memory.

### Why doesn’t “Add” persist?

The API is read-only. The modal is intentionally UI-only.

### Why doesn’t search work?

The header search is currently UI-only. A real search could be implemented by either:

- client-side filtering (like `PeopleService.searchPeople()`), or
- adding query support in the service layer (if your API supports it).
