import { NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';

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

  @Output() closed = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if ('open' in changes) {
      this.syncBodyScrollLock();
    }
  }

  ngOnDestroy(): void {
    this.unlockBodyScroll();
  }

  onBackdropClick(): void {
    if (!this.closeOnBackdrop) return;
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.open) return;
    this.closed.emit();
  }

  private syncBodyScrollLock(): void {
    if (this.open) {
      document.body.classList.add('overflow-hidden');
      return;
    }

    this.unlockBodyScroll();
  }

  private unlockBodyScroll(): void {
    document.body.classList.remove('overflow-hidden');
  }
}
