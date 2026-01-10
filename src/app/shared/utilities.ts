/**
 * Shared utility helpers used across the application.
 */

/**
 * Translates SWAPI gender strings into German labels.
 *
 * @param gender Raw gender value from SWAPI
 * @returns Localized German label (or original value if unknown)
 */
export function translateGender(gender: string): string {
  const normalized = gender.toLowerCase();

  const translations: Record<string, string> = {
    male: 'Männlich',
    female: 'Weiblich',
    hermaphrodite: 'Hermaphrodit',
    'n/a': 'Nicht zutreffend',
    unknown: 'Unbekannt'
  };

  return translations[normalized] || gender;
}

/**
 * Extracts the numeric resource id from a SWAPI resource URL.
 *
 * Example: `https://swapi.dev/api/people/1/` -> `1`
 *
 * @param url SWAPI resource URL
 * @returns Parsed id or `null` if the URL doesn't end with an id
 */
export function extractIdFromUrl(url: string): number | null {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Image `error` event handler that swaps the broken image source with a fallback.
 * Prevents infinite error loops if the fallback also fails.
 *
 * @param event DOM error event
 * @param fallbackSrc URL to the fallback image asset
 */
export function handleImageError(event: Event, fallbackSrc: string = 'assets/images/placeholder-1024x1024.svg'): void {
  const img = event.target;
  if (img instanceof HTMLImageElement) {
    if (img.src.includes(fallbackSrc)) return;
    img.onerror = null;
    img.src = fallbackSrc;
  }
}

/**
 * Resolves an image URL for a resource.
 * If the resource has an `imageUrl` string property, it is used; otherwise the
 * provided fallback is returned.
 *
 * @param resource Any resource object
 * @param fallback Function producing a fallback URL
 * @returns Resolved image URL
 */
export function resolveImageUrl<T>(resource: T, fallback: () => string): string {
  const maybeImageUrl = (resource as unknown as { imageUrl?: unknown }).imageUrl;
  if (typeof maybeImageUrl === 'string') {
    return maybeImageUrl;
  }

  return fallback();
}
