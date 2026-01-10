import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { Input } from '@angular/core';

/**
 * Shared page layout container.
 *
 * @description
 * Provides a consistent centered container with max-width and padding
 * for page content. Supports additional custom classes.
 *
 * @component
 */
@Component({
  selector: 'app-page-container',
  standalone: true,
  imports: [NgClass],
  templateUrl: './page-container.component.html',
})
export class PageContainerComponent {
  @Input() classNames = '';
}
