import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LogisticaService } from '../../../services/logistica/planificacion-rutas-service';
import Swal from 'sweetalert2';

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

  // Mapeo de estados para traducción
  estadosTraducidos: Record<'Enrutado' | 'Sin ruta' | 'Sin entregas programadas', string> = {
    'Enrutado': 'txt_estado_enrutado',
    'Sin ruta': 'txt_estado_sin_ruta',
    'Sin entregas programadas': 'txt_estado_sin_entregas_programadas'
  };

  constructor(
    private logisticaService: LogisticaService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.cargarCamiones();
  }

  obtenerFechaActual(): string {
    const hoy = new Date();
    return hoy.toISOString().substring(0, 10);
  }

  /**
   * Traduce el estado del camión según el idioma actual
   * @param estado Estado original del camión (en español)
   * @returns Estado traducido según el idioma actual
   */
  getEstadoTraducido(estado: string): string {
    if (estado in this.estadosTraducidos) {
      return this.translate.instant(this.estadosTraducidos[estado as 'Enrutado' | 'Sin ruta' | 'Sin entregas programadas']);
    }
    return estado;
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
        this.errorMensaje = error.message || this.translate.instant('txt_error_cargar_camiones');
        this.showMessage(this.translate.instant('txt_error_cargar_camiones'), 'error');
      }
    });
  }

  enrutarCamionesSinRuta(): void {
    this.procesandoEnrutamiento = true;

    this.logisticaService.asignarRuta(this.fechaSeleccionada).subscribe({
      next: (respuesta) => {
        if (respuesta && respuesta.mensajes) {
          this.mensajes = [...this.mensajes, ...respuesta.mensajes];

          // Mostrar mensaje de éxito
          this.showMessage(
            this.translate.instant('txt_camiones_enrutados_exitosamente'),
            'success'
          );
        }

        this.cargarCamiones();
        this.procesandoEnrutamiento = false;
      },
      error: (error) => {
        this.mensajes.push(`Error al enrutar camiones: ${error.message || this.translate.instant('txt_error_desconocido')}`);
        this.procesandoEnrutamiento = false;

        // Mostrar mensaje de error
        let errorMsg = this.translate.instant('txt_error_desconocido');

        if (error.status === 400 && error.error.detalles) {
          errorMsg = Object.values(error.error.detalles).join(', ');
        } else if (error.status === 403) {
          errorMsg = this.translate.instant('msg_no_tiene_permisos');
        } else if (error.status === 0) {
          errorMsg = this.translate.instant('msg_error_conexion');
        } else if (error.error && error.error.message) {
          errorMsg = error.error.message;
        }

        this.showMessage(errorMsg, 'error');
      }
    });
  }

  /**
   * Verifica si hay camiones con estado exactamente "Sin ruta" para mostrar/ocultar el botón
   * @returns true si hay al menos un camión con estado "Sin ruta"
   */
  hayCamionesSinRuta(): boolean {
    return this.camiones.some(camion => camion.estado_enrutamiento === 'Sin ruta');
  }

  getBadgeClass(estadoEnrutamiento: string): string {
    switch (estadoEnrutamiento) {
      case 'Enrutado':
        return 'badge bg-success';
      case 'Routed':
        return 'badge bg-success';
      case 'Sin ruta':
        return 'badge bg-danger';
      case 'Without route':
        return 'badge bg-danger';
      default:
        return 'badge bg-warning';
    }
  }

  /**
   * Muestra un mensaje usando Sweetalert2
   * @param msg Mensaje a mostrar
   * @param type Tipo de mensaje: 'success', 'error', 'warning', 'info'
   */
  showMessage(msg = '', type: 'success' | 'error' | 'warning' | 'info' | 'question' = 'success') {
    const toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      customClass: {
        container: 'toast'
      }
    });

    toast.fire({
      icon: type,
      title: msg,
      padding: '10px 20px'
    });
  }
}
