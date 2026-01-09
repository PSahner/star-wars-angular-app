import { Component } from '@angular/core';

import { PageContainerComponent } from '@shared/components/page-container/page-container.component';
import { StarWarsLogoComponent } from '@shared/components/star-wars-logo/star-wars-logo.component';

/**
 * Landing page component displaying the Star Wars logo.
 *
 * Features:
 * - Full-height hero area
 * - Centered logo layout
 */
@Component({
  selector: 'app-frontpage',
  standalone: true,
  imports: [PageContainerComponent, StarWarsLogoComponent],
  templateUrl: './frontpage.component.html'
})
export class FrontpageComponent {}
