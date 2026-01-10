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
      image: {
        seed: () => 'person-1',
        size: { width: 600, height: 400 }
      },
      fields: [{ label: 'name', value: (item) => (item as { name?: string }).name ?? '' }],
      related: []
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
});
