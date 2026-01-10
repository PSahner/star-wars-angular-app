import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { PicsumImageService, ThemeService } from '@core/services';
import { AnyResourceDefinition, ResourceDefinition, ResourceRegistryService } from '../resource-registry';
import { ResourceDetailComponent } from './resource-detail.component';

describe('ResourceDetailComponent', () => {
  let fixture: ComponentFixture<ResourceDetailComponent>;
  let component: ResourceDetailComponent;

  let registry: jasmine.SpyObj<ResourceRegistryService>;

  const mockItem = {
    id: 1,
    url: 'https://swapi.info/api/people/1/',
    name: 'Luke Skywalker',
    homeworld: 'https://swapi.info/api/planets/1/',
    films: ['https://swapi.info/api/films/1/']
  };

  const mockDefinition: ResourceDefinition<unknown, unknown> = {
    key: 'people',
    routeBase: 'people',
    titles: {
      listTitle: 'People',
      detailKicker: 'People Details',
      documentTitleList: 'People | Star Wars',
      documentTitleDetail: 'People Details | Star Wars'
    },
    list: {
      pageSize: 12,
      loadingMessage: 'Loading people...',
      emptyMessage: 'No people found.',
      errorMessage: 'Error loading people.',
      getAll: () => of([]),
      image: {
        seed: () => 'person-1',
        size: { width: 600, height: 400 }
      },
      cardTitle: () => 'Luke Skywalker',
      cardFields: []
    },
    detail: {
      loadingMessage: 'Loading details...',
      errorMessage: 'Error loading details.',
      backLabel: 'Back to list',
      getById: () => of(mockItem),
      title: (item) => (item as { name?: string }).name ?? '',
      subtitle: (item) => `Subtitle: ${(item as { name?: string }).name ?? ''}`,
      image: {
        seed: () => 'person-1',
        size: { width: 600, height: 400 }
      },
      fields: [{ label: 'name', value: (item) => (item as { name?: string }).name ?? '' }],
      related: [
        {
          kind: 'single',
          title: 'Homeworld',
          getUrl: () => 'https://swapi.info/api/planets/1/',
          load: (url) => of({ url, name: 'Tatooine' }),
          link: (p) => ['/', 'planets', (p as { url: string }).url.endsWith('/1/') ? 1 : 0],
          label: (p) => (p as { name: string }).name
        },
        {
          kind: 'list',
          title: 'Films',
          getUrls: () => ['https://swapi.info/api/films/1/', 'https://swapi.info/api/films/2/'],
          load: (urls) => of(urls.map((url) => ({ url, title: `Film ${url}` }))),
          link: () => ['/', 'films', 1],
          label: (f) => (f as { title: string }).title,
          subtitle: () => 'Episode X',
          image: {
            seed: (f) => `seed-${(f as { url: string }).url}`,
            size: { width: 10, height: 10 }
          },
          limit: 1
        }
      ]
    }
  };

  const mockAnyDefinition = mockDefinition as unknown as AnyResourceDefinition;

  beforeEach(async () => {
    registry = jasmine.createSpyObj<ResourceRegistryService>('ResourceRegistryService', ['getDefinition']);
    registry.getDefinition.and.returnValue(mockAnyDefinition);

    await TestBed.configureTestingModule({
      imports: [ResourceDetailComponent, RouterTestingModule],
      providers: [
        PicsumImageService,
        ThemeService,
        { provide: ResourceRegistryService, useValue: registry },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: { resourceKey: 'people' } },
            params: of({ id: '1' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load detail item on init', () => {
    fixture.detectChanges();

    expect(registry.getDefinition).toHaveBeenCalledWith('people');
    expect(component.item).toBeTruthy();
    const imageUrl = (component.item as unknown as { imageUrl?: unknown }).imageUrl;
    expect(typeof imageUrl).toBe('string');
    expect(imageUrl as string).toContain('picsum.photos');

    expect(component.isLoading).toBeFalse();
    expect(component.related.length).toBe(2);

    const listBlock = component.related.find((r) => r.block.kind === 'list');
    expect(listBlock?.list.length).toBe(1);
  });

  it('should handle invalid resourceKey in route data', async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [ResourceDetailComponent, RouterTestingModule],
      providers: [
        PicsumImageService,
        ThemeService,
        { provide: ResourceRegistryService, useValue: registry },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: { resourceKey: 'invalid-key' } },
            params: of({ id: '1' })
          }
        }
      ]
    }).compileComponents();

    const localFixture = TestBed.createComponent(ResourceDetailComponent);
    localFixture.detectChanges();
    const localComponent = localFixture.componentInstance;

    expect(localComponent.errorMessage).toBe('Invalid resource.');
    expect(localComponent.isLoading).toBeFalse();
  });

  it('should expose getters (title/subtitle/kicker/fields) when item is loaded', () => {
    fixture.detectChanges();

    expect(component.kicker()).toBe('People Details');
    expect(component.title()).toBe('Luke Skywalker');
    expect(component.subtitle()).toContain('Luke Skywalker');
    expect(component.fields().length).toBeGreaterThan(0);
  });

  it('should build back link to current resource list', () => {
    fixture.detectChanges();
    expect(component.backLink()).toEqual(['/', 'people']);
  });

  it('should return empty strings when definition or item is missing', () => {
    expect(component.title()).toBe('');
    expect(component.subtitle()).toBe('');
    expect(component.kicker()).toBe('');
    expect(component.fields()).toEqual([]);
  });

  it('should compute related image URLs for list blocks (and empty for non-list)', () => {
    fixture.detectChanges();

    const listResolved = component.related.find((r) => r.block.kind === 'list')!;
    const img = component.getRelatedImageUrl(listResolved.block as never, listResolved.list[0]);
    expect(img).toContain('picsum.photos');

    const singleResolved = component.related.find((r) => r.block.kind === 'single')!;
    expect(component.getRelatedImageUrl(singleResolved.block as never, singleResolved.single)).toBe('');
  });

  it('retry should do nothing when there is no currentId', async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [ResourceDetailComponent, RouterTestingModule],
      providers: [
        PicsumImageService,
        ThemeService,
        { provide: ResourceRegistryService, useValue: registry },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: { resourceKey: 'people' } },
            params: of({ id: 'not-a-number' })
          }
        }
      ]
    }).compileComponents();

    const localFixture = TestBed.createComponent(ResourceDetailComponent);
    const localComponent = localFixture.componentInstance;

    localFixture.detectChanges();
    expect(() => localComponent.retry()).not.toThrow();
  });

  it('should set errorMessage when getById fails', () => {
    registry.getDefinition.and.returnValue(
      ({
        ...mockDefinition,
        detail: {
          ...mockDefinition.detail,
          getById: () => throwError(() => new Error('network'))
        }
      } as unknown as AnyResourceDefinition)
    );

    fixture = TestBed.createComponent(ResourceDetailComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Error loading details.');
    expect(component.isLoading).toBeFalse();
  });

  it('should tolerate related block errors (single -> null, list -> [])', () => {
    registry.getDefinition.and.returnValue(
      ({
        ...mockDefinition,
        detail: {
          ...mockDefinition.detail,
          related: [
            {
              kind: 'single',
              title: 'Homeworld',
              getUrl: () => 'https://swapi.info/api/planets/1/',
              load: () => throwError(() => new Error('network')),
              link: () => ['/', 'planets'],
              label: () => 'x'
            },
            {
              kind: 'list',
              title: 'Films',
              getUrls: () => ['https://swapi.info/api/films/1/'],
              load: () => throwError(() => new Error('network')),
              link: () => ['/', 'films'],
              label: () => 'y'
            }
          ]
        }
      } as unknown as AnyResourceDefinition)
    );

    const localFixture = TestBed.createComponent(ResourceDetailComponent);
    const localComponent = localFixture.componentInstance;
    localFixture.detectChanges();

    expect(localComponent.related.length).toBe(2);
    const single = localComponent.related.find((r) => r.block.kind === 'single');
    const list = localComponent.related.find((r) => r.block.kind === 'list');
    expect(single?.single).toBeNull();
    expect(list?.list).toEqual([]);
  });
});
