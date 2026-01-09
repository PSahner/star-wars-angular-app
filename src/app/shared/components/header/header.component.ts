import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../core/services/theme.service';
import { StarWarsLogoComponent } from '../star-wars-logo/star-wars-logo.component';

/**
 * Header component with navigation and search functionality
 *
 * Features:
 * - Star Wars logo
 * - Navigation menu (Filme, Charaktere, Planeten)
 * - Search bar (UI-only for now)
 * - Theme toggle
 * - Responsive design with mobile menu
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StarWarsLogoComponent],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  private themeService = inject(ThemeService);

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
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;

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
    document.documentElement.style.setProperty('--app-header-height', `${px}px`);
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
