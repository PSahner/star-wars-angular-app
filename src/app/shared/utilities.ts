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

export function extractIdFromUrl(url: string): number | null {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? parseInt(match[1], 10) : null;
}

export function handleImageError(event: Event, fallbackSrc: string = 'assets/images/character-placeholder.png'): void {
  const img = event.target;
  if (img instanceof HTMLImageElement) {
    img.src = fallbackSrc;
  }
}

export function resolveImageUrl<T>(resource: T, fallback: () => string): string {
  const maybeImageUrl = (resource as unknown as { imageUrl?: unknown }).imageUrl;
  if (typeof maybeImageUrl === 'string') {
    return maybeImageUrl;
  }

  return fallback();
}
