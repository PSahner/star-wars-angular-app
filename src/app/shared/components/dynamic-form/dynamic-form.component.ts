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

export type FormFieldConfig = {
  key: string;
  label: string;
  placeholder?: string;
  type: FormFieldType;
  width?: FormFieldWidth;
  tooltip?: string;
  options?: FormFieldOption[];
};

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, ReactiveFormsModule],
  templateUrl: './dynamic-form.component.html'
})
export class DynamicFormComponent implements OnChanges, OnDestroy {
  @Input() fields: FormFieldConfig[] = [];

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

  reset(): void {
    this.form.reset();
    this.emitValue();
  }

  isFullWidth(field: FormFieldConfig): boolean {
    return (field.width ?? 'full') === 'full';
  }

  control(key: string): FormControl {
    return this.form.get(key) as FormControl;
  }

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
