import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LogisticaService } from '../../../services/logistica/planificacion-rutas-service';

@Component({
  standalone: true,
  selector: 'app-planificacion-rutas',
  templateUrl: './planificacion-rutas.html',
  imports: [CommonModule, FormsModule, TranslateModule],
})
export class PlanificacionRutas implements OnInit {
  camiones: any[] = [];
  fechaSeleccionada: string = this.obtenerFechaActual();
  cargando: boolean = false;
  errorCarga: boolean = false;
  errorMensaje: string = '';
  procesandoEnrutamiento: boolean = false;
  mensajes: string[] = [];

  constructor(
    private logisticaService: LogisticaService
  ) {}

  ngOnInit(): void {
    this.cargarCamiones();
  }

  obtenerFechaActual(): string {
    const hoy = new Date();
    return hoy.toISOString().substring(0, 10);
  }

  cargarCamiones(): void {
    this.cargando = true;
    this.errorCarga = false;
    this.mensajes = [];
    this.camiones = [];

    this.logisticaService.obtenerCamiones(this.fechaSeleccionada).subscribe({
      next: (respuesta) => {
        this.cargando = false;

        if (respuesta && respuesta.total > 0) {
          for (let i = 0; i < respuesta.total; i++) {
            if (respuesta.camiones && respuesta.camiones[i]) {
              this.camiones.push({
                id: respuesta.camiones[i].id,
                placa: respuesta.camiones[i].placa,
                marca: respuesta.camiones[i].marca,
                modelo: respuesta.camiones[i].modelo,
                capacidad_carga_toneladas: respuesta.camiones[i].capacidad_carga_toneladas,
                volumen_carga_metros_cubicos: respuesta.camiones[i].volumen_carga_metros_cubicos,
                estado_enrutamiento: respuesta.camiones[i].estado_enrutamiento
              });
            }
          }
        }
      },
      error: (error) => {
        this.cargando = false;
        this.errorCarga = true;
        this.errorMensaje = error.message || 'Error al cargar camiones';
        console.error('Error al cargar camiones:', error);
      }
    });
  }

  enrutarCamionesSinRuta(): void {
    this.procesandoEnrutamiento = true;

    this.logisticaService.asignarRuta(this.fechaSeleccionada).subscribe({
      next: (respuesta) => {
        if (respuesta && respuesta.mensajes) {
          this.mensajes = [...this.mensajes, ...respuesta.mensajes];
        }

        this.cargarCamiones();
        this.procesandoEnrutamiento = false;
      },
      error: (error) => {
        this.mensajes.push(`Error al enrutar camiones: ${error.message || 'Error desconocido'}`);
        this.procesandoEnrutamiento = false;
        console.error('Error al enrutar camiones:', error);
      }
    });
  }
}
