import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-planes-venta',
  template: `
    <div class="p-4">
      <h1 class="text-xl font-bold">Planes de venta</h1>
      <p></p>
    </div>
  `,
  imports: [CommonModule],
})
export class PlanesVenta {}
