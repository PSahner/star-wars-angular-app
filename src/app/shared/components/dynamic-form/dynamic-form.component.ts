import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

export type FormFieldWidth = 'full' | 'half';

export type FormFieldOption = {
  label: string;
  value: string;
};

export type FormFieldType = 'text' | 'number' | 'textarea' | 'select' | 'multiselect';

/**
 * Configuration for a single form field
 */
export type FormFieldConfig = {
  key: string;
  label: string;
  placeholder?: string;
  type: FormFieldType;
  width?: FormFieldWidth; // (defaults to 'full')
  // #INFO: Tooltip element is not implemented yet
  tooltip?: string;
  // #INFO: Multi-select functionality is not fully implemented
  options?: FormFieldOption[];
};

/**
 * Dynamic form component that generates form controls based on configuration.
 *
 * @description
 * This component takes an array of {@link FormFieldConfig} and renders a reactive form.
 * It handles form validation, value changes, and layout arrangement.
 * Supports various field types including text, number, select, and multiselect.
 *
 * @component
 */
@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, ReactiveFormsModule],
  templateUrl: './dynamic-form.component.html'
})
export class DynamicFormComponent implements OnChanges, OnDestroy {
  @Input() fields: FormFieldConfig[] = [];

  /** Emits the current form value whenever it changes */
  @Output() valueChange = new EventEmitter<Record<string, unknown>>();

  form = new FormGroup({});
  private valueSub?: Subscription;

  ngOnChanges(changes: SimpleChanges): void {
    if ('fields' in changes) {
      this.buildForm();
    }
  }

  ngOnDestroy(): void {
    this.valueSub?.unsubscribe();
  }

  /**
   * Resets the form to its initial state and emits the new (empty) value
   */
  reset(): void {
    this.form.reset();
    this.emitValue();
  }

  /**
   * Checks if a field should occupy the full width of the container
   * @param field Field configuration
   * @returns True if width is 'full' or undefined
   */
  isFullWidth(field: FormFieldConfig): boolean {
    return (field.width ?? 'full') === 'full';
  }

  /**
   * Retrieves a FormControl by its key
   * @param key Field key
   * @returns The FormControl instance
   */
  control(key: string): FormControl {
    return this.form.get(key) as FormControl;
  }

  /**
   * Handler for value changes in the template
   */
  onValueChanged(): void {
    this.emitValue();
  }

  private emitValue(): void {
    this.valueChange.emit(this.form.getRawValue() as Record<string, unknown>);
  }

  private buildForm(): void {
    this.valueSub?.unsubscribe();

    const group: Record<string, FormControl> = {};

    for (const field of this.fields) {
      const defaultValue = field.type === 'multiselect' ? [] : '';
      group[field.key] = new FormControl(defaultValue);
    }

    this.form = new FormGroup(group);

    this.valueSub = this.form.valueChanges.subscribe(() => {
      this.emitValue();
    });

    this.emitValue();
  }
}
