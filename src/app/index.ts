import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-index',
  imports: [CommonModule, TranslateModule],
  templateUrl: './index.html',
})
export class IndexComponent {}
