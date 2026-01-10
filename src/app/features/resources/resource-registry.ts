import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { FilmsService, PeopleService, PlanetsService } from '@core/services';
import { Film, FilmWithId, Person, PersonWithId, Planet, PlanetWithId } from '@core/models';
import { extractIdFromUrl, translateGender } from '@shared/utilities';

/**
 * Supported resource keys that are exposed in routing and UI.
 */
export type ResourceKey = 'people' | 'films' | 'planets';

/**
 * RouterLink commands array used by related blocks to generate navigation links.
 */
export type RouterLinkCommands = Array<string | number>;

/**
 * Field definition for rendering labeled values in the UI.
 */
export interface UiField<T> {
  label: string;
  value: (item: T) => string;
}

/**
 * Image definition used by cards and detail views.
 * A stable `seed` allows deterministic placeholder image generation.
 */
export interface ImageDefinition<T> {
  seed: (item: T) => string;
  size: { width: number; height: number };
}

/**
 * Definition for a related content block that loads a single related resource.
 */
export interface RelatedSingleBlock<TMain> {
  kind: 'single';
  title: string;
  getUrl: (main: TMain) => string | null;
  load: (url: string) => Observable<unknown>;
  link: (item: unknown) => RouterLinkCommands;
  label: (item: unknown) => string;
}

/**
 * Definition for a related content block that loads a list of related resources.
 */
export interface RelatedListBlock<TMain> {
  kind: 'list';
  title: string;
  getUrls: (main: TMain) => string[];
  load: (urls: string[]) => Observable<unknown[]>;
  link: (item: unknown) => RouterLinkCommands;
  label: (item: unknown) => string;
  subtitle?: (item: unknown) => string;
  image?: ImageDefinition<unknown>;
  limit?: number;
}

/**
 * Union of the supported related block kinds.
 */
export type RelatedBlock<TMain> = RelatedSingleBlock<TMain> | RelatedListBlock<TMain>;

/**
 * Configuration contract for resources.
 *
 * The registry centralizes UI metadata (titles, fields, images, related blocks)
 * and the data access functions used by list and detail views.
 */
export interface ResourceDefinition<TList, TDetail> {
  key: ResourceKey;

  routeBase: string;
  titles: {
    listTitle: string;
    detailKicker: string;
    documentTitleList: string;
    documentTitleDetail: string;
  };

  list: {
    pageSize: number;
    loadingMessage: string;
    emptyMessage: string;
    errorMessage: string;

    getAll: () => Observable<TList[]>;
    sort?: (items: TList[]) => TList[];

    image: ImageDefinition<TList>;
    cardTitle: (item: TList) => string;
    cardFields: UiField<TList>[];
  };

  detail: {
    loadingMessage: string;
    errorMessage: string;
    backLabel: string;

    getById: (id: number) => Observable<TDetail>;
    title: (item: TDetail) => string;
    subtitle?: (item: TDetail) => string;
    image: ImageDefinition<TDetail>;
    fields: UiField<TDetail>[];
    related: Array<RelatedBlock<TDetail>>;
  };
}

export type AnyResourceDefinition =
  | ResourceDefinition<Person, PersonWithId>
  | ResourceDefinition<Film, FilmWithId>
  | ResourceDefinition<Planet, PlanetWithId>;

/**
 * Type guard for validating a route/param value as a supported resource key.
 */
export function isResourceKey(value: unknown): value is ResourceKey {
  return value === 'people' || value === 'films' || value === 'planets';
}

/**
 * Formats an ISO date string using German locale.
 * Falls back to the input if parsing fails.
 */
function formatGermanDate(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  return new Date(ms).toLocaleDateString('de-DE');
}

/**
 * Derives a stable image seed based on a SWAPI URL id or a string fallback.
 */
function seedFromUrl(prefix: string, url: string, fallback: string): string {
  const id = extractIdFromUrl(url);
  return id !== null ? `${prefix}-${id}` : `${prefix}-${fallback}`;
}

/**
 * Service that provides a single source of truth for resource metadata.
 *
 * The registry maps each `ResourceKey` to a `ResourceDefinition` that contains
 * list/detail titles, UI fields, image settings and related resource resolvers.
 */
@Injectable({
  providedIn: 'root'
})
export class ResourceRegistryService {
  private peopleService = inject(PeopleService);
  private filmsService = inject(FilmsService);
  private planetsService = inject(PlanetsService);

  /**
   * Returns the resource definition used to render list and detail pages.
   *
   * @param key Resource key
   */
  getDefinition(key: ResourceKey): AnyResourceDefinition {
    switch (key) {
      case 'people':
        return this.getPeopleDefinition();
      case 'films':
        return this.getFilmsDefinition();
      case 'planets':
        return this.getPlanetsDefinition();
    }
  }

  // Builds the definition for the People resource.
  private getPeopleDefinition(): ResourceDefinition<Person, PersonWithId> {
    return {
      key: 'people',
      routeBase: 'people',
      titles: {
        listTitle: 'Personen',
        detailKicker: 'Personen Details',
        documentTitleList: 'Personen | Star Wars',
        documentTitleDetail: 'Personen Details | Star Wars'
      },
      list: {
        pageSize: 12,
        loadingMessage: 'Personen werden geladen...',
        emptyMessage: 'Keine Personen gefunden.',
        errorMessage: 'Fehler beim Laden der Personen. Bitte versuchen Sie es später erneut.',
        getAll: () => this.peopleService.getPeople(),
        image: {
          seed: (person) => seedFromUrl('person', person.url, person.name),
          size: { width: 600, height: 400 }
        },
        cardTitle: (person) => person.name,
        cardFields: [
          { label: 'Geburtsjahr', value: (p) => p.birth_year },
          { label: 'Geschlecht', value: (p) => translateGender(p.gender) },
          { label: 'Größe', value: (p) => `${p.height} cm` }
        ]
      },
      detail: {
        loadingMessage: 'Details werden geladen...',
        errorMessage: 'Fehler beim Laden der Details. Bitte versuchen Sie es später erneut.',
        backLabel: 'Zurück zur Liste',
        getById: (id) => this.peopleService.getPersonById(id),
        title: (person) => person.name,
        image: {
          seed: (person) => `person-${person.id}`,
          size: { width: 600, height: 400 }
        },
        fields: [
          {
            label: 'Größe',
            value: (p) => (p.height !== 'unknown' ? `${p.height} cm` : 'unknown')
          },
          {
            label: 'Gewicht',
            value: (p) => (p.mass !== 'unknown' ? `${p.mass} kg` : 'unknown')
          },
          { label: 'Haarfarbe', value: (p) => p.hair_color },
          { label: 'Augenfarbe', value: (p) => p.eye_color },
          { label: 'Geburtsjahr', value: (p) => p.birth_year },
          { label: 'Geschlecht', value: (p) => translateGender(p.gender) }
        ],
        related: [
          {
            kind: 'single',
            title: 'Heimatplanet',
            getUrl: (p) => p.homeworld || null,
            load: (url) => this.peopleService.getHomeworld(url),
            link: (planet) => {
              const id = extractIdFromUrl((planet as Planet).url);
              return id === null ? ['/', 'planets'] : ['/', 'planets', id];
            },
            label: (planet) => (planet as Planet).name
          },
          {
            kind: 'list',
            title: 'Filme',
            getUrls: (p) => p.films,
            load: (urls) => this.peopleService.getFilms(urls),
            link: (film) => {
              const id = extractIdFromUrl((film as Film).url);
              return id === null ? ['/', 'films'] : ['/', 'films', id];
            },
            label: (film) => (film as Film).title,
            subtitle: (film) => `Episode ${(film as Film).episode_id}`,
            image: {
              seed: (film) => seedFromUrl('film', (film as Film).url, (film as Film).title),
              size: { width: 512, height: 256 }
            }
          }
        ]
      }
    };
  }

  // Builds the definition for the Films resource.
  private getFilmsDefinition(): ResourceDefinition<Film, FilmWithId> {
    return {
      key: 'films',
      routeBase: 'films',
      titles: {
        listTitle: 'Filme',
        detailKicker: 'Film Details',
        documentTitleList: 'Filme | Star Wars',
        documentTitleDetail: 'Film Details | Star Wars'
      },
      list: {
        pageSize: 12,
        loadingMessage: 'Filme werden geladen...',
        emptyMessage: 'Keine Filme gefunden.',
        errorMessage: 'Fehler beim Laden der Filme. Bitte versuchen Sie es später erneut.',
        getAll: () => this.filmsService.getFilms(),
        sort: (films) => this.filmsService.sortByEpisode(films),
        image: {
          seed: (film) => seedFromUrl('film', film.url, film.title),
          size: { width: 512, height: 256 }
        },
        cardTitle: (film) => film.title,
        cardFields: [
          { label: 'Episodennr', value: (f) => `${f.episode_id}` },
          { label: 'Regisseur', value: (f) => f.director },
          { label: 'Veröffentlichung', value: (f) => formatGermanDate(f.release_date) }
        ]
      },
      detail: {
        loadingMessage: 'Filme werden geladen...',
        errorMessage: 'Fehler beim Laden der Filme. Bitte versuchen Sie es später erneut.',
        backLabel: 'Zurück zur Liste',
        getById: (id) => this.filmsService.getFilmById(id),
        title: (film) => film.title,
        subtitle: (film) => `Episode ${film.episode_id}`,
        image: {
          seed: (film) => `film-${film.id}`,
          size: { width: 600, height: 400 }
        },
        fields: [
          { label: 'Episodennr', value: (f) => `${f.episode_id}` },
          { label: 'Regisseur', value: (f) => f.director },
          { label: 'Produzent', value: (f) => f.producer },
          { label: 'Veröffentlichung', value: (f) => formatGermanDate(f.release_date) }
        ],
        related: [
          {
            kind: 'list',
            title: 'Personen',
            getUrls: (f) => f.characters,
            load: (urls) => this.filmsService.getCharacters(urls),
            link: (person) => {
              const id = extractIdFromUrl((person as Person).url);
              return id === null ? ['/', 'people'] : ['/', 'people', id];
            },
            label: (person) => (person as Person).name,
            image: {
              seed: (person) => seedFromUrl('person', (person as Person).url, (person as Person).name),
              size: { width: 512, height: 256 }
            }
          },
          {
            kind: 'list',
            title: 'Planete',
            getUrls: (f) => f.planets,
            load: (urls) => this.filmsService.getPlanets(urls),
            link: (planet) => {
              const id = extractIdFromUrl((planet as Planet).url);
              return id === null ? ['/', 'planets'] : ['/', 'planets', id];
            },
            label: (planet) => (planet as Planet).name,
            image: {
              seed: (planet) => seedFromUrl('planet', (planet as Planet).url, (planet as Planet).name),
              size: { width: 512, height: 256 }
            }
          }
        ]
      }
    };
  }

  // Builds the definition for the Planets resource.
  private getPlanetsDefinition(): ResourceDefinition<Planet, PlanetWithId> {
    return {
      key: 'planets',
      routeBase: 'planets',
      titles: {
        listTitle: 'Planete',
        detailKicker: 'Planet Details',
        documentTitleList: 'Planete | Star Wars',
        documentTitleDetail: 'Planet Details | Star Wars'
      },
      list: {
        pageSize: 12,
        loadingMessage: 'Planete werden geladen...',
        emptyMessage: 'Keine Planete gefunden.',
        errorMessage: 'Fehler beim Laden der Planete. Bitte versuchen Sie es später erneut.',
        getAll: () => this.planetsService.getPlanets(),
        sort: (planets) => this.planetsService.sortByName(planets),
        image: {
          seed: (planet) => seedFromUrl('planet', planet.url, planet.name),
          size: { width: 600, height: 400 }
        },
        cardTitle: (planet) => planet.name,
        cardFields: [
          { label: 'Klima', value: (p) => p.climate },
          { label: 'Terrain', value: (p) => p.terrain },
          { label: 'Bevölkerung', value: (p) => p.population }
        ]
      },
      detail: {
        loadingMessage: 'Details werden geladen...',
        errorMessage: 'Fehler beim Laden der Details. Bitte versuchen Sie es später erneut.',
        backLabel: 'Zurück zur Liste',
        getById: (id) => this.planetsService.getPlanetById(id),
        title: (planet) => planet.name,
        image: {
          seed: (planet) => `planet-${planet.id}`,
          size: { width: 600, height: 400 }
        },
        fields: [
          { label: 'Durchmesser', value: (p) => p.diameter },
          { label: 'Rotationsdauer', value: (p) => p.rotation_period },
          { label: 'Umlaufzeit', value: (p) => p.orbital_period },
          { label: 'Klima', value: (p) => p.climate },
          { label: 'Gravitation', value: (p) => p.gravity },
          { label: 'Terrain', value: (p) => p.terrain },
          { label: 'Wasserbedeckung', value: (p) => p.surface_water },
          { label: 'Bevölkerung', value: (p) => p.population }
        ],
        related: [
          {
            kind: 'list',
            title: 'Bewohner',
            getUrls: (p) => p.residents,
            load: (urls) => this.planetsService.getResidents(urls),
            link: (person) => {
              const id = extractIdFromUrl((person as Person).url);
              return id === null ? ['/', 'people'] : ['/', 'people', id];
            },
            label: (person) => (person as Person).name,
            image: {
              seed: (person) => seedFromUrl('person', (person as Person).url, (person as Person).name),
              size: { width: 512, height: 256 }
            }
          },
          {
            kind: 'list',
            title: 'Filme',
            getUrls: (p) => p.films,
            load: (urls) => this.planetsService.getFilms(urls),
            link: (film) => {
              const id = extractIdFromUrl((film as Film).url);
              return id === null ? ['/', 'films'] : ['/', 'films', id];
            },
            label: (film) => (film as Film).title,
            subtitle: (film) => `Episode ${(film as Film).episode_id}`,
            image: {
              seed: (film) => seedFromUrl('film', (film as Film).url, (film as Film).title),
              size: { width: 512, height: 256 }
            }
          }
        ]
      }
    };
  }
}
