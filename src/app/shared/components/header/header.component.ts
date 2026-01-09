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
 *
 * @example
 * ```html
 * <app-header></app-header>
 * ```
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

  /** Current search query */
  searchQuery: string = '';

  /** Flag to toggle mobile menu */
  isMobileMenuOpen: boolean = false;

  isCompact: boolean = false;

  readonly isDark = this.themeService.isDark;

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
   * Toggles between light and dark theme
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  /**
   * Handles search submission
   * Currently logs to console - can be extended to navigate to search results
   */
  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('[HeaderComponent] Search query:', this.searchQuery);
      // TODO: Implement search functionality
      // Example: this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  /**
   * Toggles mobile menu open/closed
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  /**
   * Closes mobile menu (e.g., when a navigation link is clicked)
   */
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
}
