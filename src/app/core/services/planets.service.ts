import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SwapiService } from './swapi.service';
import { Planet, PlanetWithId, Person, Film } from '@core/models';

/**
 * Service for managing Star Wars planets data from SWAPI
 * Extends base SwapiService with planet-specific functionality
 *
 * @example
 * ```typescript
 * // In a component:
 * constructor(private planetsService: PlanetsService) {}
 *
 * ngOnInit() {
 *   this.planetsService.getPlanets().subscribe(response => {
 *     this.planets = response.results;
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class PlanetsService extends SwapiService {
  /**
   * Fetches a list of planets
   *
   * @returns Observable of planets array
   */
  getPlanets(): Observable<Planet[]> {
    return this.getList<Planet>('planets');
  }

  /**
   * Fetches a single planet by ID
   *
   * @param id Planet ID
   * @returns Observable of planet data
   */
  getPlanetById(id: number): Observable<PlanetWithId> {
    return this.getById<Planet>('planets', id).pipe(
      map(planet => ({ ...planet, id }))
    );
  }

  /**
   * Fetches a planet with all related data resolved
   * Includes: residents, films (limited for performance)
   *
   * @param id Planet ID
   * @returns Observable of planet with resolved related data
   */
  getPlanetWithRelatedData(id: number): Observable<{
    planet: PlanetWithId;
    residents: Person[];
    films: Film[];
  }> {
    return this.getPlanetById(id).pipe(
      switchMap((planet) => {
        const limitedResidentUrls = planet.residents.slice(0, 5);
        const limitedFilmUrls = planet.films.slice(0, 5);

        const residents$ = limitedResidentUrls.length > 0
          ? forkJoin(limitedResidentUrls.map((residentUrl) => this.getByUrl<Person>(residentUrl)))
          : of<Person[]>([]);

        const films$ = limitedFilmUrls.length > 0
          ? forkJoin(limitedFilmUrls.map((filmUrl) => this.getByUrl<Film>(filmUrl)))
          : of<Film[]>([]);

        return forkJoin({
          planet: of(planet),
          residents: residents$,
          films: films$
        });
      })
    );
  }

  /**
   * Fetches residents for a planet
   *
   * @param residentUrls Array of resident URLs
   * @returns Observable of array of people
   */
  getResidents(residentUrls: string[]): Observable<Person[]> {
    const residentRequests = residentUrls.map(url => this.getByUrl<Person>(url));
    return forkJoin(residentRequests);
  }

  /**
   * Fetches films for a planet
   *
   * @param filmUrls Array of film URLs
   * @returns Observable of array of films
   */
  getFilms(filmUrls: string[]): Observable<Film[]> {
    const filmRequests = filmUrls.map(url => this.getByUrl<Film>(url));
    return forkJoin(filmRequests);
  }

  /**
   * Sorts planets by name
   *
   * @param planets Array of planets
   * @returns Sorted array of planets
   */
  sortByName(planets: Planet[]): Planet[] {
    return planets.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Sorts planets by population (descending)
   * Filters out planets with unknown population
   *
   * @param planets Array of planets
   * @returns Sorted array of planets
   */
  sortByPopulation(planets: Planet[]): Planet[] {
    return planets
      .filter(p => p.population !== 'unknown')
      .sort((a, b) => parseInt(b.population) - parseInt(a.population));
  }

  /**
   * Filters planets by climate
   *
   * @param planets Array of planets
   * @param climate Climate to filter by
   * @returns Filtered array of planets
   */
  filterByClimate(planets: Planet[], climate: string): Planet[] {
    return planets.filter(p =>
      p.climate.toLowerCase().includes(climate.toLowerCase())
    );
  }

  /**
   * Filters planets by terrain
   *
   * @param planets Array of planets
   * @param terrain Terrain to filter by
   * @returns Filtered array of planets
   */
  filterByTerrain(planets: Planet[], terrain: string): Planet[] {
    return planets.filter(p =>
      p.terrain.toLowerCase().includes(terrain.toLowerCase())
    );
  }
}
