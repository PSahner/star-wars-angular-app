import { Component, Input } from '@angular/core';

/**
 * Loading state component.
 *
 * @description
 * Displays a loading spinner with a customizable text message.
 * Used during asynchronous data fetching operations.
 *
 * @component
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
