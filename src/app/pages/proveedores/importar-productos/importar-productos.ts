import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-importar-productos',
  template: `
    <div class="p-4">
      <h1 class="text-xl font-bold">Importar productos</h1>
      <p></p>
    </div>
  `,
  imports: [CommonModule],
})
export class ImportarProductos {}
