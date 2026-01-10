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

  const mockItem2 = {
    url: 'https://swapi.info/api/people/2/',
    name: 'Leia Organa'
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
      pageSize: 1,
      loadingMessage: 'Loading people...',
      emptyMessage: 'No people found.',
      errorMessage: 'Error loading people.',
      getAll: () => of([mockItem, mockItem2]),
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

    expect(component.totalPages).toBe(2);
    expect(component.hasNextPage).toBeTrue();
    expect(component.hasPreviousPage).toBeFalse();

    expect(component.listTitle).toBe('People');
    expect(component.emptyMessage).toBe('No people found.');
    expect(component.displayFields.length).toBe(1);
  });

  it('should handle invalid resourceKey', async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [ResourceListComponent, RouterTestingModule],
      providers: [
        PicsumImageService,
        { provide: ResourceRegistryService, useValue: registry },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { resourceKey: 'invalid-key' }
            }
          }
        }
      ]
    }).compileComponents();

    const localFixture = TestBed.createComponent(ResourceListComponent);
    localFixture.detectChanges();
    const localComponent = localFixture.componentInstance;

    expect(localComponent.errorMessage).toBe('Invalid resource.');
    expect(localComponent.isLoading).toBeFalse();
  });

  it('totalPages should be 1 when no definition is present', () => {
    expect(component.totalPages).toBe(1);
  });

  it('should apply cached pagination when allItems are present', () => {
    fixture.detectChanges();

    expect(component.items[0].id).toBe(1);

    component.loadList(2);

    expect(component.currentPage).toBe(2);
    expect(component.items[0].id).toBe(2);
    expect(component.hasPreviousPage).toBeTrue();
    expect(component.hasNextPage).toBeFalse();
  });

  it('should clamp page numbers to a safe range', () => {
    fixture.detectChanges();
    component.loadList(999);
    expect(component.currentPage).toBe(2);
  });

  it('buildDetailLink should handle null ids', () => {
    fixture.detectChanges();
    const link = component.buildDetailLink({ id: null, url: 'x', imageUrl: 'y' } as never);
    expect(link).toEqual(['/', 'people']);
  });

  it('cardTitle should fall back to name/title when definition cardTitle is missing', () => {
    // After init, override definition to remove cardTitle (exercise fallback branch)
    fixture.detectChanges();

    const defWithoutCardTitle = {
      ...mockDefinition,
      list: {
        ...mockDefinition.list,
        cardTitle: undefined
      }
    } as unknown as ResourceDefinition<unknown, unknown>;

    component.definition = defWithoutCardTitle;

    const titleFn = component.cardTitle;
    expect(titleFn({ name: 'Luke' } as never)).toBe('Luke');
    expect(titleFn({ title: 'A New Hope' } as never)).toBe('A New Hope');
  });

  it('retry should clear cache and reload page 1', () => {
    const getAllSpy = spyOn(mockDefinition.list, 'getAll').and.callThrough();

    fixture.detectChanges();
    expect(getAllSpy).toHaveBeenCalledTimes(1);

    component.retry();

    expect(getAllSpy).toHaveBeenCalledTimes(2);
    expect(component.currentPage).toBe(1);
    expect(component.items[0].id).toBe(1);
  });

  it('should open and close add modal', () => {
    expect(component.isAddModalOpen).toBeFalse();
    component.openAddModal();
    expect(component.isAddModalOpen).toBeTrue();
    component.closeAddModal();
    expect(component.isAddModalOpen).toBeFalse();
  });

  it('loadNextPage and loadPreviousPage should paginate and scroll to top', () => {
    fixture.detectChanges();
    spyOn(window, 'scrollTo');

    component.loadNextPage();
    expect(component.currentPage).toBe(2);
    expect(window.scrollTo).toHaveBeenCalled();

    component.loadPreviousPage();
    expect(component.currentPage).toBe(1);
    expect(window.scrollTo).toHaveBeenCalled();
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
