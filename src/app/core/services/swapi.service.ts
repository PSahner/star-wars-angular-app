import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry, shareReplay, tap } from 'rxjs/operators';

/**
 * Base service for SWAPI (Star Wars API) operations
 * Provides common functionality for all feature services:
 * - HTTP client configuration
 * - Error handling
 * - Retry logic
 * - Optional caching mechanism
 *
 * @example
 * ```typescript
 * export class PeopleService extends SwapiService {
 *   constructor() {
 *     super(inject(HttpClient));
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class SwapiService {
  /** Base URL for SWAPI Reborn API */
  protected readonly baseUrl = 'https://swapi.info/api';

  /** Number of retry attempts for failed requests */
  protected readonly retryAttempts = 3;

  /** Cache for API responses (URL -> Observable) */
  private cache = new Map<string, Observable<unknown>>();

  /** Flag to enable/disable caching */
  protected enableCache = true;

  constructor(protected http: HttpClient) {}

  /**
   * Makes a GET request to the specified endpoint
   * Includes automatic retry logic and error handling
   *
   * @template T The expected response type
   * @param endpoint The API endpoint (relative to baseUrl)
   * @param useCache Whether to use cached response if available
   * @returns Observable of the response data
   */
  protected get<T>(endpoint: string, useCache: boolean = this.enableCache): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;

    // Check cache if enabled
    if (useCache && this.cache.has(url)) {
      console.log(`[SwapiService] Returning cached response for: ${url}`);
      return this.cache.get(url) as Observable<T>;
    }

    // Make HTTP request
    const request$ = this.http.get<T>(url).pipe(
      retry(this.retryAttempts), // Retry failed requests
      tap(() => console.log(`[SwapiService] Successfully fetched: ${url}`)),
      catchError((error: HttpErrorResponse) => this.handleError(error)),
      shareReplay(1) // Share result among multiple subscribers
    );

    // Cache the request if enabled
    if (useCache) {
      this.cache.set(url, request$ as Observable<unknown>);
    }

    return request$;
  }

  /**
   * Makes a GET request for a list of resources
   *
   * @template T The type of items in the returned array
   * @param resource The resource name (e.g., 'people', 'films')
   * @returns Observable of list response
   */
  protected getList<T>(resource: string): Observable<T[]> {
    const endpoint = `${resource}/`;
    return this.get<unknown>(endpoint).pipe(
      map((raw): T[] => {
        const normalized = this.normalizeArrayResponse<T>(raw);
        if (normalized) {
          return normalized;
        }

        console.warn(`[SwapiService] Unexpected list response shape for: ${this.baseUrl}/${endpoint}`, raw);
        throw new Error('Unexpected list response shape');
      })
    );
  }

  private normalizeArrayResponse<T>(raw: unknown): T[] | null {
    if (Array.isArray(raw)) {
      return raw as T[];
    }

    if (!this.isRecord(raw)) {
      return null;
    }

    const results = raw['results'];
    if (Array.isArray(results)) {
      return results as T[];
    }

    const result = raw['result'];
    if (Array.isArray(result)) {
      return result as T[];
    }

    const data = raw['data'];
    if (Array.isArray(data)) {
      return data as T[];
    }

    return null;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  /**
   * Makes a GET request for a single resource by ID
   *
   * @template T The expected resource type
   * @param resource The resource name (e.g., 'people', 'films')
   * @param id The resource ID
   * @returns Observable of the resource data
   */
  protected getById<T>(resource: string, id: number): Observable<T> {
    return this.get<T>(`${resource}/${id}`);
  }

  /**
   * Extracts the ID from a SWAPI resource URL
   *
   * @param url The full resource URL (e.g., 'https://swapi.info/api/people/1/')
   * @returns The extracted ID, or null if extraction fails
   *
   * @example
   * ```typescript
   * extractIdFromUrl('https://swapi.info/api/people/1/') // Returns: 1
   * ```
   */
  protected extractIdFromUrl(url: string): number | null {
    const match = url.match(/\/(\d+)\/?$/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Fetches data from a full SWAPI URL (not just endpoint)
   * Useful for following resource links
   *
   * @template T The expected response type
   * @param url The full URL to fetch
   * @returns Observable of the response data
   */
  protected getByUrl<T>(url: string): Observable<T> {
    // Check cache if enabled
    if (this.enableCache && this.cache.has(url)) {
      console.log(`[SwapiService] Returning cached response for: ${url}`);
      return this.cache.get(url) as Observable<T>;
    }

    const request$ = this.http.get<T>(url).pipe(
      retry(this.retryAttempts),
      tap(() => console.log(`[SwapiService] Successfully fetched: ${url}`)),
      catchError((error: HttpErrorResponse) => this.handleError(error)),
      shareReplay(1)
    );

    // Cache the request if enabled
    if (this.enableCache) {
      this.cache.set(url, request$ as Observable<unknown>);
    }

    return request$;
  }

  /**
   * Clears the entire cache
   * Useful when fresh data is needed
   */
  clearCache(): void {
    console.log('[SwapiService] Clearing cache');
    this.cache.clear();
  }

  /**
   * Clears cache for a specific URL
   *
   * @param url The URL to remove from cache
   */
  clearCacheForUrl(url: string): void {
    console.log(`[SwapiService] Clearing cache for: ${url}`);
    this.cache.delete(url);
  }

  /**
   * Handles HTTP errors with detailed logging
   * Converts HTTP errors into user-friendly error messages
   *
   * @param error The HTTP error response
   * @returns Observable that throws a formatted error message
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Network error: ${error.error.message}`;
      console.error('[SwapiService] Client-side error:', error.error.message);
    } else {
      // Backend returned an unsuccessful response code
      errorMessage = `Server error: ${error.status} - ${error.message}`;
      console.error(
        `[SwapiService] Backend returned code ${error.status}, ` +
        `body was: ${JSON.stringify(error.error)}`
      );
    }

    // Return an observable with a user-facing error message
    return throwError(() => new Error(errorMessage));
  }
}
