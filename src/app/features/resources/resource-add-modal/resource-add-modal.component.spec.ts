import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ResourceAddModalComponent } from './resource-add-modal.component';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ResourceAddModalComponent', () => {
  let component: ResourceAddModalComponent;
  let fixture: ComponentFixture<ResourceAddModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceAddModalComponent, DynamicFormComponent, ModalComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceAddModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct title for planets', () => {
    component.resourceKey = 'planets';
    fixture.detectChanges();
    expect(component.title()).toBe('Planet hinzufügen');
  });

  it('should have correct title for people', () => {
    component.resourceKey = 'people';
    fixture.detectChanges();
    expect(component.title()).toBe('Person hinzufügen');
  });

  it('should have correct title for films', () => {
    component.resourceKey = 'films';
    fixture.detectChanges();
    expect(component.title()).toBe('Film hinzufügen');
  });

  it('should emit closed event when close is called', () => {
    spyOn(component.closed, 'emit');
    component.close();
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should handle submit correctly', fakeAsync(() => {
    spyOn(component.closed, 'emit');
    spyOn(console, 'log');

    component.submit();
    expect(component.isSaving).toBeTrue();

    tick(900);

    expect(component.isSaving).toBeFalse();
    expect(component.closed.emit).toHaveBeenCalled();
  }));

  it('should not submit if already saving', () => {
    component.isSaving = true;
    spyOn(component.closed, 'emit');

    component.submit();

    expect(component.closed.emit).not.toHaveBeenCalled();
  });
});
