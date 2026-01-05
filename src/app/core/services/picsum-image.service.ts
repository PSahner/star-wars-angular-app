import { Injectable } from '@angular/core';
import { Film, Person, PersonWithId } from '@core/models';

export interface PicsumImageSize {
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root'
})
export class PicsumImageService {
  getSeededImageUrl(seed: string, size: PicsumImageSize): string {
    const normalizedSeed = encodeURIComponent(seed);
    const { width, height } = this.normalizeSize(size);
    return `https://picsum.photos/seed/${normalizedSeed}/${width}/${height}`;
  }

  getPersonImageUrl(person: Person | PersonWithId, size: PicsumImageSize = { width: 600, height: 400 }): string {
    const id = this.getResourceId(person);
    const seed = id !== null ? `person-${id}` : `person-${person.name}`;
    return this.getSeededImageUrl(seed, size);
  }

  getFilmImageUrl(film: Film, size: PicsumImageSize = { width: 512, height: 256 }): string {
    const id = this.extractIdFromUrl(film.url);
    const seed = id !== null ? `film-${id}` : `film-${film.title}`;
    return this.getSeededImageUrl(seed, size);
  }

  private getResourceId(resource: Person | PersonWithId): number | null {
    if ('id' in resource && typeof resource.id === 'number') {
      return resource.id;
    }

    return this.extractIdFromUrl(resource.url);
  }

  private extractIdFromUrl(url: string): number | null {
    const match = url.match(/\/(\d+)\/?$/);
    return match ? parseInt(match[1], 10) : null;
  }

  private normalizeSize(size: PicsumImageSize): PicsumImageSize {
    const width = Math.max(1, Math.floor(size.width));
    const height = Math.max(1, Math.floor(size.height));
    return { width, height };
  }
}
