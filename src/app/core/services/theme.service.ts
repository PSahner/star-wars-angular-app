import { Injectable, signal, computed, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

/**
 * Service for managing the application's theme (light/dark).
 * Persists the user preference to localStorage and applies the `dark` class to
 * the document root for Tailwind dark mode.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme-preference';

  // Use signal for reactive state management
  private themeSignal = signal<Theme>('light');

  // Public readonly signal for components to consume
  readonly currentTheme = computed(() => this.themeSignal());
  readonly isDark = computed(() => this.themeSignal() === 'dark');

  constructor() {
    this.initializeTheme();

    // Effect to apply theme class to html element
    effect(() => {
      const theme = this.themeSignal();
      const root = document.documentElement;

      if (theme === 'dark') {
        console.log('[ThemeService] Activating dark mode');
        root.classList.add('dark');
      } else {
        console.log('[ThemeService] Activating light mode');
        root.classList.remove('dark');
      }

      localStorage.setItem(this.THEME_KEY, theme);
    });
  }

  toggleTheme(): void {
    this.themeSignal.update(current => current === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
  }

  private initializeTheme(): void {
    // 1. Check local storage
    const storedTheme = localStorage.getItem(this.THEME_KEY) as Theme | null;

    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
      this.themeSignal.set(storedTheme);
      return;
    }

    // 2. Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.themeSignal.set('dark');
      return;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      this.themeSignal.set('light');
      return;
    }

    // 3. Default to light
    this.themeSignal.set('light');
  }
}
