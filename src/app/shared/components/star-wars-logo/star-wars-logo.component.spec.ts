import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StarWarsLogoComponent } from './star-wars-logo.component';

describe('StarWarsLogoComponent', () => {
  let component: StarWarsLogoComponent;
  let fixture: ComponentFixture<StarWarsLogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarWarsLogoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StarWarsLogoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply className to svg via ngClass', () => {
    component.className = 'h-10 w-10';
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const svg = el.querySelector('svg');

    expect(svg).toBeTruthy();
    const classAttr = svg?.getAttribute('class') ?? '';
    expect(classAttr).toContain('h-10');
    expect(classAttr).toContain('w-10');
  });
});
