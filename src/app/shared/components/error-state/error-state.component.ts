import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';

/**
 * Error state component for displaying error messages and actions.
 *
 * @description
 * This component presents a user-friendly error interface with a title, description,
 * and an optional retry button. Useful for handling API errors or empty states.
 *
 * @component
 */
@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [NgIf],
  templateUrl: './error-state.component.html'
})
export class ErrorStateComponent {
  @Input() title = 'Fehler';
  @Input() message = '';
  @Input() retryLabel = 'Erneut versuchen';
  @Input() showRetry = true;

  /** Emitted when the user clicks the retry button */
  @Output() retry = new EventEmitter<void>();
}
