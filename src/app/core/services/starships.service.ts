import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SwapiService } from './swapi.service';
import { Starship, StarshipWithId, Person, Film } from '@core/models';

/**
 * Service for managing Star Wars starships data from SWAPI
 * Extends base SwapiService with starship-specific functionality
 */
@Injectable({
  providedIn: 'root'
})
export class StarshipsService extends SwapiService {
  /**
   * Fetches a list of starships
   *
   * @returns Observable of starships array
   */
  getStarships(): Observable<Starship[]> {
    return this.getList<Starship>('starships');
  }

  /**
   * Fetches a single starship by ID
   *
   * @param id Starship ID
   * @returns Observable of starship data
   */
  getStarshipById(id: number): Observable<StarshipWithId> {
    return this.getById<Starship>('starships', id).pipe(
      map(starship => ({ ...starship, id }))
    );
  }

  /**
   * Fetches a starship with all related data resolved
   * Includes: pilots, films (limited for performance)
   *
   * @param id Starship ID
   * @returns Observable of starship with resolved related data
   */
  getStarshipWithRelatedData(id: number): Observable<{
    starship: StarshipWithId;
    pilots: Person[];
    films: Film[];
  }> {
    return this.getStarshipById(id).pipe(
      switchMap((starship) => {
        const limitedPilotUrls = starship.pilots.slice(0, 5);
        const limitedFilmUrls = starship.films.slice(0, 5);

        const pilots$ = limitedPilotUrls.length > 0
          ? forkJoin(limitedPilotUrls.map((pilotUrl) => this.getByUrl<Person>(pilotUrl)))
          : of<Person[]>([]);

        const films$ = limitedFilmUrls.length > 0
          ? forkJoin(limitedFilmUrls.map((filmUrl) => this.getByUrl<Film>(filmUrl)))
          : of<Film[]>([]);

        return forkJoin({
          starship: of(starship),
          pilots: pilots$,
          films: films$
        });
      })
    );
  }

  /**
   * Fetches pilots for a starship
   *
   * @param pilotUrls Array of pilot URLs
   * @returns Observable of array of people
   */
  getPilots(pilotUrls: string[]): Observable<Person[]> {
    const pilotRequests = pilotUrls.map(url => this.getByUrl<Person>(url));
    return forkJoin(pilotRequests);
  }

  /**
   * Fetches films for a starship
   *
   * @param filmUrls Array of film URLs
   * @returns Observable of array of films
   */
  getFilms(filmUrls: string[]): Observable<Film[]> {
    const filmRequests = filmUrls.map(url => this.getByUrl<Film>(url));
    return forkJoin(filmRequests);
  }

  /**
   * Sorts starships by name
   *
   * @param starships Array of starships
   * @returns Sorted array of starships
   */
  sortByName(starships: Starship[]): Starship[] {
    return starships.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Sorts starships by cost (ascending)
   * Filters out starships with unknown cost
   *
   * @param starships Array of starships
   * @returns Sorted array of starships
   */
  sortByCost(starships: Starship[]): Starship[] {
    return starships
      .filter(s => s.cost_in_credits !== 'unknown')
      .sort((a, b) => parseInt(a.cost_in_credits) - parseInt(b.cost_in_credits));
  }
}
