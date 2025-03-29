import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
})
export class FooterComponent {
  currYear: number = new Date().getFullYear();

  constructor() {}

  ngOnInit() {}
}
