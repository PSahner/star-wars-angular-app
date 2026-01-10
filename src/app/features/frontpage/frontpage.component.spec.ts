import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FrontpageComponent } from './frontpage.component';
import { PageContainerComponent } from '@shared/components/page-container/page-container.component';
import { StarWarsLogoComponent } from '@shared/components/star-wars-logo/star-wars-logo.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('FrontpageComponent', () => {
  let component: FrontpageComponent;
  let fixture: ComponentFixture<FrontpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrontpageComponent, PageContainerComponent, StarWarsLogoComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null,
              },
            },
            params: of({}),
          },
        },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FrontpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render star wars logo', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-star-wars-logo')).toBeTruthy();
  });
});
