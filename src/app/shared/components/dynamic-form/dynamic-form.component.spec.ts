import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicFormComponent, FormFieldConfig } from './dynamic-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SimpleChange } from '@angular/core';

describe('DynamicFormComponent', () => {
  let component: DynamicFormComponent;
  let fixture: ComponentFixture<DynamicFormComponent>;

  const mockFields: FormFieldConfig[] = [
    { key: 'name', label: 'Name', type: 'text', width: 'full' },
    { key: 'age', label: 'Age', type: 'number', width: 'half' },
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      width: 'half',
      options: [{ label: 'Admin', value: 'admin' }]
    },
    {
        key: 'permissions',
        label: 'Permissions',
        type: 'multiselect',
        width: 'full',
        options: [{ label: 'Read', value: 'read' }]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicFormComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicFormComponent);
    component = fixture.componentInstance;
    component.fields = mockFields;

    // Trigger ngOnChanges to build form
    component.ngOnChanges({
      fields: new SimpleChange(null, mockFields, true)
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build form based on fields input', () => {
    expect(component.form.get('name')).toBeTruthy();
    expect(component.form.get('age')).toBeTruthy();
    expect(component.form.get('role')).toBeTruthy();
  });

  it('should initialize multiselect with empty array', () => {
      expect(component.form.get('permissions')!.value).toEqual([]);
  });

  it('should initialize other fields with empty string', () => {
      expect(component.form.get('name')!.value).toBe('');
  });

  it('should emit value changes', () => {
    spyOn(component.valueChange, 'emit');

    component.form.patchValue({ name: 'Luke' });

    expect(component.valueChange.emit).toHaveBeenCalledWith(jasmine.objectContaining({
      name: 'Luke'
    }));
  });

  it('should reset form', () => {
    component.form.patchValue({ name: 'Luke' });
    component.reset();

    expect(component.form.get('name')!.value).toBe(null);
  });

  it('should identify full width fields', () => {
    expect(component.isFullWidth(mockFields[0])).toBeTrue();
    expect(component.isFullWidth(mockFields[1])).toBeFalse();
  });

  it('should default width to full if not specified', () => {
      const fieldWithoutWidth: FormFieldConfig = { key: 'test', label: 'Test', type: 'text' };
      expect(component.isFullWidth(fieldWithoutWidth)).toBeTrue();
  });
});
