import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { PicsumImageService } from '@core/services';
import { AnyResourceDefinition, ResourceDefinition, ResourceRegistryService } from '../resource-registry';
import { ResourceListComponent } from './resource-list.component';

describe('ResourceListComponent', () => {
  let fixture: ComponentFixture<ResourceListComponent>;
  let component: ResourceListComponent;

  let registry: jasmine.SpyObj<ResourceRegistryService>;

  const mockItem = {
    url: 'https://swapi.info/api/people/1/',
    name: 'Luke Skywalker'
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
      getAll: () => of([mockItem]),
      image: {
        seed: () => 'person-1',
        size: { width: 600, height: 400 }
      },
      cardTitle: (item) => (item as { name?: string }).name ?? '',
      cardFields: [{ label: 'name', value: (item) => (item as { name?: string }).name ?? '' }]
    },
    detail: {
      loadingMessage: 'Loading details...',
      errorMessage: 'Error loading details.',
      backLabel: 'Back to list',
      getById: () => of({}),
      title: () => 'Luke Skywalker',
      image: {
        seed: () => 'person-1',
        size: { width: 600, height: 400 }
      },
      fields: [],
      related: []
    }
  };

  const mockAnyDefinition = mockDefinition as unknown as AnyResourceDefinition;

  beforeEach(async () => {
    registry = jasmine.createSpyObj<ResourceRegistryService>('ResourceRegistryService', ['getDefinition']);
    registry.getDefinition.and.returnValue(mockAnyDefinition);

    await TestBed.configureTestingModule({
      imports: [ResourceListComponent, RouterTestingModule],
      providers: [
        PicsumImageService,
        { provide: ResourceRegistryService, useValue: registry },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { resourceKey: 'people' }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load list items on init', () => {
    fixture.detectChanges();

    expect(registry.getDefinition).toHaveBeenCalledWith('people');
    expect(component.items.length).toBe(1);
    expect(component.items[0].id).toBe(1);
    expect(component.items[0].imageUrl).toContain('picsum.photos');
  });

  it('should handle errors', () => {
    registry.getDefinition.and.returnValue(
      ({
        ...mockDefinition,
        list: {
          ...mockDefinition.list,
          getAll: () => throwError(() => new Error('network'))
        }
      } as unknown as AnyResourceDefinition)
    );

    fixture = TestBed.createComponent(ResourceListComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Error loading people.');
    expect(component.isLoading).toBeFalse();
  });
});
