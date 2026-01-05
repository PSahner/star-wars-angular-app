import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PeopleDetailComponent } from './people-detail.component';
import { PeopleService } from '@core/services';
import { PersonWithId, Planet, Film } from '@core/models';

describe('PeopleDetailComponent', () => {
  let component: PeopleDetailComponent;
  let fixture: ComponentFixture<PeopleDetailComponent>;
  let peopleService: jasmine.SpyObj<PeopleService>;
  let activatedRoute: ActivatedRoute;

  const mockPerson: PersonWithId = {
    id: 1,
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

  const mockPersonWithImage: PersonWithId & { imageUrl: string } = {
    ...mockPerson,
    imageUrl: 'https://picsum.photos/seed/person-1/600/400'
  };

  const mockPlanet: Planet = {
    name: 'Tatooine',
    rotation_period: '23',
    orbital_period: '304',
    diameter: '10465',
    climate: 'arid',
    gravity: '1 standard',
    terrain: 'desert',
    surface_water: '1',
    population: '200000',
    residents: [],
    films: [],
    created: '2014-12-09T13:50:49.641000Z',
    edited: '2014-12-20T20:58:18.411000Z',
    url: 'https://swapi.info/api/planets/1/'
  };

  const mockFilm: Film = {
    title: 'A New Hope',
    episode_id: 4,
    opening_crawl: 'It is a period of civil war...',
    director: 'George Lucas',
    producer: 'Gary Kurtz, Rick McCallum',
    release_date: '1977-05-25',
    characters: [],
    planets: [],
    starships: [],
    vehicles: [],
    species: [],
    created: '2014-12-10T14:23:31.880000Z',
    edited: '2014-12-20T19:49:45.256000Z',
    url: 'https://swapi.info/api/films/1/'
  };

  beforeEach(async () => {
    const peopleServiceSpy = jasmine.createSpyObj('PeopleService', [
      'getPersonById',
      'getHomeworld',
      'getFilms'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        PeopleDetailComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: PeopleService, useValue: peopleServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '1' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PeopleDetailComponent);
    component = fixture.componentInstance;
    peopleService = TestBed.inject(PeopleService) as jasmine.SpyObj<PeopleService>;
    activatedRoute = TestBed.inject(ActivatedRoute);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load person on initialization', () => {
    peopleService.getPersonById.and.returnValue(of(mockPerson));
    peopleService.getHomeworld.and.returnValue(of(mockPlanet));
    peopleService.getFilms.and.returnValue(of([mockFilm]));

    component.ngOnInit();

    expect(peopleService.getPersonById).toHaveBeenCalledWith(1);
    expect(component.person?.name).toBe('Luke Skywalker');
  });

  it('should handle loading state', () => {
    peopleService.getPersonById.and.returnValue(of(mockPerson));
    peopleService.getHomeworld.and.returnValue(of(mockPlanet));
    peopleService.getFilms.and.returnValue(of([mockFilm]));

    expect(component.isLoading).toBeTrue();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.isLoading).toBeFalse();
  });

  it('should handle errors when loading person', () => {
    const error = new Error('Network error');
    peopleService.getPersonById.and.returnValue(throwError(() => error));

    component.ngOnInit();

    expect(component.errorMessage).toContain('Fehler');
    expect(component.isLoading).toBeFalse();
  });

  it('should extract ID from URL', () => {
    const url = 'https://swapi.info/api/people/1/';
    const id = component.extractId(url);

    expect(id).toBe(1);
  });

  it('should get character image URL', () => {
    component.person = mockPersonWithImage;
    const imageUrl = component.getCharacterImage();

    expect(imageUrl).toContain('picsum.photos');
    expect(imageUrl).toContain('/seed/person-1/');
  });

  it('should get film image URL', () => {
    const imageUrl = component.getFilmImage(mockFilm);

    expect(imageUrl).toContain('picsum.photos');
    expect(imageUrl).toContain('/seed/film-1/');
  });

  it('should translate gender to German', () => {
    expect(component.translateGender('male')).toBe('Männlich');
    expect(component.translateGender('female')).toBe('Weiblich');
    expect(component.translateGender('unknown')).toBe('Unbekannt');
  });

  it('should get homeworld ID', () => {
    component.person = mockPersonWithImage;
    const homeworldId = component.getHomeworldId();

    expect(homeworldId).toBe(1);
  });

  it('should retry loading on error', () => {
    peopleService.getPersonById.and.returnValue(of(mockPerson));
    peopleService.getHomeworld.and.returnValue(of(mockPlanet));
    peopleService.getFilms.and.returnValue(of([mockFilm]));
    component.errorMessage = 'Some error';

    component.retry();

    expect(peopleService.getPersonById).toHaveBeenCalled();
  });

  it('should clean up subscriptions on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
