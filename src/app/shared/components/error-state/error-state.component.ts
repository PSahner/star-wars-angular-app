import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';

/**
 * Error state component.
 *
 * Features:
 * - Displays an error title/message
 * - Optional retry action
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

  @Output() retry = new EventEmitter<void>();
}
