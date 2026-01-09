import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PeopleService, PicsumImageService } from '@core/services';
import { Person } from '@core/models';

import { PageContainerComponent } from '@shared/components/page-container/page-container.component';
import { LoadingStateComponent } from '@shared/components/loading-state/loading-state.component';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';
import { extractIdFromUrl, handleImageError, translateGender } from '@shared/utilities';

/**
 * Component for displaying a list of Star Wars characters/people
 *
 * Features:
 * - Card-based grid layout (3 columns on desktop, responsive)
 * - Loading state with spinner
 * - Error handling with user-friendly messages
 * - Navigation to detail view
 * - Pagination support
 *
 * @example
 * ```html
 * <app-people-list></app-people-list>
 * ```
 */
@Component({
  selector: 'app-people-list',
  standalone: true,
  imports: [CommonModule, RouterModule, PageContainerComponent, LoadingStateComponent, ErrorStateComponent],
  templateUrl: './people-list.component.html'
})
export class PeopleListComponent implements OnInit, OnDestroy {
  private peopleService = inject(PeopleService);
  private picsumImageService = inject(PicsumImageService);

  translateGender = translateGender;
  extractId = extractIdFromUrl;
  onImageError = handleImageError;

  /** Array of people to display */
  people: Array<Person & { imageUrl: string }> = [];

  /** Full array of people from the API (used for client-side pagination) */
  private allPeople: Person[] = [];

  /** Loading state flag */
  isLoading: boolean = true;

  /** Error message to display */
  errorMessage: string = '';

  /** Current page number */
  currentPage: number = 1;

  /** Items per page for client-side pagination */
  private readonly pageSize: number = 12;

  /** Total count of people */
  totalCount: number = 0;

  /** Flag for next page availability */
  hasNextPage: boolean = false;

  /** Flag for previous page availability */
  hasPreviousPage: boolean = false;

  /** Subject for managing subscriptions */
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadPeople();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Loads people from the API
   * @param page Page number to load (default: current page)
   */
  loadPeople(page: number = this.currentPage): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (this.allPeople.length > 0) {
      this.applyPage(page);
      this.isLoading = false;
      return;
    }

    this.peopleService.getPeople()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (people) => {
          this.allPeople = people;
          this.applyPage(page);
          this.isLoading = false;

          console.log('People loaded successfully:', this.people.length, 'items');
        },
        error: (error) => {
          this.errorMessage = 'Fehler beim Laden der Charaktere. Bitte versuchen Sie es später erneut.';
          this.isLoading = false;

          console.error('Error loading people:', error);
        }
      });
  }

  private applyPage(page: number): void {
    const totalPages = Math.max(1, Math.ceil(this.allPeople.length / this.pageSize));
    const safePage = Math.min(Math.max(page, 1), totalPages);

    const startIndex = (safePage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.people = this.allPeople.slice(startIndex, endIndex).map((person) => ({
      ...person,
      imageUrl: this.picsumImageService.getPersonImageUrl(person)
    }));
    this.totalCount = this.allPeople.length;
    this.currentPage = safePage;

    this.hasPreviousPage = safePage > 1;
    this.hasNextPage = endIndex < this.totalCount;
  }

  /**
   * Loads the next page of people
   */
  loadNextPage(): void {
    if (this.hasNextPage) {
      this.loadPeople(this.currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Loads the previous page of people
   */
  loadPreviousPage(): void {
    if (this.hasPreviousPage) {
      this.loadPeople(this.currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Retries loading people after an error
   */
  retry(): void {
    this.loadPeople();
  }
}
