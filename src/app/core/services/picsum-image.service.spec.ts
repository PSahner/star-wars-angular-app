import { PicsumImageService } from './picsum-image.service';
import { Film, Person, PersonWithId } from '@core/models';

describe('PicsumImageService', () => {
  let service: PicsumImageService;

  beforeEach(() => {
    service = new PicsumImageService();
  });

  it('should build seeded image url with normalized size', () => {
    const url = service.getSeededImageUrl('hello', { width: 12.9, height: -5 });
    expect(url).toBe('https://picsum.photos/seed/hello/12/1');
  });

  it('should encode the seed', () => {
    const url = service.getSeededImageUrl('a b/c', { width: 1, height: 1 });
    expect(url).toBe('https://picsum.photos/seed/a%20b%2Fc/1/1');
  });

  it('should use numeric id when provided on person resource', () => {
    const person: PersonWithId = {
      id: 7,
      name: 'Someone',
      height: '0',
      mass: '0',
      hair_color: 'n/a',
      skin_color: 'n/a',
      eye_color: 'n/a',
      birth_year: 'n/a',
      gender: 'n/a',
      homeworld: '',
      films: [],
      species: [],
      vehicles: [],
      starships: [],
      created: '',
      edited: '',
      url: 'https://swapi.info/api/people/7/'
    };

    const url = service.getPersonImageUrl(person, { width: 10, height: 10 });
    expect(url).toBe('https://picsum.photos/seed/person-7/10/10');
  });

  it('should extract id from person url when no id is present', () => {
    const person: Person = {
      name: 'Luke Skywalker',
      height: '0',
      mass: '0',
      hair_color: 'n/a',
      skin_color: 'n/a',
      eye_color: 'n/a',
      birth_year: 'n/a',
      gender: 'n/a',
      homeworld: '',
      films: [],
      species: [],
      vehicles: [],
      starships: [],
      created: '',
      edited: '',
      url: 'https://swapi.info/api/people/1/'
    };

    const url = service.getPersonImageUrl(person, { width: 10, height: 10 });
    expect(url).toBe('https://picsum.photos/seed/person-1/10/10');
  });

  it('should fall back to person name when url has no id', () => {
    const person: Person = {
      name: 'Luke Skywalker',
      height: '0',
      mass: '0',
      hair_color: 'n/a',
      skin_color: 'n/a',
      eye_color: 'n/a',
      birth_year: 'n/a',
      gender: 'n/a',
      homeworld: '',
      films: [],
      species: [],
      vehicles: [],
      starships: [],
      created: '',
      edited: '',
      url: 'https://swapi.info/api/people/'
    };

    const url = service.getPersonImageUrl(person, { width: 10, height: 10 });
    expect(url).toBe('https://picsum.photos/seed/person-Luke%20Skywalker/10/10');
  });

  it('should use film id extracted from url when present', () => {
    const film: Film = {
      title: 'A New Hope',
      episode_id: 4,
      opening_crawl: '',
      director: '',
      producer: '',
      release_date: '',
      characters: [],
      planets: [],
      starships: [],
      vehicles: [],
      species: [],
      created: '',
      edited: '',
      url: 'https://swapi.info/api/films/2/'
    };

    const url = service.getFilmImageUrl(film, { width: 2, height: 3 });
    expect(url).toBe('https://picsum.photos/seed/film-2/2/3');
  });

  it('should fall back to film title when film url has no id', () => {
    const film: Film = {
      title: 'A New Hope',
      episode_id: 4,
      opening_crawl: '',
      director: '',
      producer: '',
      release_date: '',
      characters: [],
      planets: [],
      starships: [],
      vehicles: [],
      species: [],
      created: '',
      edited: '',
      url: 'https://swapi.info/api/films/'
    };

    const url = service.getFilmImageUrl(film, { width: 2, height: 3 });
    expect(url).toBe('https://picsum.photos/seed/film-A%20New%20Hope/2/3');
  });
});
