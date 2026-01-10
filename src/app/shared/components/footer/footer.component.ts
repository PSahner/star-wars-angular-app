import { Component } from '@angular/core';

/**
 * Application footer component.
 *
 * @description
 * Displays the application footer containing the current year and
 * attribution links to the data source (SWAPI).
 *
 * @component
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
