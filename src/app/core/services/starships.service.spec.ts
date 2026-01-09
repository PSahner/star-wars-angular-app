import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StarshipsService } from './starships.service';
import { Starship, StarshipWithId, Person, Film } from '@core/models';
import { of } from 'rxjs';

describe('StarshipsService', () => {
  let service: StarshipsService;
  let httpMock: HttpTestingController;
  const baseUrl = 'https://swapi.info/api';

  const mockStarship: Starship = {
    name: 'X-wing',
    model: 'T-65 X-wing',
    manufacturer: 'Incom Corporation',
    cost_in_credits: '149999',
    length: '12.5',
    max_atmosphering_speed: '1050',
    crew: '1',
    passengers: '0',
    cargo_capacity: '110',
    consumables: '1 week',
    hyperdrive_rating: '1.0',
    MGLT: '100',
    starship_class: 'Starfighter',
    pilots: ['https://swapi.info/api/people/1/'],
    films: ['https://swapi.info/api/films/1/'],
    created: '2014-12-12T11:19:05.340000Z',
    edited: '2014-12-20T21:23:49.886000Z',
    url: 'https://swapi.info/api/starships/12/'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StarshipsService]
    });
    service = TestBed.inject(StarshipsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.clearCache();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getStarships()', () => {
    it('should fetch a list of starships', (done) => {
      const mockResponse: Starship[] = [mockStarship];

      service.getStarships().subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.length).toBe(1);
        expect(response[0].name).toBe('X-wing');
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/starships/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getStarshipById()', () => {
    it('should fetch a single starship by ID', (done) => {
      service.getStarshipById(12).subscribe(starship => {
        expect(starship.name).toBe('X-wing');
        expect(starship.id).toBe(12);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/starships/12`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStarship);
    });
  });

  describe('sortByName()', () => {
    it('should sort starships alphabetically by name', () => {
      const starships: Starship[] = [
        { ...mockStarship, name: 'X-wing' },
        { ...mockStarship, name: 'A-wing' },
        { ...mockStarship, name: 'Y-wing' }
      ];

      const sorted = service.sortByName(starships);
      expect(sorted[0].name).toBe('A-wing');
      expect(sorted[1].name).toBe('X-wing');
      expect(sorted[2].name).toBe('Y-wing');
    });
  });

  describe('sortByCost()', () => {
    it('should sort starships by cost ascending', () => {
      const starships: Starship[] = [
        { ...mockStarship, cost_in_credits: '200000' },
        { ...mockStarship, cost_in_credits: '100000' },
        { ...mockStarship, cost_in_credits: '150000' }
      ];

      const sorted = service.sortByCost(starships);
      expect(sorted[0].cost_in_credits).toBe('100000');
      expect(sorted[1].cost_in_credits).toBe('150000');
      expect(sorted[2].cost_in_credits).toBe('200000');
    });

    it('should filter out starships with unknown cost', () => {
      const starships: Starship[] = [
        { ...mockStarship, cost_in_credits: '200000' },
        { ...mockStarship, cost_in_credits: 'unknown' },
        { ...mockStarship, cost_in_credits: '100000' }
      ];

      const sorted = service.sortByCost(starships);
      expect(sorted.length).toBe(2);
      expect(sorted[0].cost_in_credits).toBe('100000');
      expect(sorted[1].cost_in_credits).toBe('200000');
    });
  });

  describe('getStarshipWithRelatedData()', () => {
    it('should resolve limited pilots and films (max 5 each)', (done) => {
      const starshipWithId: StarshipWithId = {
        ...(mockStarship as Starship),
        id: 12,
        pilots: Array.from({ length: 6 }, (_, i) => `https://swapi.info/api/people/${i + 1}/`),
        films: Array.from({ length: 6 }, (_, i) => `https://swapi.info/api/films/${i + 1}/`)
      };

      spyOn(service, 'getStarshipById').and.returnValue(of(starshipWithId));
      const getByUrlSpy = spyOn(service as unknown as { getByUrl: (url: string) => unknown }, 'getByUrl')
        .and.callFake((url: string) => {
          if (url.includes('/people/')) {
            return of({ url } as Person);
          }
          return of({ url } as Film);
        });

      service.getStarshipWithRelatedData(12).subscribe((result) => {
        expect(result.starship.id).toBe(12);
        expect(result.pilots.length).toBe(5);
        expect(result.films.length).toBe(5);

        const args = getByUrlSpy.calls.allArgs().map((a) => a[0]);
        expect(args.filter((u) => u.includes('/people/')).length).toBe(5);
        expect(args.filter((u) => u.includes('/films/')).length).toBe(5);
        done();
      });
    });

    it('should return empty arrays when there are no pilots/films', (done) => {
      const starshipWithId: StarshipWithId = {
        ...(mockStarship as Starship),
        id: 12,
        pilots: [],
        films: []
      };

      spyOn(service, 'getStarshipById').and.returnValue(of(starshipWithId));
      const getByUrlSpy = spyOn(service as unknown as { getByUrl: (url: string) => unknown }, 'getByUrl');

      service.getStarshipWithRelatedData(12).subscribe((result) => {
        expect(result.pilots).toEqual([]);
        expect(result.films).toEqual([]);
        expect(getByUrlSpy).not.toHaveBeenCalled();
        done();
      });
    });
  });
});
