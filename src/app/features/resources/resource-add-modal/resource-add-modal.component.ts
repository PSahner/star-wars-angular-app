import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { ResourceKey } from '../resource-registry';

import { DynamicFormComponent, FormFieldConfig, FormFieldOption } from '@shared/components/dynamic-form/dynamic-form.component';
import { ModalComponent } from '@shared/components/modal/modal.component';

type FormValue = Record<string, unknown>;

type ResourceFormConfig = {
  title: string;
  fields: FormFieldConfig[];
};

@Component({
  selector: 'app-resource-add-modal',
  standalone: true,
  imports: [NgIf, ModalComponent, DynamicFormComponent],
  templateUrl: './resource-add-modal.component.html'
})
export class ResourceAddModalComponent {
  @Input() open = false;
  @Input() resourceKey: ResourceKey | null = null;

  @Output() closed = new EventEmitter<void>();

  @ViewChild(DynamicFormComponent) private dynamicForm?: DynamicFormComponent;

  isSaving = false;
  private latestValue: FormValue = {};

  onValueChange(value: FormValue): void {
    this.latestValue = value;
  }

  close(): void {
    this.resetForm();
    this.closed.emit();
  }

  submit(): void {
    if (this.isSaving) return;

    this.isSaving = true;

    window.setTimeout(() => {
      console.log('[ResourceAddModal] would submit:', {
        resource: this.resourceKey,
        payload: this.latestValue
      });

      this.isSaving = false;
      this.resetForm();
      this.closed.emit();
    }, 900);
  }

  title(): string {
    return this.formConfig()?.title ?? '';
  }

  fields(): FormFieldConfig[] {
    return this.formConfig()?.fields ?? [];
  }

  private resetForm(): void {
    this.isSaving = false;
    this.latestValue = {};
    this.dynamicForm?.reset();
  }

  private formConfig(): ResourceFormConfig | null {
    if (!this.resourceKey) return null;

    if (this.resourceKey === 'planets') {
      return {
        title: 'Planet hinzufügen',
        fields: planetFields({
          climates: ['arid', 'temperate', 'frozen', 'tropical'],
          terrains: ['desert', 'grasslands', 'mountains', 'forest'],
          residents: [
            { label: 'Luke Skywalker', value: 'https://swapi.dev/api/people/1/' },
            { label: 'Leia Organa', value: 'https://swapi.dev/api/people/5/' },
            { label: 'Darth Vader', value: 'https://swapi.dev/api/people/4/' }
          ],
          films: [
            { label: 'A New Hope', value: 'https://swapi.dev/api/films/1/' },
            { label: 'The Empire Strikes Back', value: 'https://swapi.dev/api/films/2/' },
            { label: 'Return of the Jedi', value: 'https://swapi.dev/api/films/3/' }
          ]
        })
      };
    }

    if (this.resourceKey === 'people') {
      return {
        title: 'Person hinzufügen',
        fields: personFields({
          hairColors: ['black', 'blond', 'brown', 'none'],
          genders: ['male', 'female', 'n/a'],
          homeworlds: [
            { label: 'Tatooine', value: 'https://swapi.dev/api/planets/1/' },
            { label: 'Alderaan', value: 'https://swapi.dev/api/planets/2/' },
            { label: 'Naboo', value: 'https://swapi.dev/api/planets/8/' }
          ],
          films: [
            { label: 'A New Hope', value: 'https://swapi.dev/api/films/1/' },
            { label: 'The Empire Strikes Back', value: 'https://swapi.dev/api/films/2/' },
            { label: 'Return of the Jedi', value: 'https://swapi.dev/api/films/3/' }
          ]
        })
      };
    }

    return {
      title: 'Film hinzufügen',
      fields: filmFields({
        characters: [
          { label: 'Luke Skywalker', value: 'https://swapi.dev/api/people/1/' },
          { label: 'Leia Organa', value: 'https://swapi.dev/api/people/5/' },
          { label: 'Han Solo', value: 'https://swapi.dev/api/people/14/' }
        ],
        planets: [
          { label: 'Tatooine', value: 'https://swapi.dev/api/planets/1/' },
          { label: 'Alderaan', value: 'https://swapi.dev/api/planets/2/' },
          { label: 'Naboo', value: 'https://swapi.dev/api/planets/8/' }
        ]
      })
    };
  }
}

function toOptions(values: string[]): FormFieldOption[] {
  return values.map((v) => ({ label: v, value: v }));
}

function planetFields(input: {
  climates: string[];
  terrains: string[];
  residents: FormFieldOption[];
  films: FormFieldOption[];
}): FormFieldConfig[] {
  return [
    { key: 'name', label: 'Name', placeholder: 'Name eingeben', type: 'text', width: 'full' },
    { key: 'climate', label: 'Klima', type: 'multiselect', width: 'half', options: toOptions(input.climates) },
    { key: 'terrain', label: 'Terrain', type: 'multiselect', width: 'half', options: toOptions(input.terrains) },
    { key: 'population', label: 'Bevölkerung', placeholder: 'Bevölkerungszahl eingeben', type: 'number', width: 'half' },
    { key: 'rotation_period', label: 'Rotationsdauer', placeholder: 'Rotationsdauer eingeben', type: 'number', width: 'half' },
    { key: 'orbital_period', label: 'Umlaufzeit', placeholder: 'Umlaufzeit eingeben', type: 'number', width: 'half' },
    { key: 'diameter', label: 'Durchmesser', placeholder: 'Durchmesser eingeben', type: 'number', width: 'half' },
    { key: 'gravity', label: 'Schwerkraft', placeholder: 'Schwerkraft eingeben', type: 'number', width: 'half' },
    { key: 'surface_water', label: 'Wasserbedeckung', placeholder: 'Wasserbedeckung eingeben', type: 'number', width: 'half' },
    { key: 'residents', label: 'Bewohner', type: 'multiselect', width: 'full', options: input.residents },
    { key: 'films', label: 'Filme', type: 'multiselect', width: 'full', options: input.films }
  ];
}

function personFields(input: {
  hairColors: string[];
  genders: string[];
  homeworlds: FormFieldOption[];
  films: FormFieldOption[];
}): FormFieldConfig[] {
  return [
    { key: 'name', label: 'Name', placeholder: 'Name eingeben', type: 'text', width: 'full', tooltip: 'Name der Person' },
    { key: 'height', label: 'Größe', placeholder: 'Größe eingeben', type: 'number', width: 'half' },
    { key: 'mass', label: 'Gewicht', placeholder: 'Gewicht eingeben', type: 'number', width: 'half' },
    { key: 'hair_color', label: 'Haarfarbe', placeholder: 'Haarfarbe auswählen', type: 'select', width: 'half', options: toOptions(input.hairColors) },
    { key: 'skin_color', label: 'Hautfarbe', placeholder: 'Hautfarbe eingeben', type: 'text', width: 'half' },
    { key: 'eye_color', label: 'Augenfarbe', placeholder: 'Augenfarbe eingeben', type: 'text', width: 'half' },
    { key: 'birth_year', label: 'Geburtsjahr', placeholder: 'Geburtsjahr eingeben', type: 'text', width: 'half' },
    { key: 'gender', label: 'Geschlecht', placeholder: 'Geschlecht auswählen', type: 'select', width: 'half', options: toOptions(input.genders) },
    { key: 'homeworld', label: 'Heimatplanet', placeholder: 'Heimatplanet auswählen', type: 'select', width: 'full', options: input.homeworlds },
    { key: 'films', label: 'Filme', type: 'multiselect', width: 'full', options: input.films }
  ];
}

function filmFields(input: { characters: FormFieldOption[]; planets: FormFieldOption[] }): FormFieldConfig[] {
  return [
    { key: 'title', label: 'Titel', placeholder: 'Titel eingeben', type: 'text', width: 'full' },
    { key: 'episode_id', label: 'Episode', placeholder: 'Episodennr. eingeben', type: 'number', width: 'half' },
    { key: 'release_date', label: 'Veröffentlichungsdatum', placeholder: 'Datum/Jahr eingeben', type: 'text', width: 'half' },
    { key: 'opening_crawl', label: 'Lauftext', placeholder: 'Lauftext eingeben', type: 'textarea', width: 'full' },
    { key: 'director', label: 'Regisseur', placeholder: 'Regisseur eingeben', type: 'text', width: 'half' },
    { key: 'producer', label: 'Produzent', placeholder: 'Produzent eingeben', type: 'text', width: 'half' },
    { key: 'characters', label: 'Personen', type: 'multiselect', width: 'full', options: input.characters },
    { key: 'planets', label: 'Planeten', type: 'multiselect', width: 'full', options: input.planets }
  ];
}
