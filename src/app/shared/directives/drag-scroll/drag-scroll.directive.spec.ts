import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragScrollDirective } from './drag-scroll.directive';

@Component({
  standalone: true,
  imports: [DragScrollDirective],
  template: `
    <div
      id="scroller"
      style="width: 100px; overflow: auto;"
      appDragScroll
      [appDragScrollEnabled]="enabled"
      [appDragScrollAxis]="axis"
      [appDragScrollSpeed]="speed"
    >
      <div style="width: 1000px; height: 10px"></div>
    </div>
  `
})
class HostComponent {
  enabled = true;
  axis: 'x' | 'y' = 'x';
  speed = 1;
}

describe('DragScrollDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  function scroller(): HTMLElement {
    return fixture.nativeElement.querySelector('#scroller') as HTMLElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should prevent default on dragstart', () => {
    const ev = new Event('dragstart', { cancelable: true });
    scroller().dispatchEvent(ev);
    expect(ev.defaultPrevented).toBeTrue();
  });

  it('should start dragging on left mouse pointerdown and update scrollLeft on move', () => {
    const el = scroller();
    (el as unknown as { scrollLeft: number }).scrollLeft = 50;

    const down = new PointerEvent('pointerdown', {
      pointerId: 1,
      pointerType: 'mouse',
      button: 0,
      clientX: 100,
      cancelable: true
    });

    el.dispatchEvent(down);
    fixture.detectChanges();

    expect(el.style.cursor).toBe('grabbing');

    const move = new PointerEvent('pointermove', {
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 80,
      cancelable: true
    });

    el.dispatchEvent(move);
    fixture.detectChanges();

    expect((el as unknown as { scrollLeft: number }).scrollLeft).toBe(70);

    const up = new PointerEvent('pointerup', {
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 80,
      cancelable: true
    });

    el.dispatchEvent(up);
    fixture.detectChanges();

    expect(el.style.cursor).toBe('grab');
  });

  it('should ignore pointerdown when disabled', () => {
    host.enabled = false;
    fixture.detectChanges();

    const el = scroller();
    (el as unknown as { scrollLeft: number }).scrollLeft = 50;

    const down = new PointerEvent('pointerdown', {
      pointerId: 1,
      pointerType: 'mouse',
      button: 0,
      clientX: 100,
      cancelable: true
    });

    el.dispatchEvent(down);

    const move = new PointerEvent('pointermove', {
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 0,
      cancelable: true
    });

    el.dispatchEvent(move);
    fixture.detectChanges();

    expect(el.style.cursor).toBe('grab');
    expect((el as unknown as { scrollLeft: number }).scrollLeft).toBe(50);
  });

  it('should prevent click after a drag gesture', () => {
    const el = scroller();
    (el as unknown as { scrollLeft: number }).scrollLeft = 0;

    const down = new PointerEvent('pointerdown', {
      pointerId: 1,
      pointerType: 'mouse',
      button: 0,
      clientX: 100,
      cancelable: true
    });

    el.dispatchEvent(down);

    const move = new PointerEvent('pointermove', {
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 0,
      cancelable: true
    });

    el.dispatchEvent(move);

    const click = new MouseEvent('click', { cancelable: true });
    el.dispatchEvent(click);

    expect(click.defaultPrevented).toBeTrue();
  });
});
