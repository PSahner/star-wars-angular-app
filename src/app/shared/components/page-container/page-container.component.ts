import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { Input } from '@angular/core';

/**
 * Shared page layout container.
 *
 * Features:
 * - Consistent horizontal container width
 * - Optional outer wrapper classes via `classNames`
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
