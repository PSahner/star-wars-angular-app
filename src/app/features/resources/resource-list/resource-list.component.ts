import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PicsumImageService } from '@core/services';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '@shared/components/loading-state/loading-state.component';
import { PageContainerComponent } from '@shared/components/page-container/page-container.component';
import { handleImageError, extractIdFromUrl } from '@shared/utilities';

import { ResourceAddModalComponent } from '../resource-add-modal/resource-add-modal.component';
import { ResourceRegistryService, ResourceKey, isResourceKey, ResourceDefinition } from '../resource-registry';

type AnyListItem = Record<string, unknown> & { url: string };

type ListViewModel = AnyListItem & {
  id: number | null;
  imageUrl: string;
};

/**
 * Generic list page for SWAPI resources (e.g. people, films, planets).
 *
 * @description
 * The concrete resource type is selected via `route.data.resourceKey` and resolved through
 * {@link ResourceRegistryService}. The registry definition controls the list title, fields,
 * image strategy and data loading function.
 *
 * Features:
 * - Client-side pagination (page size defined per resource in the registry)
 * - Loading and error states with retry
 * - Deterministic placeholder images via {@link PicsumImageService}
 *
 * @component
 */
@Component({
  selector: 'app-resource-list',
  standalone: true,
  imports: [NgFor, NgIf, RouterModule, PageContainerComponent, LoadingStateComponent, ErrorStateComponent, ResourceAddModalComponent],
  templateUrl: './resource-list.component.html'
})
export class ResourceListComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private registry = inject(ResourceRegistryService);
  private picsumImageService = inject(PicsumImageService);

  onImageError = handleImageError;

  resourceKey: ResourceKey | null = null;
  definition: ResourceDefinition<unknown, unknown> | null = null;

  items: ListViewModel[] = [];
  private allItems: AnyListItem[] = [];
  private destroy$ = new Subject<void>();

  isLoading = true;
  errorMessage = '';
  currentPage = 1;
  totalCount = 0;
  hasNextPage = false;
  hasPreviousPage = false;
  isAddModalOpen = false;

  /**
   * Returns the total number of pages based on the total item count and the configured page size.
   *
   * @returns Total pages (minimum 1)
   */
  get totalPages(): number {
    const pageSize = this.definition?.list.pageSize ?? 1;
    return Math.max(1, Math.ceil(this.totalCount / pageSize));
  }

  /**
   * Returns the page title for the current resource.
   *
   * @returns Title string
   */
  get listTitle(): string {
    return this.definition?.titles.listTitle ?? '';
  }

  /**
   * Returns the empty-state message for the current resource.
   *
   * @returns Empty-state message
   */
  get emptyMessage(): string {
    return this.definition?.list.emptyMessage ?? '';
  }

  /**
   * Returns the list-card fields to render for the current resource.
   *
   * @returns Array of label/value field descriptors
   */
  get displayFields(): Array<{ label: string; value: (item: AnyListItem) => string }> {
    const fields = this.definition?.list.cardFields ?? [];
    return fields as Array<{ label: string; value: (item: AnyListItem) => string }>;
  }

  /**
   * Returns the function used to compute a list-card title for the current resource.
   *
   * @returns Title getter function
   */
  get cardTitle(): (item: AnyListItem) => string {
    const fn = this.definition?.list.cardTitle;
    return (fn as unknown as (item: AnyListItem) => string) ?? ((item) => item['name']?.toString() ?? item['title']?.toString() ?? '');
  }

  /**
   * Initializes the page based on `route.data.resourceKey` and triggers the initial list load.
   *
   * @returns void
   */
  ngOnInit(): void {
    const dataKey = this.route.snapshot.data['resourceKey'] as unknown;
    if (!isResourceKey(dataKey)) {
      this.isLoading = false;
      this.errorMessage = 'Invalid resource.';
      return;
    }

    this.resourceKey = dataKey;
    this.definition = this.registry.getDefinition(this.resourceKey) as unknown as ResourceDefinition<unknown, unknown>;

    this.loadList();
  }

  /**
   * Cleans up subscriptions.
   *
   * @returns void
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Builds an absolute router link to the detail page for a list item.
   *
   * @param item List item view model
   * @returns Router link commands
   */
  buildDetailLink(item: ListViewModel): Array<string | number> {
    if (!this.definition) return ['/'];
    if (item.id === null) return ['/', this.definition.routeBase];
    return ['/', this.definition.routeBase, item.id];
  }

  /**
   * Loads the list data (first call) or paginates locally (subsequent calls).
   *
   * Data is fetched once per component instance and stored in `allItems`.
   *
   * @param page The requested page number (1-based)
   * @returns void
   */
  loadList(page: number = this.currentPage): void {
    if (!this.definition) return;

    this.isLoading = true;
    this.errorMessage = '';

    if (this.allItems.length > 0) {
      this.applyPage(page);
      this.isLoading = false;
      return;
    }

    const def = this.definition;
    def.list
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          const arr = (items as unknown as AnyListItem[]) ?? [];
          if (def.list.sort) {
            const sortFn = def.list.sort as unknown as (xs: unknown[]) => unknown[];
            this.allItems = sortFn(arr) as AnyListItem[];
          } else {
            this.allItems = arr;
          }
          this.applyPage(page);
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = def.list.errorMessage;
          this.isLoading = false;
          console.error('Error loading list:', error);
        }
      });
  }

  /**
   * Applies client-side pagination and derives view-model fields (ID + imageUrl).
   *
   * @param page The requested page number (1-based)
   * @returns void
   */
  private applyPage(page: number): void {
    if (!this.definition) return;

    const pageSize = this.definition.list.pageSize;
    const totalPages = Math.max(1, Math.ceil(this.allItems.length / pageSize));
    const safePage = Math.min(Math.max(page, 1), totalPages);

    const startIndex = (safePage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const imageSeed = (this.definition.list.image.seed as unknown as (item: AnyListItem) => string);
    const imageSize = this.definition.list.image.size;

    this.items = this.allItems.slice(startIndex, endIndex).map((item) => {
      const id = extractIdFromUrl(item.url);
      return {
        ...item,
        id,
        imageUrl: this.picsumImageService.getSeededImageUrl(imageSeed(item), imageSize)
      };
    });

    this.totalCount = this.allItems.length;
    this.currentPage = safePage;

    this.hasPreviousPage = safePage > 1;
    this.hasNextPage = endIndex < this.totalCount;
  }

  /**
   * Navigates to the next list page (if available) and scrolls to the top.
   *
   * @returns void
   */
  loadNextPage(): void {
    if (this.hasNextPage) {
      this.loadList(this.currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Navigates to the previous list page (if available) and scrolls to the top.
   *
   * @returns void
   */
  loadPreviousPage(): void {
    if (this.hasPreviousPage) {
      this.loadList(this.currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Retries loading after an error by clearing cached items and reloading page 1.
   *
   * @returns void
   */
  retry(): void {
    this.allItems = [];
    this.loadList(1);
  }

  openAddModal(): void {
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
  }
}
