import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-wars-logo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-wars-logo.component.html'
})
export class StarWarsLogoComponent {
  @Input() className = '';
}
