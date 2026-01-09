import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { PeopleListComponent } from './people-list.component';
import { PeopleService } from '@core/services';
import { Person } from '@core/models';

describe('PeopleListComponent', () => {
  let component: PeopleListComponent;
  let fixture: ComponentFixture<PeopleListComponent>;
  let peopleService: jasmine.SpyObj<PeopleService>;

  const mockPerson: Person = {
    name: 'Luke Skywalker',
    height: '172',
    mass: '77',
    hair_color: 'blond',
    skin_color: 'fair',
    eye_color: 'blue',
    birth_year: '19BBY',
    gender: 'male',
    homeworld: 'https://swapi.info/api/planets/1/',
    films: ['https://swapi.info/api/films/1/'],
    species: [],
    vehicles: [],
    starships: [],
    created: '2014-12-09T13:50:51.644000Z',
    edited: '2014-12-20T21:17:56.891000Z',
    url: 'https://swapi.info/api/people/1/'
  };

  const mockPeople: Person[] = [mockPerson];

  beforeEach(async () => {
    const peopleServiceSpy = jasmine.createSpyObj('PeopleService', ['getPeople']);

    await TestBed.configureTestingModule({
      imports: [
        PeopleListComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: PeopleService, useValue: peopleServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PeopleListComponent);
    component = fixture.componentInstance;
    peopleService = TestBed.inject(PeopleService) as jasmine.SpyObj<PeopleService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load people on initialization', () => {
    peopleService.getPeople.and.returnValue(of(mockPeople));

    component.ngOnInit();

    expect(peopleService.getPeople).toHaveBeenCalledWith();
    expect(component.people.length).toBe(1);
    expect(component.people[0].name).toBe('Luke Skywalker');
    expect(component.isLoading).toBeFalse();
  });

  it('should handle loading state', () => {
    peopleService.getPeople.and.returnValue(of(mockPeople));

    expect(component.isLoading).toBeTrue();

    component.ngOnInit();

    expect(component.isLoading).toBeFalse();
  });

  it('should handle errors', () => {
    const error = new Error('Network error');
    peopleService.getPeople.and.returnValue(throwError(() => error));

    component.ngOnInit();

    expect(component.errorMessage).toContain('Fehler');
    expect(component.isLoading).toBeFalse();
  });

  it('should set pagination flags correctly', () => {
    const thirteenPeople: Person[] = Array.from({ length: 13 }, (_, index) => ({
      ...mockPerson,
      name: `Person ${index + 1}`,
      url: `https://swapi.info/api/people/${index + 1}/`
    }));
    peopleService.getPeople.and.returnValue(of(thirteenPeople));

    component.ngOnInit();

    expect(component.hasNextPage).toBeTrue();
    expect(component.hasPreviousPage).toBeFalse();
  });

  it('should load next page', () => {
    spyOn(window, 'scrollTo');
    const thirteenPeople: Person[] = Array.from({ length: 13 }, (_, index) => ({
      ...mockPerson,
      name: `Person ${index + 1}`,
      url: `https://swapi.info/api/people/${index + 1}/`
    }));
    peopleService.getPeople.and.returnValue(of(thirteenPeople));
    component.currentPage = 1;

    component.ngOnInit();
    component.loadNextPage();

    expect(component.currentPage).toBe(2);
  });

  it('should load previous page', () => {
    spyOn(window, 'scrollTo');
    const thirteenPeople: Person[] = Array.from({ length: 13 }, (_, index) => ({
      ...mockPerson,
      name: `Person ${index + 1}`,
      url: `https://swapi.info/api/people/${index + 1}/`
    }));
    peopleService.getPeople.and.returnValue(of(thirteenPeople));

    component.ngOnInit();
    component.loadNextPage();
    component.loadPreviousPage();

    expect(component.currentPage).toBe(1);
  });

  it('should not load next page if none available', () => {
    peopleService.getPeople.and.returnValue(of(mockPeople));
    component.ngOnInit();
    expect(component.hasNextPage).toBeFalse();
    const initialCallCount = peopleService.getPeople.calls.count();

    component.loadNextPage();

    expect(peopleService.getPeople.calls.count()).toBe(initialCallCount);
  });

  it('should extract ID from URL', () => {
    const url = 'https://swapi.info/api/people/1/';
    const id = component.extractId(url);

    expect(id).toBe(1);
  });

  it('should retry loading on error', () => {
    peopleService.getPeople.and.returnValue(of(mockPeople));
    component.errorMessage = 'Some error';

    component.retry();

    expect(peopleService.getPeople).toHaveBeenCalled();
  });

  it('should set person imageUrl when mapping people', () => {
    peopleService.getPeople.and.returnValue(of(mockPeople));

    component.ngOnInit();

    expect(component.people[0].imageUrl).toContain('picsum.photos');
    expect(component.people[0].imageUrl).toContain('/seed/person-1/');
  });

  it('should clean up subscriptions on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
