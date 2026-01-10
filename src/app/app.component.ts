import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';

/**
 * Root component of the Star Wars Angular application.
 *
 * @description
 * This component serves as the main container for the application,
 * including the header navigation and router outlet for page content.
 *
 * Architecture:
 * - Standalone component (no NgModules)
 * - Includes HeaderComponent for navigation
 * - RouterOutlet for dynamic page rendering
 *
 * @component
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'Star Wars Angular App';
}
