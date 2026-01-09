import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  function setMatchMedia(matches: boolean): void {
    (window as unknown as { matchMedia?: unknown }).matchMedia = ((query: string) => {
      return {
        matches,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false
      };
    }) as unknown as typeof window.matchMedia;
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
    spyOn(localStorage, 'setItem');
    spyOn(document.documentElement.classList, 'add');
    spyOn(document.documentElement.classList, 'remove');
  });

  it('should be created', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    setMatchMedia(false);

    TestBed.configureTestingModule({
      providers: [ThemeService]
    });

    const service = TestBed.inject(ThemeService);
    expect(service).toBeTruthy();
  });

  it('should initialize from localStorage when stored theme is valid', fakeAsync(() => {
    spyOn(localStorage, 'getItem').and.returnValue('dark');
    setMatchMedia(false);

    TestBed.configureTestingModule({
      providers: [ThemeService]
    });

    const service = TestBed.inject(ThemeService);
    tick();

    expect(service.currentTheme()).toBe('dark');
    expect(service.isDark()).toBeTrue();
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme-preference', 'dark');
  }));

  it('should initialize from system preference (dark) when localStorage is empty', fakeAsync(() => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    setMatchMedia(true);

    TestBed.configureTestingModule({
      providers: [ThemeService]
    });

    const service = TestBed.inject(ThemeService);
    tick();

    expect(service.currentTheme()).toBe('dark');
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme-preference', 'dark');
  }));

  it('should default to light when no stored theme and system preference is not dark', fakeAsync(() => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    setMatchMedia(false);

    TestBed.configureTestingModule({
      providers: [ThemeService]
    });

    const service = TestBed.inject(ThemeService);
    tick();

    expect(service.currentTheme()).toBe('light');
    expect(service.isDark()).toBeFalse();
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme-preference', 'light');
  }));

  it('should toggle theme', fakeAsync(() => {
    spyOn(localStorage, 'getItem').and.returnValue('light');
    setMatchMedia(false);

    TestBed.configureTestingModule({
      providers: [ThemeService]
    });

    const service = TestBed.inject(ThemeService);
    tick();

    service.toggleTheme();
    tick();

    expect(service.currentTheme()).toBe('dark');
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme-preference', 'dark');

    service.toggleTheme();
    tick();

    expect(service.currentTheme()).toBe('light');
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme-preference', 'light');
  }));

  it('should set theme explicitly', fakeAsync(() => {
    spyOn(localStorage, 'getItem').and.returnValue('light');
    setMatchMedia(false);

    TestBed.configureTestingModule({
      providers: [ThemeService]
    });

    const service = TestBed.inject(ThemeService);
    tick();

    service.setTheme('dark');
    tick();
    expect(service.currentTheme()).toBe('dark');
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');

    service.setTheme('light');
    tick();
    expect(service.currentTheme()).toBe('light');
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
  }));
});
