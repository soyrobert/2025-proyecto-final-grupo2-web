import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-vendedores-home',
  templateUrl: './vendedores-home.html',
  imports: [CommonModule, TranslateModule],
})
export class VendedoresHome {}
