import { Directive, ElementRef, HostBinding, HostListener, Input, inject } from '@angular/core';

/**
 * Directive that enables click-and-drag scrolling for an overflow container.
 *
 * Designed for horizontal carousels by default, with optional axis and speed
 * customization.
 */
@Directive({
  selector: '[appDragScroll]',
  standalone: true
})
export class DragScrollDirective {
  private elRef = inject(ElementRef) as ElementRef<HTMLElement>;

  @Input() appDragScrollEnabled = true;

  // Drag axis (default: x = horizontal)
  @Input() appDragScrollAxis: 'x' | 'y' = 'x';
  // Drag sensitivity multiplier
  @Input() appDragScrollSpeed = 1;

  private isDragging = false;
  private startX = 0;
  private startScrollLeft = 0;
  private hasDragged = false;

  @HostBinding('style.cursor')
  get cursor(): string {
    return this.isDragging ? 'grabbing' : 'grab';
  }

  @HostBinding('style.userSelect')
  get userSelect(): string {
    return this.isDragging ? 'none' : '';
  }

  @HostBinding('style.scrollBehavior')
  get scrollBehavior(): string {
    return this.isDragging ? 'auto' : '';
  }

  @HostBinding('style.scrollSnapType')
  get scrollSnapType(): string {
    return this.isDragging ? 'none' : '';
  }

  // Prevents the native drag behavior (e.g. dragging images) inside the container.
  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent): void {
    event.preventDefault();
  }

  // Starts a drag gesture and stores the initial pointer + scroll positions.
  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    if (!this.appDragScrollEnabled) return;
    if (event.pointerType !== 'mouse') return;
    if (event.button !== 0) return;

    const el = this.elRef.nativeElement;

    this.isDragging = true;
    this.hasDragged = false;
    this.startX = event.clientX;
    this.startScrollLeft = el.scrollLeft;

    el.setPointerCapture(event.pointerId);
  }

  // Updates scroll position while dragging.
  @HostListener('pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    if (!this.isDragging) return;

    const el = this.elRef.nativeElement;

    const dx = (event.clientX - this.startX) * this.appDragScrollSpeed;
    if (Math.abs(dx) > 3 * this.appDragScrollSpeed) {
      this.hasDragged = true;
    }

    event.preventDefault();

    if (this.appDragScrollAxis === 'x') {
      el.scrollLeft = this.startScrollLeft - dx;
    }
  }

  // Ends a drag gesture and releases pointer capture.
  @HostListener('pointerup', ['$event'])
  onPointerUp(event: PointerEvent): void {
    if (!this.isDragging) return;

    const el = this.elRef.nativeElement;
    this.isDragging = false;

    try {
      el.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  }

  // Cancels a drag gesture (e.g. when pointer capture is lost).
  @HostListener('pointercancel', ['$event'])
  onPointerCancel(event: PointerEvent): void {
    if (!this.isDragging) return;

    const el = this.elRef.nativeElement;
    this.isDragging = false;

    try {
      el.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  }

  // Prevents clicks after a drag gesture to avoid accidental navigation.
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (this.hasDragged) {
      event.preventDefault();
      event.stopPropagation();
      this.hasDragged = false;
    }
  }
}
