import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { computed, signal } from '@angular/core';
import { HeaderComponent } from './header.component';
import { ThemeService } from '../../../core/services/theme.service';

class FakeThemeService {
  private readonly dark = signal(false);
  readonly isDark = computed(() => this.dark());
  readonly toggleTheme = jasmine.createSpy('toggleTheme').and.callFake(() => {
    this.dark.update((v) => !v);
  });
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let themeService: FakeThemeService;

  function setMatchMediaMatches(matches: boolean): void {
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

  beforeEach(async () => {
    setMatchMediaMatches(true);
    spyOn(document.documentElement.style, 'setProperty');
    spyOnProperty(window, 'scrollY', 'get').and.returnValue(0);

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule],
      providers: [{ provide: ThemeService, useClass: FakeThemeService }]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    themeService = TestBed.inject(ThemeService) as unknown as FakeThemeService;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set mobile header height and disable compact mode on non-desktop', async () => {
    setMatchMediaMatches(false);

    const localFixture = TestBed.createComponent(HeaderComponent);
    const localComponent = localFixture.componentInstance;

    expect(localComponent.isCompact).toBeFalse();
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--app-header-height', '5rem');
  });

  it('should set expanded desktop header height when scrollY is 0', () => {
    expect(component.isCompact).toBeFalse();
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--app-header-height', '8.375rem');
  });

  it('should switch to compact mode on desktop when scrolled', () => {
    (window as unknown as { matchMedia?: unknown }).matchMedia = ((query: string) => {
      return {
        matches: true,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false
      };
    }) as unknown as typeof window.matchMedia;

    (Object.getOwnPropertyDescriptor(window, 'scrollY')?.get as unknown as jasmine.Spy<() => number>).and.returnValue(10);

    component.onWindowScroll();

    expect(component.isCompact).toBeTrue();
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--app-header-height', '6.125rem');
  });

  it('should toggle the theme', () => {
    component.toggleTheme();
    expect(themeService.toggleTheme).toHaveBeenCalled();
  });

  it('should toggle mobile menu open/closed', () => {
    expect(component.isMobileMenuOpen).toBeFalse();
    component.toggleMobileMenu();
    expect(component.isMobileMenuOpen).toBeTrue();
    component.toggleMobileMenu();
    expect(component.isMobileMenuOpen).toBeFalse();
  });

  it('should close mobile menu', () => {
    component.isMobileMenuOpen = true;
    component.closeMobileMenu();
    expect(component.isMobileMenuOpen).toBeFalse();
  });

  it('should log search query when non-empty', () => {
    spyOn(console, 'log');
    component.searchQuery = '  luke  ';

    component.onSearch();

    expect(console.log).toHaveBeenCalled();
  });

  it('should not log search query when empty/whitespace', () => {
    spyOn(console, 'log');
    component.searchQuery = '   ';

    component.onSearch();

    expect(console.log).not.toHaveBeenCalled();
  });

  it('should render nav and toggle buttons', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('app-star-wars-logo')).toBeTruthy();
    expect(el.querySelector('button[aria-label="Toggle menu"]')).toBeTruthy();
  });
});
