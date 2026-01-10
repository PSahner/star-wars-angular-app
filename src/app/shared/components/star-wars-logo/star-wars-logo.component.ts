import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

/**
 * Star Wars logo SVG component.
 *
 * @description
 * Renders the Star Wars logo as an inline SVG.
 * Supports sizing and coloring via Tailwind classes.
 *
 * @component
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
