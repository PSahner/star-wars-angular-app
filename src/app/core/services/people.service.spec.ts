import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PeopleService } from './people.service';
import { Person } from '@core/models';

describe('PeopleService', () => {
  let service: PeopleService;
  let httpMock: HttpTestingController;
  const baseUrl = 'https://swapi.info/api';

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PeopleService]
    });
    service = TestBed.inject(PeopleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.clearCache();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPeople()', () => {
    it('should fetch a list of people', (done) => {
      const mockResponse: Person[] = [mockPerson];

      service.getPeople().subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.length).toBe(1);
        expect(response[0].name).toBe('Luke Skywalker');
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/people/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getPersonById()', () => {
    it('should fetch a single person by ID', (done) => {
      service.getPersonById(1).subscribe(person => {
        expect(person.name).toBe('Luke Skywalker');
        expect(person.id).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/people/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPerson);
    });
  });

  describe('getHomeworld()', () => {
    it('should fetch homeworld data', (done) => {
      const mockPlanet = {
        name: 'Tatooine',
        climate: 'arid',
        terrain: 'desert'
      };

      service.getHomeworld('https://swapi.info/api/planets/1/').subscribe(planet => {
        expect(planet.name).toBe('Tatooine');
        done();
      });

      const req = httpMock.expectOne('https://swapi.info/api/planets/1/');
      req.flush(mockPlanet);
    });
  });

  describe('getFilms()', () => {
    it('should fetch multiple films', (done) => {
      const mockFilms = [
        { title: 'A New Hope', episode_id: 4 },
        { title: 'The Empire Strikes Back', episode_id: 5 }
      ];

      const filmUrls = [
        'https://swapi.info/api/films/1/',
        'https://swapi.info/api/films/2/'
      ];

      service.getFilms(filmUrls).subscribe(films => {
        expect(films.length).toBe(2);
        expect(films[0].title).toBe('A New Hope');
        expect(films[1].title).toBe('The Empire Strikes Back');
        done();
      });

      const req1 = httpMock.expectOne('https://swapi.info/api/films/1/');
      const req2 = httpMock.expectOne('https://swapi.info/api/films/2/');
      req1.flush(mockFilms[0]);
      req2.flush(mockFilms[1]);
    });
  });

  describe('searchPeople()', () => {
    it('should filter people by name', (done) => {
      const mockResponse: Person[] = [
        { ...mockPerson, name: 'Luke Skywalker' },
        { ...mockPerson, name: 'Darth Vader' },
        { ...mockPerson, name: 'Leia Organa' }
      ];

      service.searchPeople('Luke').subscribe(people => {
        expect(people.length).toBe(1);
        expect(people[0].name).toBe('Luke Skywalker');
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/people/`);
      req.flush(mockResponse);
    });

    it('should be case insensitive', (done) => {
      const mockResponse: Person[] = [
        { ...mockPerson, name: 'Luke Skywalker' }
      ];

      service.searchPeople('LUKE').subscribe(people => {
        expect(people.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/people/`);
      req.flush(mockResponse);
    });
  });
});
