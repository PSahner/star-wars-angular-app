import { Component } from '@angular/core';

/**
 * Application footer component.
 *
 * Features:
 * - Displays current year and attribution link
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
