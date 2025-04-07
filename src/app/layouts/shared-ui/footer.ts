import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './footer.html',
})
export class FooterComponent {
  currYear: number = new Date().getFullYear();

  constructor() {}

  ngOnInit() {}
}
