import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PlanetsService } from './planets.service';
import { Planet } from '@core/models';

describe('PlanetsService', () => {
  let service: PlanetsService;
  let httpMock: HttpTestingController;
  const baseUrl = 'https://swapi.info/api';

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
    residents: ['https://swapi.info/api/people/1/'],
    films: ['https://swapi.info/api/films/1/'],
    created: '2014-12-09T13:50:49.641000Z',
    edited: '2014-12-20T20:58:18.411000Z',
    url: 'https://swapi.info/api/planets/1/'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PlanetsService]
    });
    service = TestBed.inject(PlanetsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.clearCache();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPlanets()', () => {
    it('should fetch a list of planets', (done) => {
      const mockResponse: Planet[] = [mockPlanet];

      service.getPlanets().subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.length).toBe(1);
        expect(response[0].name).toBe('Tatooine');
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/planets/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getPlanetById()', () => {
    it('should fetch a single planet by ID', (done) => {
      service.getPlanetById(1).subscribe(planet => {
        expect(planet.name).toBe('Tatooine');
        expect(planet.id).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/planets/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPlanet);
    });
  });

  describe('sortByName()', () => {
    it('should sort planets alphabetically by name', () => {
      const planets: Planet[] = [
        { ...mockPlanet, name: 'Tatooine' },
        { ...mockPlanet, name: 'Alderaan' },
        { ...mockPlanet, name: 'Naboo' }
      ];

      const sorted = service.sortByName(planets);
      expect(sorted[0].name).toBe('Alderaan');
      expect(sorted[1].name).toBe('Naboo');
      expect(sorted[2].name).toBe('Tatooine');
    });
  });

  describe('sortByPopulation()', () => {
    it('should sort planets by population descending', () => {
      const planets: Planet[] = [
        { ...mockPlanet, population: '200000' },
        { ...mockPlanet, population: '4500000000' },
        { ...mockPlanet, population: '1000000' }
      ];

      const sorted = service.sortByPopulation(planets);
      expect(sorted[0].population).toBe('4500000000');
      expect(sorted[1].population).toBe('1000000');
      expect(sorted[2].population).toBe('200000');
    });

    it('should filter out planets with unknown population', () => {
      const planets: Planet[] = [
        { ...mockPlanet, population: '200000' },
        { ...mockPlanet, population: 'unknown' },
        { ...mockPlanet, population: '1000000' }
      ];

      const sorted = service.sortByPopulation(planets);
      expect(sorted.length).toBe(2);
    });
  });

  describe('filterByClimate()', () => {
    it('should filter planets by climate', () => {
      const planets: Planet[] = [
        { ...mockPlanet, climate: 'arid' },
        { ...mockPlanet, climate: 'temperate' },
        { ...mockPlanet, climate: 'tropical' }
      ];

      const filtered = service.filterByClimate(planets, 'arid');
      expect(filtered.length).toBe(1);
      expect(filtered[0].climate).toBe('arid');
    });

    it('should be case insensitive', () => {
      const planets: Planet[] = [
        { ...mockPlanet, climate: 'Arid' }
      ];

      const filtered = service.filterByClimate(planets, 'ARID');
      expect(filtered.length).toBe(1);
    });
  });

  describe('filterByTerrain()', () => {
    it('should filter planets by terrain', () => {
      const planets: Planet[] = [
        { ...mockPlanet, terrain: 'desert' },
        { ...mockPlanet, terrain: 'grasslands, mountains' },
        { ...mockPlanet, terrain: 'jungle, rainforests' }
      ];

      const filtered = service.filterByTerrain(planets, 'desert');
      expect(filtered.length).toBe(1);
      expect(filtered[0].terrain).toBe('desert');
    });

    it('should handle multiple terrain types', () => {
      const planets: Planet[] = [
        { ...mockPlanet, terrain: 'grasslands, mountains' }
      ];

      const filtered = service.filterByTerrain(planets, 'mountains');
      expect(filtered.length).toBe(1);
    });
  });
});
