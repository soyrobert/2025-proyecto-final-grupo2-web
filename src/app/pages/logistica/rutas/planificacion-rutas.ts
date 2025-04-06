import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-planificacion-rutas',
  template: `
    <div class="p-4">
      <h1 class="text-xl font-bold">Planificación rutas </h1>
      <p></p>
    </div>
  `,
  imports: [CommonModule],
})
export class PlanificacionRutas {}
