import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-vendedores-home',
  template: `
    <div class="p-4">
      <h1 class="text-xl font-bold">Home de Vendedores</h1>
      <p></p>
    </div>
  `,
  imports: [CommonModule],
})
export class VendedoresHome {}
