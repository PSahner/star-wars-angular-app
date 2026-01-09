import { Injectable } from '@angular/core';
import { Film, Person, PersonWithId } from '@core/models';

/**
 * Size configuration for Picsum image URLs.
 */
export interface PicsumImageSize {
  width: number;
  height: number;
}

/**
 * Service for generating deterministic placeholder image URLs using picsum.photos.
 *
 * Features:
 * - Seeded image URLs for stable images per resource
 * - Convenience helpers for people and films
 */
@Injectable({
  providedIn: 'root'
})
export class PicsumImageService {
  /**
   * Builds a seeded Picsum image URL.
   *
   * @param seed Unique seed string for deterministic images
   * @param size Image size
   * @returns Fully qualified Picsum image URL
   */
  getSeededImageUrl(seed: string, size: PicsumImageSize): string {
    const normalizedSeed = encodeURIComponent(seed);
    const { width, height } = this.normalizeSize(size);
    return `https://picsum.photos/seed/${normalizedSeed}/${width}/${height}`;
  }

  /**
   * Builds a seeded image URL for a person.
   *
   * Uses the numeric ID when available; otherwise falls back to the person's name.
   *
   * @param person Person resource
   * @param size Image size (default: 600x400)
   * @returns Fully qualified Picsum image URL
   */
  getPersonImageUrl(person: Person | PersonWithId, size: PicsumImageSize = { width: 600, height: 400 }): string {
    const id = this.getResourceId(person);
    const seed = id !== null ? `person-${id}` : `person-${person.name}`;
    return this.getSeededImageUrl(seed, size);
  }

  /**
   * Builds a seeded image URL for a film.
   *
   * Uses the numeric ID extracted from the film URL when available; otherwise
   * falls back to the film title.
   *
   * @param film Film resource
   * @param size Image size (default: 512x256)
   * @returns Fully qualified Picsum image URL
   */
  getFilmImageUrl(film: Film, size: PicsumImageSize = { width: 512, height: 256 }): string {
    const id = this.extractIdFromUrl(film.url);
    const seed = id !== null ? `film-${id}` : `film-${film.title}`;
    return this.getSeededImageUrl(seed, size);
  }

  /**
   * Resolves a numeric resource ID.
   *
   * @param resource Person resource
   * @returns Extracted numeric ID or null
   */
  private getResourceId(resource: Person | PersonWithId): number | null {
    if ('id' in resource && typeof resource.id === 'number') {
      return resource.id;
    }

    return this.extractIdFromUrl(resource.url);
  }

  /**
   * Extracts the trailing numeric ID from a SWAPI-style resource URL.
   *
   * @param url Resource URL
   * @returns Extracted numeric ID or null
   */
  private extractIdFromUrl(url: string): number | null {
    const match = url.match(/\/(\d+)\/?$/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Normalizes image size values.
   *
   * Ensures both dimensions are positive integers.
   *
   * @param size Desired image size
   * @returns Normalized image size
   */
  private normalizeSize(size: PicsumImageSize): PicsumImageSize {
    const width = Math.max(1, Math.floor(size.width));
    const height = Math.max(1, Math.floor(size.height));
    return { width, height };
  }
}
