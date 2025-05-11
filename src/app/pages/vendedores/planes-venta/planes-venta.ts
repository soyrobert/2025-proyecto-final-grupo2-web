import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, finalize, takeUntil } from 'rxjs';
import { ModalComponent } from '../../../components/modal/modal.component';
import { VendedoresPlanesVentaService, Vendedor, VendedorRequest } from '../../../services/vendedores/vendedores-planes-venta.service';
import Swal from 'sweetalert2';

interface CeldaEditada {
  valor: number;
  esValida: boolean;
  modificada: boolean;
}

interface VendedorEditado {
  id: number;
  metasEditadas: { [key: string]: CeldaEditada };
  metasOriginales: { [key: string]: number };
}

@Component({
  standalone: true,
  selector: 'app-planes-venta',
  templateUrl: './planes-venta.html',
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, ModalComponent],
})
export class PlanesVenta implements OnInit, OnDestroy {
  @ViewChild('modalMetas') modalMetas!: ModalComponent;

  // Datos de vendedores
  vendedores: Vendedor[] = [];
  vendedorSeleccionado: Vendedor | null = null;
  cargando: boolean = false;

  // Formulario para editar metas
  formularioMetas!: FormGroup;
  guardando: boolean = false;

  // Control para edición en línea
  vendedoresEditados: VendedorEditado[] = [];
  guardandoCambios: boolean = false;

  // Meses que se mostrarán (8 meses desde el actual)
  mesesMostrados: string[] = [];

  // Destructor de subscripciones
  private destroy$ = new Subject<void>();

  // Nombres de los meses para traducción y visualización
  nombresMeses: { [key: string]: string } = {
    '1': 'ene',
    '2': 'feb',
    '3': 'mar',
    '4': 'abr',
    '5': 'may',
    '6': 'jun',
    '7': 'jul',
    '8': 'ago',
    '9': 'sep',
    '10': 'oct',
    '11': 'nov',
    '12': 'dic'
  };

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private vendedoresService: VendedoresPlanesVentaService
  ) {
    this.inicializarMeses();
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    this.cargarVendedores();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  inicializarMeses(): void {
    // Obtener mes y año actual
    const fechaActual = new Date();
    let mesActual = fechaActual.getMonth() + 1; // Los meses en JS son 0-11
    let anioActual = fechaActual.getFullYear();

    // Generar los próximos 8 meses
    for (let i = 0; i < 8; i++) {
      const mesKey = `${this.nombresMeses[mesActual]}/${anioActual}`;
      this.mesesMostrados.push(mesKey);

      // Avanzar al siguiente mes
      mesActual++;
      if (mesActual > 12) {
        mesActual = 1;
        anioActual++;
      }
    }
  }

  inicializarFormulario(): void {
    const grupoControles: { [key: string]: any } = {};

    // Crear un control para cada mes
    this.mesesMostrados.forEach(mes => {
      grupoControles[mes] = [0, [Validators.required, Validators.min(0)]];
    });

    this.formularioMetas = this.fb.group(grupoControles);
  }

  cargarVendedores(): void {
    this.cargando = true;

    this.vendedoresService.obtenerVendedoresConPlanes()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cargando = false)
      )
      .subscribe({
        next: (vendedores) => {
          this.vendedores = vendedores;

          // No necesitamos inicializar los meses faltantes porque los datos mock ya los incluyen
          // pero lo dejamos por si en el futuro se obtienen de la API y falta algún mes
          this.vendedores.forEach(vendedor => {
            if (!vendedor.metas) {
              vendedor.metas = {};
            }

            // Inicializar meses faltantes con valor 0
            this.mesesMostrados.forEach(mes => {
              if (vendedor.metas[mes] === undefined) {
                vendedor.metas[mes] = 0;
              }
            });
          });
        },
        error: (error) => {
          this.showMessage(
            this.translate.instant('txt_error_cargar_vendedores'),
            'error'
          );

          // Si hay error al cargar, usar datos de respaldo para que la interfaz funcione
          this.cargarDatosMock();
        }
      });
  }

  // Método de respaldo en caso de error con el servicio
  cargarDatosMock(): void {
    // Similar al del servicio, pero usamos solo si falla la carga principal
    this.vendedores = [
      {
        id: 1,
        nombre: 'Robert Castro',
        email: 'robert.castro@example.com',
        metas: this.generarMetasAleatorias()
      },
      {
        id: 2,
        nombre: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@example.com',
        metas: this.generarMetasAleatorias()
      },
      {
        id: 3,
        nombre: 'María González',
        email: 'maria.gonzalez@example.com',
        metas: this.generarMetasAleatorias()
      }
    ];
  }

  generarMetasAleatorias(): { [key: string]: number } {
    const metas: { [key: string]: number } = {};

    this.mesesMostrados.forEach(mes => {
      const valorAleatorio = Math.floor(Math.random() * 16) + 5; // Entre 5 y 20
      metas[mes] = valorAleatorio * 1000;
    });

    return metas;
  }

  obtenerMetaPorMes(vendedor: Vendedor, mes: string): number {
    return vendedor.metas[mes] || 0;
  }

  abrirModalEditarMetas(vendedor: Vendedor): void {
    // Si el vendedor está en modo edición en línea, desactivarlo
    if (this.esVendedorEditado(vendedor.id)) {
      // Guardar los cambios actuales en la edición en línea
      this.guardarCambiosDeVendedor(vendedor.id);
    }

    this.vendedorSeleccionado = vendedor;

    // Establecer los valores actuales en el formulario
    const valoresFormulario: { [key: string]: number } = {};

    this.mesesMostrados.forEach(mes => {
      valoresFormulario[mes] = this.obtenerMetaPorMes(vendedor, mes);
    });

    this.formularioMetas.patchValue(valoresFormulario);

    // Abrir el modal
    this.modalMetas.open();
  }

  obtenerControlesMetas(): { key: string, label: string }[] {
    return this.mesesMostrados.map(mes => ({
      key: mes,
      label: mes.toUpperCase() // Se puede personalizar más si es necesario
    }));
  }

  guardarMetas(): void {
    if (this.formularioMetas.valid && this.vendedorSeleccionado) {
      this.guardando = true;

      // Crear el objeto de request con las nuevas metas
      const metasActualizadas: { [key: string]: number } = {};

      this.mesesMostrados.forEach(mes => {
        const nuevoValor = this.formularioMetas.get(mes)?.value;
        if (nuevoValor !== undefined) {
          metasActualizadas[mes] = nuevoValor;
        }
      });

      // Crear el objeto de request según la estructura esperada por la API
      const vendedorRequest: VendedorRequest = {
        id: this.vendedorSeleccionado.id,
        metas: metasActualizadas
      };

      // Llamar al servicio para guardar los cambios
      this.vendedoresService.actualizarPlanesVendedor(vendedorRequest)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.guardando = false)
        )
        .subscribe({
          next: (response) => {
            // Actualizar los datos locales
            if (this.vendedorSeleccionado) {
              this.mesesMostrados.forEach(mes => {
                const nuevoValor = this.formularioMetas.get(mes)?.value;
                if (nuevoValor !== undefined) {
                  if (this.vendedorSeleccionado && this.vendedorSeleccionado.metas) {
                    this.vendedorSeleccionado.metas[mes] = nuevoValor;
                  }
                }
              });
            }

            // Eliminar el vendedor de la lista de editados en línea si estaba ahí
            const indiceVendedorEditado = this.vendedoresEditados.findIndex(v => v.id === this.vendedorSeleccionado?.id);
            if (indiceVendedorEditado !== -1) {
              this.vendedoresEditados.splice(indiceVendedorEditado, 1);
            }

            // Cerrar el modal
            this.modalMetas.close();

            // Mostrar notificación de éxito
            this.showMessage(
              this.translate.instant('txt_metas_actualizadas_exito'),
              'success'
            );
          },
          error: (error) => {
            let errorMsg = this.translate.instant('txt_error_guardar_metas');

            if (error.status === 400 && error.error.detalles) {
              errorMsg = Object.values(error.error.detalles).join(', ');
            } else if (error.status === 403) {
              errorMsg = this.translate.instant('txt_no_tiene_permisos');
            } else if (error.status === 0) {
              errorMsg = this.translate.instant('txt_error_conexion');
            } else if (error.error && error.error.message) {
              errorMsg = error.error.message;
            }

            this.showMessage(errorMsg, 'error');
          }
        });
    }
  }

  // ========== Métodos para edición en línea ==========

  onInputFocus(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      inputElement.select();
    }
  }

  habilitarEdicionEnLinea(vendedor: Vendedor): void {
    // Verificar si el vendedor ya está en edición
    if (this.esVendedorEditado(vendedor.id)) {
      return; // Ya está en edición, no hacer nada
    }

    // Crear un objeto VendedorEditado para controlar la edición
    const vendedorEditado: VendedorEditado = {
      id: vendedor.id,
      metasEditadas: {},
      metasOriginales: { ...vendedor.metas }
    };

    // Inicializar los valores para cada mes
    this.mesesMostrados.forEach(mes => {
      const valorOriginal = this.obtenerMetaPorMes(vendedor, mes);
      vendedorEditado.metasEditadas[mes] = {
        valor: valorOriginal,
        esValida: true,
        modificada: false
      };
    });

    // Añadir a la lista de vendedores en edición
    this.vendedoresEditados.push(vendedorEditado);
  }

  esVendedorEditado(vendedorId: number): boolean {
    return this.vendedoresEditados.some(v => v.id === vendedorId);
  }

  obtenerVendedorEditado(vendedorId: number): VendedorEditado | undefined {
    return this.vendedoresEditados.find(v => v.id === vendedorId);
  }

  obtenerValorEditado(vendedorId: number, mes: string): number {
    const vendedorEditado = this.obtenerVendedorEditado(vendedorId);
    if (vendedorEditado && vendedorEditado.metasEditadas[mes]) {
      return vendedorEditado.metasEditadas[mes].valor;
    }

    // Si no está en edición, obtener el valor original
    const vendedor = this.vendedores.find(v => v.id === vendedorId);
    return vendedor ? this.obtenerMetaPorMes(vendedor, mes) : 0;
  }

  actualizarValorEditado(vendedorId: number, mes: string, event: Event): void {
    const vendedorEditado = this.obtenerVendedorEditado(vendedorId);
    if (!vendedorEditado) return;

    const valorInput = (event.target as HTMLInputElement).value;
    const nuevoValor = valorInput === '' ? 0 : parseInt(valorInput, 10);

    // Validar que sea un número positivo
    const esValido = !isNaN(nuevoValor) && nuevoValor >= 0;

    // Comprobar si es diferente al valor original
    const esModificado = nuevoValor !== vendedorEditado.metasOriginales[mes];

    // Actualizar el valor editado
    vendedorEditado.metasEditadas[mes] = {
      valor: nuevoValor,
      esValida: esValido,
      modificada: esModificado
    };
  }

  esCeldaInvalida(vendedorId: number, mes: string): boolean {
    const vendedorEditado = this.obtenerVendedorEditado(vendedorId);
    if (!vendedorEditado || !vendedorEditado.metasEditadas[mes]) return false;

    return !vendedorEditado.metasEditadas[mes].esValida;
  }

  esCeldaModificada(vendedorId: number, mes: string): boolean {
    const vendedorEditado = this.obtenerVendedorEditado(vendedorId);
    if (!vendedorEditado || !vendedorEditado.metasEditadas[mes]) return false;

    return vendedorEditado.metasEditadas[mes].modificada;
  }

  hayVendedoresEditados(): boolean {
    return this.vendedoresEditados.length > 0;
  }

  contarVendedoresEditados(): number {
    return this.vendedoresEditados.filter(v =>
      Object.values(v.metasEditadas).some(meta => meta.modificada)
    ).length;
  }

  guardarCambiosDeVendedor(vendedorId: number): void {
    const vendedorEditado = this.obtenerVendedorEditado(vendedorId);
    if (!vendedorEditado) return;

    // Verificar si todas las celdas son válidas
    const todasValidas = Object.values(vendedorEditado.metasEditadas)
      .every(meta => meta.esValida);

    if (!todasValidas) return; // No guardar si hay valores inválidos

    const hayModificaciones = Object.values(vendedorEditado.metasEditadas)
      .some(meta => meta.modificada);

    if (!hayModificaciones) {
      const indice = this.vendedoresEditados.findIndex(v => v.id === vendedorId);
      if (indice !== -1) {
        this.vendedoresEditados.splice(indice, 1);
      }
      return;
    }

    const vendedor = this.vendedores.find(v => v.id === vendedorId);
    if (!vendedor) return;

    const metasActualizadas: { [key: string]: number } = {};

    this.mesesMostrados.forEach(mes => {
      if (vendedorEditado.metasEditadas[mes] && vendedorEditado.metasEditadas[mes].modificada) {
        metasActualizadas[mes] = vendedorEditado.metasEditadas[mes].valor;
      }
    });

    const vendedorRequest: VendedorRequest = {
      id: vendedorId,
      metas: metasActualizadas
    };

    // Llamar al servicio para guardar los cambios
    this.vendedoresService.actualizarPlanesVendedor(vendedorRequest)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.mesesMostrados.forEach(mes => {
            if (vendedorEditado.metasEditadas[mes] && vendedorEditado.metasEditadas[mes].modificada) {
              vendedor.metas[mes] = vendedorEditado.metasEditadas[mes].valor;
            }
          });

          const indice = this.vendedoresEditados.findIndex(v => v.id === vendedorId);
          if (indice !== -1) {
            this.vendedoresEditados.splice(indice, 1);
          }

          this.showMessage(
            this.translate.instant('txt_metas_actualizadas_exito'),
            'success'
          );
        },
        error: (error) => {
          let errorMsg = this.translate.instant('txt_error_guardar_metas');

          if (error.status === 400 && error.error.detalles) {
            errorMsg = Object.values(error.error.detalles).join(', ');
          } else if (error.status === 403) {
            errorMsg = this.translate.instant('txt_no_tiene_permisos');
          } else if (error.status === 0) {
            errorMsg = this.translate.instant('txt_error_conexion');
          } else if (error.error && error.error.message) {
            errorMsg = error.error.message;
          }

          this.showMessage(errorMsg, 'error');
        }
      });
  }

  guardarCambiosEnLinea(): void {
    // Verificar si hay vendedores editados
    if (!this.hayVendedoresEditados()) return;

    const todasValidas = this.vendedoresEditados.every(v =>
      Object.values(v.metasEditadas).every(meta => meta.esValida)
    );

    if (!todasValidas) {
      this.showMessage(
        this.translate.instant('txt_hay_valores_invalidos'),
        'warning'
      );
      return;
    }

    const vendedoresConCambios = this.vendedoresEditados.filter(v =>
      Object.values(v.metasEditadas).some(meta => meta.modificada)
    );

    if (vendedoresConCambios.length === 0) {
      this.vendedoresEditados = [];
      return;
    }

    this.guardandoCambios = true;

    // Preparar el request para actualización masiva
    const vendedoresRequest: VendedorRequest[] = vendedoresConCambios.map(vendedorEditado => {
      const metasActualizadas: { [key: string]: number } = {};

      this.mesesMostrados.forEach(mes => {
        if (vendedorEditado.metasEditadas[mes] && vendedorEditado.metasEditadas[mes].modificada) {
          metasActualizadas[mes] = vendedorEditado.metasEditadas[mes].valor;
        }
      });

      return {
        id: vendedorEditado.id,
        metas: metasActualizadas
      };
    });

    // Llamar al servicio para guardar todos los cambios
    this.vendedoresService.actualizarPlanesMultiplesVendedores(vendedoresRequest)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.guardandoCambios = false)
      )
      .subscribe({
        next: () => {
          vendedoresConCambios.forEach(vendedorEditado => {
            const vendedor = this.vendedores.find(v => v.id === vendedorEditado.id);
            if (vendedor) {
              this.mesesMostrados.forEach(mes => {
                if (vendedorEditado.metasEditadas[mes] && vendedorEditado.metasEditadas[mes].modificada) {
                  vendedor.metas[mes] = vendedorEditado.metasEditadas[mes].valor;
                }
              });
            }
          });

          this.vendedoresEditados = [];

          this.showMessage(
            this.translate.instant('txt_metas_vendedores_actualizadas'),
            'success'
          );
        },
        error: (error) => {
          let errorMsg = this.translate.instant('txt_error_guardar_metas');

          if (error.status === 400 && error.error.detalles) {
            errorMsg = Object.values(error.error.detalles).join(', ');
          } else if (error.status === 403) {
            errorMsg = this.translate.instant('txt_no_tiene_permisos');
          } else if (error.status === 0) {
            errorMsg = this.translate.instant('txt_error_conexion');
          } else if (error.error && error.error.message) {
            errorMsg = error.error.message;
          }

          this.showMessage(errorMsg, 'error');
        }
      });
  }

  cancelarCambiosEnLinea(): void {
    this.vendedoresEditados = [];
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
