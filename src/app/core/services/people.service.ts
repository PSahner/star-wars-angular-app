import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SwapiService } from './swapi.service';
import { Person, PersonWithId, Film, Planet } from '@core/models';

/**
 * Service for managing Star Wars characters/people data from SWAPI
 * Extends base SwapiService with people-specific functionality
 *
 * @example
 * ```typescript
 * // In a component:
 * constructor(private peopleService: PeopleService) {}
 *
 * ngOnInit() {
 *   this.peopleService.getPeople().subscribe(response => {
 *     this.people = response;
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class PeopleService extends SwapiService {
  /**
   * Fetches a list of people
   *
   * @param page Page number (default: 1)
   * @returns Observable of paginated people response
   */
  getPeople(): Observable<Person[]> {
    return this.getList<Person>('people');
  }

  /**
   * Fetches a single person by ID
   *
   * @param id Person ID
   * @returns Observable of person data
   */
  getPersonById(id: number): Observable<PersonWithId> {
    return this.getById<Person>('people', id).pipe(
      map(person => ({ ...person, id }))
    );
  }

  /**
   * Fetches a person with all related data resolved
   * Includes: homeworld, films
   *
   * @param id Person ID
   * @returns Observable of person with resolved related data
   */
  getPersonWithRelatedData(id: number): Observable<{
    person: PersonWithId;
    homeworld: Planet | null;
    films: Film[];
  }> {
    return this.getPersonById(id).pipe(
      switchMap((person) => {
        const homeworld$ = person.homeworld
          ? this.getByUrl<Planet>(person.homeworld)
          : of<Planet | null>(null);

        const limitedFilmUrls = person.films.slice(0, 5);
        const films$ = limitedFilmUrls.length > 0
          ? forkJoin(limitedFilmUrls.map((filmUrl) => this.getByUrl<Film>(filmUrl)))
          : of<Film[]>([]);

        return forkJoin({
          person: of(person),
          homeworld: homeworld$,
          films: films$
        });
      })
    );
  }

  /**
   * Fetches homeworld data for a person
   *
   * @param homeworldUrl URL of the homeworld
   * @returns Observable of planet data
   */
  getHomeworld(homeworldUrl: string): Observable<Planet> {
    return this.getByUrl<Planet>(homeworldUrl);
  }

  /**
   * Fetches film data for a person
   *
   * @param filmUrls Array of film URLs
   * @returns Observable of array of films
   */
  getFilms(filmUrls: string[]): Observable<Film[]> {
    const filmRequests = filmUrls.map(url => this.getByUrl<Film>(url));
    return forkJoin(filmRequests);
  }

  /**
   * Searches people by name
   * Note: SWAPI doesn't support search, this is a client-side filter
   *
   * @param query Search query
   * @returns Observable of filtered people
   */
  searchPeople(query: string): Observable<Person[]> {
    return this.getPeople().pipe(
      map((people) =>
        people.filter((person) => person.name.toLowerCase().includes(query.toLowerCase()))
      )
    );
  }
}
