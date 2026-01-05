import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

/**
 * Header component with navigation and search functionality
 *
 * Features:
 * - Star Wars logo
 * - Navigation menu (Filme, Charaktere, Planeten)
 * - Search bar (UI-only for now)
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
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  /** Current search query */
  searchQuery: string = '';

  /** Flag to toggle mobile menu */
  isMobileMenuOpen: boolean = false;

  /**
   * Handles search submission
   * Currently logs to console - can be extended to navigate to search results
   */
  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Search query:', this.searchQuery);
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
