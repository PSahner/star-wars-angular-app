import { Component, Input } from '@angular/core';

/**
 * Loading state component.
 *
 * Features:
 * - Spinner with customizable message
 */
@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [],
  templateUrl: './loading-state.component.html'
})
export class LoadingStateComponent {
  @Input() message = 'Lade...';
}
