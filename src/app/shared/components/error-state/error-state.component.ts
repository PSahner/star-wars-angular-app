import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-state.component.html'
})
export class ErrorStateComponent {
  @Input() title = 'Fehler';
  @Input() message = '';
  @Input() retryLabel = 'Erneut versuchen';
  @Input() showRetry = true;

  @Output() retry = new EventEmitter<void>();
}
