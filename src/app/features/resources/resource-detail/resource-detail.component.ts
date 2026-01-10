import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin, of, Subject, switchMap } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

import { PicsumImageService, ThemeService } from '@core/services';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';
import { LoadingStateComponent } from '@shared/components/loading-state/loading-state.component';
import { PageContainerComponent } from '@shared/components/page-container/page-container.component';
import { DragScrollDirective } from '@shared/directives';
import { handleImageError } from '@shared/utilities';

import {
  ImageDefinition,
  isResourceKey,
  RelatedBlock,
  RelatedListBlock,
  RelatedSingleBlock,
  ResourceDefinition,
  ResourceKey,
  ResourceRegistryService
} from '../resource-registry';

type AnyDetailItem = Record<string, unknown>;

type RelatedResolved = {
  block: RelatedBlock<AnyDetailItem>;
  single: unknown | null;
  list: unknown[];
};

/**
 * Generic detail page for a single SWAPI resource (e.g. person, film, planet).
 *
 * The resource type is selected via `route.data.resourceKey` and resolved through
 * {@link ResourceRegistryService}. The page subscribes to `route.params` to react to ID
 * changes, loads the main item via `definition.detail.getById`, and then optionally loads
 * related entities defined in the registry (single + list blocks).
 *
 * Features:
 * - Loading and error states with retry
 * - Retry reloads the current ID without re-subscribing to route params
 * - Partial related-data failures do not break the page (handled per-block)
 * - Separate light/dark layouts are implemented in the template via {@link ThemeService}
 */
@Component({
  selector: 'app-resource-detail',
  standalone: true,
  imports: [NgFor, NgIf, RouterModule, PageContainerComponent, LoadingStateComponent, ErrorStateComponent, DragScrollDirective],
  templateUrl: './resource-detail.component.html'
})
export class ResourceDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private registry = inject(ResourceRegistryService);
  private picsumImageService = inject(PicsumImageService);
  public themeService = inject(ThemeService);

  onImageError = handleImageError;

  resourceKey: ResourceKey | null = null;
  definition: ResourceDefinition<unknown, unknown> | null = null;

  item: (AnyDetailItem & { imageUrl: string }) | null = null;
  related: RelatedResolved[] = [];

  isLoading = true;
  errorMessage = '';

  private currentId: number | null = null;
  private destroy$ = new Subject<void>();

  /**
   * Initializes the page based on `route.data.resourceKey` and subscribes to route params.
   *
   * Whenever `:id` changes, the component loads the new resource and its related data.
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

    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          const id = parseInt(params['id'], 10);
          this.currentId = Number.isFinite(id) ? id : null;
          return this.currentId === null ? of(null) : this.loadDetail(this.currentId);
        })
      )
      .subscribe();
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
   * Retries loading the current resource without re-subscribing to route params.
   *
   * @returns void
   */
  retry(): void {
    if (this.currentId === null) return;
    void this.loadDetail(this.currentId).subscribe();
  }

  /**
   * Returns a router link back to the current resource list page.
   *
   * @returns Router link commands
   */
  backLink(): Array<string | number> {
    if (!this.definition) return ['/'];
    return ['/', this.definition.routeBase];
  }

  /**
   * Returns the computed title for the current detail item.
   *
   * @returns Title string
   */
  title(): string {
    if (!this.definition || !this.item) return '';
    return (this.definition.detail.title as unknown as (i: AnyDetailItem) => string)(this.item);
  }

  subtitle(): string {
    if (!this.definition || !this.item) return '';
    const fn = this.definition.detail.subtitle as unknown as ((i: AnyDetailItem) => string) | undefined;
    return fn ? fn(this.item) : '';
  }

  /**
   * Returns the kicker (subtitle text above the main heading) configured for the current resource.
   *
   * @returns Kicker string
   */
  kicker(): string {
    return this.definition?.titles.detailKicker ?? '';
  }

  /**
   * Returns the list of field descriptors to render for the current resource.
   *
   * @returns Array of label/value field descriptors
   */
  fields(): Array<{ label: string; value: (item: AnyDetailItem) => string }> {
    const fields = this.definition?.detail.fields ?? [];
    return fields as Array<{ label: string; value: (item: AnyDetailItem) => string }>;
  }

  /**
   * Computes the image URL for a related list item (if the related block is configured with an image definition).
   *
   * @param block Related block definition
   * @param relatedItem Related item to create an image URL for
   * @returns Image URL (or empty string if not configured)
   */
  getRelatedImageUrl(block: RelatedBlock<AnyDetailItem>, relatedItem: unknown): string {
    if (block.kind !== 'list') return '';
    const listBlock = block as RelatedListBlock<AnyDetailItem>;
    const imgDef = listBlock.image as ImageDefinition<unknown> | undefined;
    if (!imgDef) return '';
    return this.picsumImageService.getSeededImageUrl(imgDef.seed(relatedItem), imgDef.size);
  }

  /**
   * Loads the main resource item and its related data according to the registry definition.
   *
   * Related data is loaded via a `forkJoin` over the configured blocks. Errors in individual
   * related blocks are handled per-block and do not prevent the main item from rendering.
   *
   * @param id Resource ID from the route
   * @returns Observable used by `ngOnInit`/`retry` to drive side effects
   */
  private loadDetail(id: number) {
    if (!this.definition) return of(null);

    const def = this.definition;

    this.isLoading = true;
    this.errorMessage = '';
    this.item = null;
    this.related = [];

    return def.detail.getById(id).pipe(
      takeUntil(this.destroy$),
      catchError((error) => {
        this.errorMessage = def.detail.errorMessage;
        this.isLoading = false;
        console.error('Error loading detail:', error);
        return of(null);
      }),
      switchMap((raw) => {
        if (!raw) {
          return of(null);
        }
        const base = raw as unknown as AnyDetailItem;
        const imgDef = def.detail.image as unknown as ImageDefinition<AnyDetailItem>;

        this.item = {
          ...base,
          imageUrl: this.picsumImageService.getSeededImageUrl(imgDef.seed(base), imgDef.size)
        };

        const blocks = (def.detail.related ?? []) as Array<RelatedBlock<AnyDetailItem>>;
        if (!this.item || blocks.length === 0) {
          this.isLoading = false;
          return of(null);
        }

        const tasks = blocks.map((block) => {
          if (block.kind === 'single') {
            const b = block as RelatedSingleBlock<AnyDetailItem>;
            const url = b.getUrl(this.item as AnyDetailItem);
            if (!url) {
              return of({ block, single: null, list: [] } satisfies RelatedResolved);
            }

            return b.load(url).pipe(
              catchError((error) => {
                console.warn('Error loading related single:', error);
                return of(null);
              }),
              switchMap((single) => of({ block, single, list: [] } satisfies RelatedResolved))
            );
          }

          const b = block as RelatedListBlock<AnyDetailItem>;
          const urls = b.getUrls(this.item as AnyDetailItem);
          const limitedUrls = typeof b.limit === 'number' ? urls.slice(0, b.limit) : urls;

          if (!limitedUrls || limitedUrls.length === 0) {
            return of({ block, single: null, list: [] } satisfies RelatedResolved);
          }

          return b.load(limitedUrls).pipe(
            catchError((error) => {
              console.warn('Error loading related list:', error);
              return of([] as unknown[]);
            }),
            switchMap((list) => of({ block, single: null, list } satisfies RelatedResolved))
          );
        });

        return forkJoin(tasks).pipe(
          switchMap((results) => {
            this.related = results;
            this.isLoading = false;
            return of(null);
          })
        );
      })
    );
  }
}
