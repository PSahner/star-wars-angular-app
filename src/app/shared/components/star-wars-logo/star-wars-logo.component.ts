import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

/**
 * Star Wars logo SVG component.
 *
 * Features:
 * - Accepts Tailwind class string via `classNames`
 */
@Component({
  selector: 'app-star-wars-logo',
  standalone: true,
  imports: [NgClass],
  templateUrl: './star-wars-logo.component.html'
})
export class StarWarsLogoComponent {
  @Input() classNames = '';
}
