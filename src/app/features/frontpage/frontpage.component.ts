import { Component } from '@angular/core';

import { PageContainerComponent } from '@shared/components/page-container/page-container.component';
import { StarWarsLogoComponent } from '@shared/components/star-wars-logo/star-wars-logo.component';

/**
 * Landing page component displaying the Star Wars logo.
 *
 * @description
 * This component serves as the main entry point for the application.
 * It displays a full-height hero area with the centered Star Wars logo.
 * Uses PageContainerComponent for layout structure.
 *
 * @component
 */
@Component({
  selector: 'app-frontpage',
  standalone: true,
  imports: [PageContainerComponent, StarWarsLogoComponent],
  templateUrl: './frontpage.component.html'
})
export class FrontpageComponent {}
