import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';
import { SimpleChange } from '@angular/core';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Ensure body scroll lock is removed after each test
    document.body.classList.remove('overflow-hidden');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not lock body scroll initially if closed', () => {
    expect(document.body.classList.contains('overflow-hidden')).toBeFalse();
  });

  it('should lock body scroll when opened', () => {
    component.open = true;
    component.ngOnChanges({
      open: new SimpleChange(false, true, false)
    });
    expect(document.body.classList.contains('overflow-hidden')).toBeTrue();
  });

  it('should unlock body scroll when closed', () => {
    // First open it
    component.open = true;
    component.ngOnChanges({
      open: new SimpleChange(false, true, false)
    });
    expect(document.body.classList.contains('overflow-hidden')).toBeTrue();

    // Then close it
    component.open = false;
    component.ngOnChanges({
      open: new SimpleChange(true, false, false)
    });
    expect(document.body.classList.contains('overflow-hidden')).toBeFalse();
  });

  it('should emit closed event on backdrop click if closeOnBackdrop is true', () => {
    spyOn(component.closed, 'emit');
    component.closeOnBackdrop = true;
    component.onBackdropClick();
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should not emit closed event on backdrop click if closeOnBackdrop is false', () => {
    spyOn(component.closed, 'emit');
    component.closeOnBackdrop = false;
    component.onBackdropClick();
    expect(component.closed.emit).not.toHaveBeenCalled();
  });

  it('should emit closed event on escape key', () => {
    spyOn(component.closed, 'emit');
    component.open = true;

    // Simulate escape key press
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);

    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should unlock body scroll on destroy', () => {
    component.open = true;
    component.ngOnChanges({
      open: new SimpleChange(false, true, false)
    });
    expect(document.body.classList.contains('overflow-hidden')).toBeTrue();

    component.ngOnDestroy();
    expect(document.body.classList.contains('overflow-hidden')).toBeFalse();
  });
});
