import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FilmsService } from './films.service';
import { Film, FilmWithId } from '@core/models';
import { of } from 'rxjs';

describe('FilmsService', () => {
  let service: FilmsService;
  let httpMock: HttpTestingController;
  const baseUrl = 'https://swapi.info/api';

  const mockFilm: Film = {
    title: 'A New Hope',
    episode_id: 4,
    opening_crawl: 'It is a period of civil war...',
    director: 'George Lucas',
    producer: 'Gary Kurtz, Rick McCallum',
    release_date: '1977-05-25',
    characters: ['https://swapi.info/api/people/1/'],
    planets: ['https://swapi.info/api/planets/1/'],
    starships: ['https://swapi.info/api/starships/2/'],
    vehicles: [],
    species: [],
    created: '2014-12-10T14:23:31.880000Z',
    edited: '2014-12-20T19:49:45.256000Z',
    url: 'https://swapi.info/api/films/1/'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FilmsService]
    });
    service = TestBed.inject(FilmsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.clearCache();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getFilms()', () => {
    it('should fetch a list of films', (done) => {
      const mockResponse: Film[] = [mockFilm];

      service.getFilms().subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.length).toBe(1);
        expect(response[0].title).toBe('A New Hope');
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/films/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getFilmById()', () => {
    it('should fetch a single film by ID', (done) => {
      service.getFilmById(1).subscribe(film => {
        expect(film.title).toBe('A New Hope');
        expect(film.id).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/films/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFilm);
    });
  });

  describe('sortByEpisode()', () => {
    it('should sort films by episode number', () => {
      const films: Film[] = [
        { ...mockFilm, episode_id: 5 },
        { ...mockFilm, episode_id: 4 },
        { ...mockFilm, episode_id: 6 }
      ];

      const sorted = service.sortByEpisode(films);
      expect(sorted[0].episode_id).toBe(4);
      expect(sorted[1].episode_id).toBe(5);
      expect(sorted[2].episode_id).toBe(6);
    });
  });

  describe('sortByReleaseDate()', () => {
    it('should sort films by release date', () => {
      const films: Film[] = [
        { ...mockFilm, release_date: '1983-05-25' },
        { ...mockFilm, release_date: '1977-05-25' },
        { ...mockFilm, release_date: '1980-05-17' }
      ];

      const sorted = service.sortByReleaseDate(films);
      expect(sorted[0].release_date).toBe('1977-05-25');
      expect(sorted[1].release_date).toBe('1980-05-17');
      expect(sorted[2].release_date).toBe('1983-05-25');
    });
  });

  describe('getFilmWithRelatedData()', () => {
    it('should resolve limited related data (max 5 per type)', (done) => {
      const filmWithId: FilmWithId = {
        ...(mockFilm as Film),
        id: 1,
        characters: Array.from({ length: 6 }, (_, i) => `https://swapi.info/api/people/${i + 1}/`),
        planets: Array.from({ length: 6 }, (_, i) => `https://swapi.info/api/planets/${i + 1}/`),
        starships: Array.from({ length: 6 }, (_, i) => `https://swapi.info/api/starships/${i + 1}/`)
      };

      spyOn(service, 'getFilmById').and.returnValue(of(filmWithId));

      const getByUrlSpy = spyOn(service as unknown as { getByUrl: (url: string) => unknown }, 'getByUrl')
        .and.callFake((url: string) => of({ url }));

      service.getFilmWithRelatedData(1).subscribe((result) => {
        expect(result.film.id).toBe(1);
        expect(result.characters.length).toBe(5);
        expect(result.planets.length).toBe(5);
        expect(result.starships.length).toBe(5);

        const args = getByUrlSpy.calls.allArgs().map((a) => a[0]);
        expect(args.filter((u) => u.includes('/people/')).length).toBe(5);
        expect(args.filter((u) => u.includes('/planets/')).length).toBe(5);
        expect(args.filter((u) => u.includes('/starships/')).length).toBe(5);
        done();
      });
    });

    it('should return empty arrays when there are no related urls', (done) => {
      const filmWithId: FilmWithId = {
        ...(mockFilm as Film),
        id: 1,
        characters: [],
        planets: [],
        starships: []
      };

      spyOn(service, 'getFilmById').and.returnValue(of(filmWithId));
      const getByUrlSpy = spyOn(service as unknown as { getByUrl: (url: string) => unknown }, 'getByUrl');

      service.getFilmWithRelatedData(1).subscribe((result) => {
        expect(result.characters).toEqual([]);
        expect(result.planets).toEqual([]);
        expect(result.starships).toEqual([]);
        expect(getByUrlSpy).not.toHaveBeenCalled();
        done();
      });
    });
  });
});
