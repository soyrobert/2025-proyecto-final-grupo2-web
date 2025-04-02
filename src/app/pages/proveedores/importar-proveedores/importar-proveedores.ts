import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-importar-proveedores',
  template: `
    <div class="p-4">
      <h1 class="text-xl font-bold">Importar proveedores</h1>
      <p></p>
    </div>
  `,
  imports: [CommonModule],
})
export class ImportarProveedores {}
