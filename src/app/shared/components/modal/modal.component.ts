import { NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';

/**
 * Generic modal component.
 *
 * @description
 * Renders a modal dialog overlay with backdrop.
 * Handles body scroll locking when open and cleanup when closed/destroyed.
 * Supports closing via backdrop click or Escape key.
 *
 * @component
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgIf],
  templateUrl: './modal.component.html'
})
export class ModalComponent implements OnChanges, OnDestroy {
  @Input() open = false;
  @Input() ariaLabel = 'Dialog';
  @Input() closeOnBackdrop = true;

  /** Emitted when the modal requests to be closed */
  @Output() closed = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if ('open' in changes) {
      this.syncBodyScrollLock();
    }
  }

  ngOnDestroy(): void {
    this.unlockBodyScroll();
  }

  /**
   * Handles click events on the modal backdrop (background)
   */
  onBackdropClick(): void {
    if (!this.closeOnBackdrop) return;
    this.closed.emit();
  }

  /**
   * Handles escape key press to close modal
   */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.open) return;
    this.closed.emit();
  }

  /**
   * Synchronizes body scroll lock based on modal open state
   */
  private syncBodyScrollLock(): void {
    if (this.open) {
      document.body.classList.add('overflow-hidden');
      return;
    }
    this.unlockBodyScroll();
  }

  /**
   * Unlocks body scroll
   */
  private unlockBodyScroll(): void {
    document.body.classList.remove('overflow-hidden');
  }
}
