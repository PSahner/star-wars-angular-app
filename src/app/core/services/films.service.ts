import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SwapiService } from './swapi.service';
import { Film, FilmWithId, Person, Planet, Starship } from '@core/models';

/**
 * Service for managing Star Wars films data from SWAPI
 * Extends base SwapiService with film-specific functionality
 *
 * @example
 * ```typescript
 * // In a component:
 * constructor(private filmsService: FilmsService) {}
 *
 * ngOnInit() {
 *   this.filmsService.getFilms().subscribe(response => {
 *     this.films = response.results;
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class FilmsService extends SwapiService {
  /**
   * Fetches a list of films
   *
   * @returns Observable of films array
   */
  getFilms(): Observable<Film[]> {
    return this.getList<Film>('films');
  }

  /**
   * Fetches a single film by ID
   *
   * @param id Film ID
   * @returns Observable of film data
   */
  getFilmById(id: number): Observable<FilmWithId> {
    return this.getById<Film>('films', id).pipe(
      map(film => ({ ...film, id }))
    );
  }

  /**
   * Fetches a film with all related data resolved
   * Includes: characters, planets, starships (limited for performance)
   *
   * @param id Film ID
   * @returns Observable of film with resolved related data
   */
  getFilmWithRelatedData(id: number): Observable<{
    film: FilmWithId;
    characters: Person[];
    planets: Planet[];
    starships: Starship[];
  }> {
    return this.getFilmById(id).pipe(
      switchMap((film) => {
        const limitedCharacterUrls = film.characters.slice(0, 5);
        const limitedPlanetUrls = film.planets.slice(0, 5);
        const limitedStarshipUrls = film.starships.slice(0, 5);

        const characters$ = limitedCharacterUrls.length > 0
          ? forkJoin(limitedCharacterUrls.map((characterUrl) => this.getByUrl<Person>(characterUrl)))
          : of<Person[]>([]);

        const planets$ = limitedPlanetUrls.length > 0
          ? forkJoin(limitedPlanetUrls.map((planetUrl) => this.getByUrl<Planet>(planetUrl)))
          : of<Planet[]>([]);

        const starships$ = limitedStarshipUrls.length > 0
          ? forkJoin(limitedStarshipUrls.map((starshipUrl) => this.getByUrl<Starship>(starshipUrl)))
          : of<Starship[]>([]);

        return forkJoin({
          film: of(film),
          characters: characters$,
          planets: planets$,
          starships: starships$
        });
      })
    );
  }

  /**
   * Fetches characters for a film
   *
   * @param characterUrls Array of character URLs
   * @returns Observable of array of people
   */
  getCharacters(characterUrls: string[]): Observable<Person[]> {
    const characterRequests = characterUrls.map(url => this.getByUrl<Person>(url));
    return forkJoin(characterRequests);
  }

  /**
   * Fetches planets for a film
   *
   * @param planetUrls Array of planet URLs
   * @returns Observable of array of planets
   */
  getPlanets(planetUrls: string[]): Observable<Planet[]> {
    const planetRequests = planetUrls.map(url => this.getByUrl<Planet>(url));
    return forkJoin(planetRequests);
  }

  /**
   * Fetches starships for a film
   *
   * @param starshipUrls Array of starship URLs
   * @returns Observable of array of starships
   */
  getStarships(starshipUrls: string[]): Observable<Starship[]> {
    const starshipRequests = starshipUrls.map(url => this.getByUrl<Starship>(url));
    return forkJoin(starshipRequests);
  }

  /**
   * Sorts films by episode number
   *
   * @param films Array of films
   * @returns Sorted array of films
   */
  sortByEpisode(films: Film[]): Film[] {
    return films.sort((a, b) => a.episode_id - b.episode_id);
  }

  /**
   * Sorts films by release date
   *
   * @param films Array of films
   * @returns Sorted array of films
   */
  sortByReleaseDate(films: Film[]): Film[] {
    return films.sort((a, b) =>
      new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
    );
  }
}
