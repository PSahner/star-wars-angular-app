import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';

/**
 * Root component of the Star Wars Angular application
 *
 * This component serves as the main container for the application,
 * including the header navigation and router outlet for page content.
 *
 * Architecture:
 * - Standalone component (no NgModules)
 * - Includes HeaderComponent for navigation
 * - RouterOutlet for dynamic page rendering
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  /** Application title */
  title = 'Star Wars Angular App';

  /** Current year for footer */
  currentYear = new Date().getFullYear();
}
