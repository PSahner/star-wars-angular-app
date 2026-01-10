import { extractIdFromUrl, handleImageError, resolveImageUrl, translateGender } from './utilities';

describe('shared utilities', () => {
  it('translateGender should translate known values (case-insensitive)', () => {
    expect(translateGender('male')).toBe('Männlich');
    expect(translateGender('FEMALE')).toBe('Weiblich');
    expect(translateGender('unknown')).toBe('Unbekannt');
  });

  it('translateGender should fall back to original value for unknown keys', () => {
    expect(translateGender('droid')).toBe('droid');
  });

  it('extractIdFromUrl should extract numeric IDs', () => {
    expect(extractIdFromUrl('https://swapi.info/api/people/1/')).toBe(1);
    expect(extractIdFromUrl('https://swapi.info/api/people/12')).toBe(12);
    expect(extractIdFromUrl('invalid')).toBeNull();
  });

  it('handleImageError should set fallback src on HTMLImageElement', () => {
    const img = document.createElement('img');
    img.src = 'https://example.com/original.png';

    handleImageError({ target: img } as unknown as Event, 'assets/images/fallback.png');

    expect(img.src).toContain('assets/images/fallback.png');
  });

  it('resolveImageUrl should return existing imageUrl when present', () => {
    const url = resolveImageUrl({ imageUrl: 'https://example.com/x.png' }, () => 'fallback');
    expect(url).toBe('https://example.com/x.png');
  });

  it('resolveImageUrl should use fallback when imageUrl is missing or non-string', () => {
    const fallback = jasmine.createSpy('fallback').and.returnValue('computed');

    expect(resolveImageUrl({} as never, fallback)).toBe('computed');
    expect(resolveImageUrl({ imageUrl: 123 } as never, fallback)).toBe('computed');
    expect(fallback).toHaveBeenCalled();
  });
});
