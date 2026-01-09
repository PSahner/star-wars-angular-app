import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { PeopleService, PicsumImageService, ThemeService } from '@core/services';
import { PersonWithId, Planet, Film } from '@core/models';
import { PageContainerComponent } from '@shared/components/page-container/page-container.component';
import { LoadingStateComponent } from '@shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';
import { DragScrollDirective } from '@shared/directives';
import {
  extractIdFromUrl,
  handleImageError,
  resolveImageUrl,
  translateGender as translateGenderUtil
} from '@shared/utilities';

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
 */
@Component({
  selector: 'app-people-detail',
  standalone: true,
  imports: [DatePipe, NgFor, NgIf, RouterModule, PageContainerComponent, LoadingStateComponent, ErrorStateComponent, DragScrollDirective],
  templateUrl: './people-detail.component.html'
})
export class PeopleDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private peopleService = inject(PeopleService);
  private picsumImageService = inject(PicsumImageService);
  public themeService = inject(ThemeService);

  person: (PersonWithId & { imageUrl: string }) | null = null;
  homeworld: Planet | null = null;
  films: Array<Film & { imageUrl: string }> = [];
  isLoading = true;
  errorMessage = '';
  // Subject for managing subscriptions
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
    const person = this.person;
    if (!person) return '';

    return resolveImageUrl(person, () => this.picsumImageService.getPersonImageUrl(person));
  }

  /**
   * Gets the film image URL
   * @param film Film object
   * @returns Image URL
   */
  getFilmImage(film: Film): string {
    return resolveImageUrl(film, () => this.picsumImageService.getFilmImageUrl(film));
  }

  /**
   * Extracts ID from SWAPI URL
   * @param url SWAPI resource URL
   * @returns Extracted ID or null
   */
  extractId(url: string): number | null {
    return extractIdFromUrl(url);
  }

  /**
   * Handles image loading errors by providing a fallback
   * @param event Image error event
   */
  onImageError(event: Event): void {
    handleImageError(event);
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
    return translateGenderUtil(gender);
  }
}
