import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { FilmsService, PeopleService, PlanetsService } from '@core/services';
import { Film, FilmWithId, Person, PersonWithId, Planet, PlanetWithId } from '@core/models';
import { ResourceDefinition, ResourceRegistryService, isResourceKey } from './resource-registry';

describe('resource-registry', () => {
  it('isResourceKey should validate known keys', () => {
    expect(isResourceKey('people')).toBeTrue();
    expect(isResourceKey('films')).toBeTrue();
    expect(isResourceKey('planets')).toBeTrue();

    expect(isResourceKey('')).toBeFalse();
    expect(isResourceKey('vehicles')).toBeFalse();
    expect(isResourceKey(null)).toBeFalse();
  });
});

describe('ResourceRegistryService', () => {
  let registry: ResourceRegistryService;

  let peopleService: jasmine.SpyObj<PeopleService>;
  let filmsService: jasmine.SpyObj<FilmsService>;
  let planetsService: jasmine.SpyObj<PlanetsService>;

  beforeEach(() => {
    peopleService = jasmine.createSpyObj<PeopleService>('PeopleService', ['getPeople', 'getPersonById', 'getHomeworld', 'getFilms']);
    filmsService = jasmine.createSpyObj<FilmsService>('FilmsService', ['getFilms', 'getFilmById', 'sortByEpisode', 'getCharacters', 'getPlanets']);
    planetsService = jasmine.createSpyObj<PlanetsService>('PlanetsService', ['getPlanets', 'getPlanetById', 'sortByName', 'getResidents', 'getFilms']);

    peopleService.getPeople.and.returnValue(of([]));
    peopleService.getPersonById.and.returnValue(of({} as unknown as PersonWithId));
    peopleService.getHomeworld.and.returnValue(of({} as unknown as Planet));
    peopleService.getFilms.and.returnValue(of([]));

    filmsService.getFilms.and.returnValue(of([]));
    filmsService.getFilmById.and.returnValue(of({} as unknown as FilmWithId));
    filmsService.sortByEpisode.and.callFake((xs: unknown[]) => xs as never);
    filmsService.getCharacters.and.returnValue(of([]));
    filmsService.getPlanets.and.returnValue(of([]));

    planetsService.getPlanets.and.returnValue(of([]));
    planetsService.getPlanetById.and.returnValue(of({} as unknown as PlanetWithId));
    planetsService.sortByName.and.callFake((xs: unknown[]) => xs as never);
    planetsService.getResidents.and.returnValue(of([]));
    planetsService.getFilms.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        ResourceRegistryService,
        { provide: PeopleService, useValue: peopleService },
        { provide: FilmsService, useValue: filmsService },
        { provide: PlanetsService, useValue: planetsService }
      ]
    });

    registry = TestBed.inject(ResourceRegistryService);
  });

  it('should provide a people definition with deterministic image seed based on URL id', () => {
    const def = registry.getDefinition('people') as unknown as ResourceDefinition<Person, PersonWithId>;

    const seedWithId = def.list.image.seed({ url: 'https://swapi.info/api/people/12/', name: 'Luke' } as never);
    expect(seedWithId).toBe('person-12');

    const seedWithoutId = def.list.image.seed({ url: 'invalid-url', name: 'Luke' } as never);
    expect(seedWithoutId).toBe('person-Luke');
  });

  it('people list.getAll should delegate to PeopleService', () => {
    const def = registry.getDefinition('people') as unknown as ResourceDefinition<Person, PersonWithId>;

    def.list.getAll().subscribe();
    expect(peopleService.getPeople).toHaveBeenCalled();
  });

  it('people list cardFields should render birth year and height', () => {
    const def = registry.getDefinition('people') as unknown as ResourceDefinition<Person, PersonWithId>;

    const birthField = def.list.cardFields.find((f) => f.label === 'Geburtsjahr');
    const heightField = def.list.cardFields.find((f) => f.label === 'Größe');

    expect(birthField).toBeTruthy();
    expect(heightField).toBeTruthy();

    expect(birthField!.value({ birth_year: '19BBY' } as Person)).toBe('19BBY');
    expect(heightField!.value({ height: '172' } as Person)).toBe('172 cm');
  });

  it('should translate people gender in list card fields', () => {
    const def = registry.getDefinition('people') as unknown as ResourceDefinition<Person, PersonWithId>;
    const genderField = def.list.cardFields.find((f) => f.label === 'Geschlecht');
    expect(genderField).toBeTruthy();

    expect(genderField!.value({ gender: 'male' } as never)).toBe('Männlich');
    expect(genderField!.value({ gender: 'UNKNOWN' } as never)).toBe('Unbekannt');
  });

  it('should format people detail fields for height/mass', () => {
    const def = registry.getDefinition('people') as unknown as ResourceDefinition<Person, PersonWithId>;

    const heightField = def.detail.fields.find((f) => f.label === 'Größe');
    const massField = def.detail.fields.find((f) => f.label === 'Gewicht');

    expect(heightField).toBeTruthy();
    expect(massField).toBeTruthy();

    expect(heightField!.value({ height: '180' } as never)).toBe('180 cm');
    expect(heightField!.value({ height: 'unknown' } as never)).toBe('unknown');

    expect(massField!.value({ mass: '80' } as never)).toBe('80 kg');
    expect(massField!.value({ mass: 'unknown' } as never)).toBe('unknown');
  });

  it('people detail title and image seed should use name/id', () => {
    const def = registry.getDefinition('people') as unknown as ResourceDefinition<Person, PersonWithId>;

    expect(def.detail.title({ name: 'Luke' } as PersonWithId)).toBe('Luke');
    expect(def.detail.image.seed({ id: 5 } as PersonWithId)).toBe('person-5');
  });

  it('people related blocks should execute getUrl/getUrls/label/subtitle/link/image.seed', () => {
    const def = registry.getDefinition('people') as unknown as ResourceDefinition<Person, PersonWithId>;

    const homeworldBlock = def.detail.related.find(
      (b) => b.kind === 'single' && b.title === 'Heimatplanet'
    ) as unknown as {
      getUrl: (p: PersonWithId) => string | null;
      label: (x: unknown) => string;
      link: (x: unknown) => unknown;
    };

    expect(homeworldBlock.getUrl({ homeworld: '' } as PersonWithId)).toBeNull();
    expect(homeworldBlock.getUrl({ homeworld: 'https://swapi.info/api/planets/1/' } as PersonWithId)).toContain(
      '/planets/1/'
    );
    expect(homeworldBlock.label({ name: 'Tatooine' } as Planet)).toBe('Tatooine');
    expect(homeworldBlock.link({ url: 'invalid' } as Planet)).toEqual(['/', 'planets']);

    const filmsBlock = def.detail.related.find((b) => b.kind === 'list' && b.title === 'Filme') as unknown as {
      getUrls: (p: PersonWithId) => string[];
      label: (x: unknown) => string;
      subtitle: (x: unknown) => string;
      link: (x: unknown) => unknown;
      image: { seed: (x: unknown) => string };
    };

    const urls = filmsBlock.getUrls({ films: ['a', 'b'] } as PersonWithId);
    expect(urls).toEqual(['a', 'b']);
    expect(filmsBlock.label({ title: 'A New Hope' } as Film)).toBe('A New Hope');
    expect(filmsBlock.subtitle({ episode_id: 4 } as Film)).toBe('Episode 4');
    expect(filmsBlock.link({ url: 'invalid' } as Film)).toEqual(['/', 'films']);
    expect(filmsBlock.image.seed({ url: 'invalid', title: 'X' } as Film)).toBe('film-X');
  });

  it('should provide a films definition that delegates sorting to FilmsService', () => {
    const def = registry.getDefinition('films') as unknown as ResourceDefinition<Film, FilmWithId>;
    const items = [{ episode_id: 2 }, { episode_id: 1 }];

    const sorted = def.list.sort!(items as never);

    expect(filmsService.sortByEpisode).toHaveBeenCalled();
    expect(sorted).toBe(items as never);
  });

  it('films list.getAll should delegate to FilmsService and seed should support fallback', () => {
    const def = registry.getDefinition('films') as unknown as ResourceDefinition<Film, FilmWithId>;

    def.list.getAll().subscribe();
    expect(filmsService.getFilms).toHaveBeenCalled();

    expect(def.list.image.seed({ url: 'https://swapi.info/api/films/3/', title: 't' } as Film)).toBe('film-3');
    expect(def.list.image.seed({ url: 'invalid', title: 'Fallback' } as Film)).toBe('film-Fallback');
  });

  it('should format film release date (valid and invalid)', () => {
    const def = registry.getDefinition('films') as unknown as ResourceDefinition<Film, FilmWithId>;
    const releaseField = def.list.cardFields.find((f) => f.label === 'Veröffentlichung');
    expect(releaseField).toBeTruthy();

    const iso = '1977-05-25';
    const expected = new Date(Date.parse(iso)).toLocaleDateString('de-DE');
    expect(releaseField!.value({ release_date: iso } as never)).toBe(expected);

    const invalid = 'not-a-date';
    expect(releaseField!.value({ release_date: invalid } as never)).toBe(invalid);
  });

  it('films detail subtitle and image seed should use episode/id', () => {
    const def = registry.getDefinition('films') as unknown as ResourceDefinition<Film, FilmWithId>;

    expect(def.detail.subtitle!({ episode_id: 6 } as FilmWithId)).toBe('Episode 6');
    expect(def.detail.image.seed({ id: 7 } as FilmWithId)).toBe('film-7');
  });

  it('films related blocks should execute getUrls/label/link/image.seed for people and planets', () => {
    const def = registry.getDefinition('films') as unknown as ResourceDefinition<Film, FilmWithId>;

    const peopleBlock = def.detail.related.find((b) => b.kind === 'list' && b.title === 'Personen') as unknown as {
      getUrls: (f: FilmWithId) => string[];
      label: (x: unknown) => string;
      link: (x: unknown) => unknown;
      image: { seed: (x: unknown) => string };
    };

    expect(peopleBlock.getUrls({ characters: ['c1'] } as FilmWithId)).toEqual(['c1']);
    expect(peopleBlock.label({ name: 'Luke' } as Person)).toBe('Luke');
    expect(peopleBlock.link({ url: 'invalid' } as Person)).toEqual(['/', 'people']);
    expect(peopleBlock.image.seed({ url: 'invalid', name: 'Luke' } as Person)).toBe('person-Luke');

    const planetsBlock = def.detail.related.find((b) => b.kind === 'list' && b.title === 'Planete') as unknown as {
      getUrls: (f: FilmWithId) => string[];
      label: (x: unknown) => string;
      link: (x: unknown) => unknown;
      image: { seed: (x: unknown) => string };
    };

    expect(planetsBlock.getUrls({ planets: ['p1'] } as FilmWithId)).toEqual(['p1']);
    expect(planetsBlock.label({ name: 'Tatooine' } as Planet)).toBe('Tatooine');
    expect(planetsBlock.link({ url: 'invalid' } as Planet)).toEqual(['/', 'planets']);
    expect(planetsBlock.image.seed({ url: 'invalid', name: 'Tatooine' } as Planet)).toBe('planet-Tatooine');
  });

  it('should build related links based on extracted IDs', () => {
    const peopleDef = registry.getDefinition('people') as unknown as ResourceDefinition<Person, PersonWithId>;
    const homeworldBlock = peopleDef.detail.related.find((b) => b.kind === 'single' && b.title === 'Heimatplanet');
    expect(homeworldBlock).toBeTruthy();

    const homeLinkWithId = (homeworldBlock as never as { link: (x: unknown) => unknown }).link({ url: 'https://swapi.info/api/planets/1/' });
    expect(homeLinkWithId).toEqual(['/', 'planets', 1]);

    const homeLinkWithoutId = (homeworldBlock as never as { link: (x: unknown) => unknown }).link({ url: 'invalid' });
    expect(homeLinkWithoutId).toEqual(['/', 'planets']);

    const filmsDef = registry.getDefinition('films') as unknown as ResourceDefinition<Film, FilmWithId>;
    const peopleBlock = filmsDef.detail.related.find((b) => b.kind === 'list' && b.title === 'Personen');
    expect(peopleBlock).toBeTruthy();

    const pLink = (peopleBlock as never as { link: (x: unknown) => unknown }).link({ url: 'https://swapi.info/api/people/5/' });
    expect(pLink).toEqual(['/', 'people', 5]);

    const planetsDef = registry.getDefinition('planets') as unknown as ResourceDefinition<Planet, PlanetWithId>;
    const filmsBlock = planetsDef.detail.related.find((b) => b.kind === 'list' && b.title === 'Filme');
    expect(filmsBlock).toBeTruthy();

    const fLink = (filmsBlock as never as { link: (x: unknown) => unknown }).link({ url: 'https://swapi.info/api/films/2/' });
    expect(fLink).toEqual(['/', 'films', 2]);
  });

  it('planets list.getAll and sort should delegate to PlanetsService', () => {
    const def = registry.getDefinition('planets') as unknown as ResourceDefinition<Planet, PlanetWithId>;

    def.list.getAll().subscribe();
    expect(planetsService.getPlanets).toHaveBeenCalled();

    const items = [{ name: 'b' }, { name: 'a' }];
    def.list.sort!(items as never);
    expect(planetsService.sortByName).toHaveBeenCalled();
  });

  it('planets related blocks should execute getUrls/label/subtitle/link/image.seed for residents and films', () => {
    const def = registry.getDefinition('planets') as unknown as ResourceDefinition<Planet, PlanetWithId>;

    const residentsBlock = def.detail.related.find((b) => b.kind === 'list' && b.title === 'Bewohner') as unknown as {
      getUrls: (p: PlanetWithId) => string[];
      label: (x: unknown) => string;
      link: (x: unknown) => unknown;
      image: { seed: (x: unknown) => string };
    };

    expect(residentsBlock.getUrls({ residents: ['r1'] } as PlanetWithId)).toEqual(['r1']);
    expect(residentsBlock.label({ name: 'Luke' } as Person)).toBe('Luke');
    expect(residentsBlock.link({ url: 'invalid' } as Person)).toEqual(['/', 'people']);
    expect(residentsBlock.image.seed({ url: 'invalid', name: 'Luke' } as Person)).toBe('person-Luke');

    const filmsBlock = def.detail.related.find((b) => b.kind === 'list' && b.title === 'Filme') as unknown as {
      getUrls: (p: PlanetWithId) => string[];
      label: (x: unknown) => string;
      subtitle: (x: unknown) => string;
      link: (x: unknown) => unknown;
      image: { seed: (x: unknown) => string };
    };

    expect(filmsBlock.getUrls({ films: ['f1'] } as PlanetWithId)).toEqual(['f1']);
    expect(filmsBlock.label({ title: 'A New Hope' } as Film)).toBe('A New Hope');
    expect(filmsBlock.subtitle({ episode_id: 4 } as Film)).toBe('Episode 4');
    expect(filmsBlock.link({ url: 'invalid' } as Film)).toEqual(['/', 'films']);
    expect(filmsBlock.image.seed({ url: 'invalid', title: 'X' } as Film)).toBe('film-X');
  });
});
