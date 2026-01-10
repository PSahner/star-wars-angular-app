import { Component, HostListener, inject } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../core/services/theme.service';
import { StarWarsLogoComponent } from '../star-wars-logo/star-wars-logo.component';

/**
 * Header component with navigation and search functionality.
 *
 * @description
 * The main application header containing:
 * - Star Wars logo and home link
 * - Navigation menu (Films, Characters, Planets)
 * - Search bar (UI only)
 * - Theme toggle (Light/Dark mode)
 * - Mobile responsive menu
 *
 * @component
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, RouterModule, FormsModule, StarWarsLogoComponent],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  private themeService = inject(ThemeService);

  readonly navItems = [
    { label: 'Filme', route: '/films' },
    { label: 'Personen', route: '/people' },
    { label: 'Planete', route: '/planets' }
  ] as const;

  private readonly desktopExpandedHeight = 134;
  private readonly desktopCompactHeight = 98;
  private readonly mobileHeight = 80;

  readonly isDark = this.themeService.isDark;

  searchQuery = '';
  isMobileMenuOpen = false;
  isCompact = false;

  /**
   * #INFO:
   * Usage of `constructor()` (not `ngOnInit()`) for `syncHeaderHeight()` so CSS
   * variable is set asap, avoiding first-render layout jump, and also not
   * necessary as it doesn't depend on template bindings or `@Input()` values.
   */
  constructor() {
    this.syncHeaderHeight();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.syncHeaderHeight();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.syncHeaderHeight();
  }

  private syncHeaderHeight(): void {
    const isDesktop = window.matchMedia('(min-width: 48rem)').matches;

    if (!isDesktop) {
      this.isCompact = false;
      this.setHeaderHeightCssVar(this.mobileHeight);
      return;
    }

    const nextIsCompact = window.scrollY > 0;
    if (nextIsCompact !== this.isCompact) {
      this.isCompact = nextIsCompact;
    }

    this.setHeaderHeightCssVar(
      this.isCompact ? this.desktopCompactHeight : this.desktopExpandedHeight
    );
  }

  private setHeaderHeightCssVar(px: number): void {
    const rem = px / 16;
    document.documentElement.style.setProperty('--app-header-height', `${rem}rem`);
  }

  /**
   * #INFO:
   * Currently only logs to console.
   * Our current SWAPI integration is read-only and implemented as simple GET
   * requests without query parameters (e.g. no `?search=...`), so a proper
   * server-side search can't be implemented without extending the service layer
   * (or doing client-side filtering like `PeopleService.searchPeople()`).
   */
  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('[HeaderComponent] Search query:', this.searchQuery);
      // TODO: Implement search functionality
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
