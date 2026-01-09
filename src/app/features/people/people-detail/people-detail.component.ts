import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { PeopleService, PicsumImageService, ThemeService } from '@core/services';
import { PersonWithId, Planet, Film } from '@core/models';
import { PageContainerComponent } from '@shared/components/page-container/page-container.component';
import { LoadingStateComponent } from '@shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';

/**
 * Component for displaying detailed information about a Star Wars character
 *
 * Features:
 * - Large character image on right (desktop) or top (mobile)
 * - Detailed character information
 * - Homeworld (planet) link
 * - Related films as horizontal scrollable cards
 * - Loading state with spinner
 * - Error handling
 *
 * @example
 * ```html
 * <app-people-detail></app-people-detail>
 * ```
 */
@Component({
  selector: 'app-people-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, PageContainerComponent, LoadingStateComponent, ErrorStateComponent],
  templateUrl: './people-detail.component.html'
})
export class PeopleDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private peopleService = inject(PeopleService);
  private picsumImageService = inject(PicsumImageService);
  public themeService = inject(ThemeService);

  /** Current person/character */
  person: (PersonWithId & { imageUrl: string }) | null = null;

  /** Character's homeworld */
  homeworld: Planet | null = null;

  /** Films the character appears in */
  films: Array<Film & { imageUrl: string }> = [];

  /** Loading state flag */
  isLoading: boolean = true;

  /** Error message to display */
  errorMessage: string = '';

  /** Subject for managing subscriptions */
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Get person ID from route and load data
    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          const id = parseInt(params['id'], 10);
          this.isLoading = true;
          this.errorMessage = '';
          return this.peopleService.getPersonById(id);
        })
      )
      .subscribe({
        next: (person) => {
          this.person = {
            ...person,
            imageUrl: this.picsumImageService.getPersonImageUrl(person, { width: 600, height: 400 })
          };
          this.loadRelatedData();
        },
        error: (error) => {
          this.errorMessage = 'Fehler beim Laden des Charakters. Bitte versuchen Sie es später erneut.';
          this.isLoading = false;
          console.error('Error loading person:', error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Loads related data (homeworld and films) for the character
   */
  private loadRelatedData(): void {
    if (!this.person) {
      this.isLoading = false;
      return;
    }

    const homeworld$ = this.person.homeworld
      ? this.peopleService.getHomeworld(this.person.homeworld)
      : of<Planet | null>(null);

    const films$ = this.person.films && this.person.films.length > 0
      ? this.peopleService.getFilms(this.person.films.slice(0, 5))
      : of<Film[]>([]);

    forkJoin({ homeworld: homeworld$, films: films$ })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.homeworld = results.homeworld;
          this.films = results.films.map((film) => ({
            ...film,
            imageUrl: this.picsumImageService.getFilmImageUrl(film, { width: 512, height: 256 })
          }));
          this.isLoading = false;

          console.log('Related data loaded successfully');
        },
        error: (error) => {
          // Even if related data fails, show the character
          this.isLoading = false;
          console.warn('Error loading related data:', error);
        }
      });
  }

  /**
   * Retries loading the character after an error
   */
  retry(): void {
    this.ngOnInit();
  }

  /**
   * Gets the character image URL
   * @returns Image URL
   */
  getCharacterImage(): string {
    if (!this.person) return '';
    const maybeImageUrl = (this.person as unknown as { imageUrl?: unknown }).imageUrl;
    if (typeof maybeImageUrl === 'string') {
      return maybeImageUrl;
    }

    return this.picsumImageService.getPersonImageUrl(this.person, { width: 600, height: 400 });
  }

  /**
   * Gets the film image URL
   * @param film Film object
   * @returns Image URL
   */
  getFilmImage(film: Film): string {
    const maybeImageUrl = (film as unknown as { imageUrl?: unknown }).imageUrl;
    if (typeof maybeImageUrl === 'string') {
      return maybeImageUrl;
    }

    return this.picsumImageService.getFilmImageUrl(film, { width: 512, height: 256 });
  }

  /**
   * Extracts ID from SWAPI URL
   * @param url SWAPI resource URL
   * @returns Extracted ID or null
   */
  extractId(url: string): number | null {
    const match = url.match(/\/(\d+)\/?$/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Handles image loading errors by providing a fallback
   * @param event Image error event
   */
  onImageError(event: Event): void {
    const img = event.target;
    if (img instanceof HTMLImageElement) {
      img.src = 'assets/images/character-placeholder.png';
    }
  }

  /**
   * Gets the homeworld ID for routing
   * @returns Planet ID or null
   */
  getHomeworldId(): number | null {
    return this.person && this.person.homeworld ? this.extractId(this.person.homeworld) : null;
  }

  /**
   * Translates gender to German
   * @param gender Gender in English
   * @returns Translated gender
   */
  translateGender(gender: string): string {
    const translations: { [key: string]: string } = {
      'male': 'Männlich',
      'female': 'Weiblich',
      'hermaphrodite': 'Hermaphrodit',
      'n/a': 'Nicht zutreffend',
      'unknown': 'Unbekannt'
    };
    return translations[gender.toLowerCase()] || gender;
  }
}
