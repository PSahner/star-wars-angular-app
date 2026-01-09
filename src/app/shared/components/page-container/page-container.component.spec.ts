import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageContainerComponent } from './page-container.component';

/**
 * Test host component for PageContainerComponent.
 */
@Component({
  standalone: true,
  imports: [PageContainerComponent],
  template: `<app-page-container><p id="projected">Hello</p></app-page-container>`
})
class HostComponent {}

describe('PageContainerComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
  });

  it('should project content', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('#projected')?.textContent).toContain('Hello');
  });
});
