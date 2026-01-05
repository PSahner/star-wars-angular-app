import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SwapiService } from './swapi.service';

describe('SwapiService', () => {
  let service: SwapiService;
  let httpMock: HttpTestingController;
  const baseUrl = 'https://swapi.info/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SwapiService]
    });
    service = TestBed.inject(SwapiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.clearCache();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get()', () => {
    it('should make a GET request to the correct URL', (done) => {
      const endpoint = 'people/1';
      const mockResponse = { name: 'Luke Skywalker' };

      service['get'](endpoint, false).subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/${endpoint}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should use cache when useCache is true', (done) => {
      const endpoint = 'people/1';
      const mockResponse = { name: 'Luke Skywalker' };

      // First request
      service['get'](endpoint, true).subscribe();
      const req1 = httpMock.expectOne(`${baseUrl}/${endpoint}`);
      req1.flush(mockResponse);

      // Second request should use cache
      service['get'](endpoint, true).subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });

      // No additional HTTP request should be made
      httpMock.expectNone(`${baseUrl}/${endpoint}`);
    });

    it('should handle HTTP errors', (done) => {
      const endpoint = 'people/999';
      const errorMessage = 'Not Found';

      const retryAttempts = (service as unknown as { retryAttempts: number }).retryAttempts;
      const totalAttempts = retryAttempts + 1;

      service['get'](endpoint, false).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.message).toContain('Server error: 404');
          done();
        }
      });

      for (let i = 0; i < totalAttempts; i++) {
        const req = httpMock.expectOne(`${baseUrl}/${endpoint}`);
        req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
      }
    });
  });

  describe('getList()', () => {
    it('should fetch a list of resources', (done) => {
      const mockResponse = [{ name: 'Luke Skywalker' }];

      service['getList']<{ name: string }>('people').subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/people/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should normalize wrapped list responses', (done) => {
      const mockResponse = { results: [{ name: 'Luke Skywalker' }] };

      service['getList']<{ name: string }>('people').subscribe(response => {
        expect(response.length).toBe(1);
        expect(response[0].name).toBe('Luke Skywalker');
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/people/`);
      req.flush(mockResponse);
    });
  });

  describe('getById()', () => {
    it('should fetch a single resource by ID', (done) => {
      const mockPerson = { name: 'Luke Skywalker', height: '172' };

      service['getById']('people', 1).subscribe(response => {
        expect(response).toEqual(mockPerson);
        done();
      });

      const req = httpMock.expectOne(`${baseUrl}/people/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPerson);
    });
  });

  describe('extractIdFromUrl()', () => {
    it('should extract ID from SWAPI URL', () => {
      expect(service['extractIdFromUrl']('https://swapi.info/api/people/1/')).toBe(1);
      expect(service['extractIdFromUrl']('https://swapi.info/api/people/42/')).toBe(42);
      expect(service['extractIdFromUrl']('https://swapi.info/api/films/5/')).toBe(5);
    });

    it('should handle URLs without trailing slash', () => {
      expect(service['extractIdFromUrl']('https://swapi.info/api/people/1')).toBe(1);
    });

    it('should return null for invalid URLs', () => {
      expect(service['extractIdFromUrl']('https://swapi.info/api/people/')).toBeNull();
      expect(service['extractIdFromUrl']('invalid-url')).toBeNull();
    });
  });

  describe('getByUrl()', () => {
    it('should fetch data from a full URL', (done) => {
      const fullUrl = 'https://swapi.info/api/people/1/';
      const mockResponse = { name: 'Luke Skywalker' };

      service['getByUrl'](fullUrl).subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(fullUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('Cache management', () => {
    it('should clear entire cache', () => {
      const endpoint = 'people/1';
      const mockResponse = { name: 'Luke Skywalker' };

      // Make a cached request
      service['get'](endpoint, true).subscribe();
      const req = httpMock.expectOne(`${baseUrl}/${endpoint}`);
      req.flush(mockResponse);

      // Clear cache
      service.clearCache();

      // Next request should not use cache
      service['get'](endpoint, true).subscribe();
      const req2 = httpMock.expectOne(`${baseUrl}/${endpoint}`);
      req2.flush(mockResponse);
    });

    it('should clear cache for specific URL', () => {
      const url = `${baseUrl}/people/1`;
      const mockResponse = { name: 'Luke Skywalker' };

      // Make a cached request
      service['get']('people/1', true).subscribe();
      const req = httpMock.expectOne(url);
      req.flush(mockResponse);

      // Clear specific cache entry
      service.clearCacheForUrl(url);

      // Next request should not use cache
      service['get']('people/1', true).subscribe();
      const req2 = httpMock.expectOne(url);
      req2.flush(mockResponse);
    });
  });
});
