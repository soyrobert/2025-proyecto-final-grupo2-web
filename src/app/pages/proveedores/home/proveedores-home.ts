import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IconPlusComponent } from 'src/app/shared/icon/icon-plus';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ProveedoresService } from '../../../services/proveedores/proveedores.service';
import { StorageService } from '../../../services/storage/storage.service';
import Swal from 'sweetalert2';

/**
 * Interfaz para el resultado de un proveedor individual en la importación
 */
interface ResultadoProveedor {
  indice: number;
  status: 'success' | 'error';
  proveedor: {
    id?: number;
    nombre: string;
    email: string;
    numero_contacto: string;
    pais: string;
    caracteristicas: string;
    condiciones_comerciales_tributarias: string;
  };
  error?: string;
}

/**
 * Interfaz para la respuesta de importación masiva
 */
interface RespuestaImportacion {
  exitosos: number;
  fallidos: number;
  resultados: ResultadoProveedor[];
  total: number;
}

@Component({
  standalone: true,
  selector: 'app-proveedores-home',
  templateUrl: './proveedores-home.html',
  imports: [
    CommonModule,
    TranslateModule,
    IconPlusComponent,
    ReactiveFormsModule,
    FormsModule,
    ModalComponent
  ],
})
export class ProveedoresHome implements OnInit {
  @ViewChild('modalProveedor') modalProveedor!: ModalComponent;
  @ViewChild('excelFileInput') excelFileInput!: ElementRef;
  @ViewChild('dropZone') dropZone!: ElementRef;

  formularioProveedor!: FormGroup;
  cargando: boolean = false;

  // Configuración para la importación masiva
  archivoExcelSeleccionado: File | null = null;
  nombreArchivoExcel: string = '';
  tamanioArchivoExcel: string = '';
  errorArchivoExcel: string | null = null;
  maxTamanioExcel: number = 1 * 1024 * 1024; // 1MB
  formatosExcelPermitidos: string[] = [
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel'
  ];
  subiendoExcel: boolean = false;
  progresoSubidaExcel: number = 0;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private proveedoresService: ProveedoresService,
    private storageService: StorageService
  ) {
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    // Inicializaciones si se necesitan mas adelante
  }

  ngAfterViewInit(): void {
    this.inicializarDropZone();
  }

  /**
   * Inicializa el área de arrastrar y soltar para archivos CSV
  */
  inicializarDropZone(): void {
    if (this.dropZone && this.dropZone.nativeElement) {
      const dropZoneElement = this.dropZone.nativeElement;

      // Evento para cuando se arrastra un archivo sobre la zona
      dropZoneElement.addEventListener('dragover', (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        dropZoneElement.classList.add('border-primary');
      });

      // Eventos para cuando se sale de la zona
      dropZoneElement.addEventListener('dragleave', (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        dropZoneElement.classList.remove('border-primary');
      });

      // Evento para cuando se suelta un archivo
      dropZoneElement.addEventListener('drop', (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        dropZoneElement.classList.remove('border-primary');

        if (e.dataTransfer.files.length) {
          const file = e.dataTransfer.files[0];
          // Validar la extensión antes de procesar
          const extension = file.name.split('.').pop()?.toLowerCase();
          if (extension !== 'csv') {
            this.showMessage(
              this.translate.instant('txt_archivo_no_compatible'),
              'error'
            );
            return;
          }
          this.procesarArchivoExcel(file);
        }
      });

      // Evento para hacer clic en la zona
      dropZoneElement.addEventListener('click', () => {
        if (this.excelFileInput) {
          this.excelFileInput.nativeElement.click();
        }
      });
    }
  }

  inicializarFormulario() {
    this.formularioProveedor = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      numeroContacto: ['', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.minLength(7), Validators.maxLength(15)]],
      pais: ['', Validators.required],
      caracteristicas: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      condiciones: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    });
  }

  abrirModalProveedor() {
    this.inicializarFormulario();
    this.modalProveedor.open();
  }

  /**
   * Maneja la selección de archivos CSV
   * @param event Evento de cambio del input file
   */
  onExcelSeleccionado(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.procesarArchivoExcel(file);
    }
  }

  /**
   * Procesa un archivo seleccionado validando que sea CSV
   * @param file Archivo a procesar
   */
  procesarArchivoExcel(file: File): void {
    this.errorArchivoExcel = null;

    // Verificar la extensión del archivo
    const extension = file.name.split('.').pop()?.toLowerCase();

    // Validar formato por extensión y tipo MIME
    if (extension !== 'csv' || !this.formatosExcelPermitidos.includes(file.type)) {
      this.errorArchivoExcel = this.translate.instant('txt_formato_csv_no_valido');
      this.showMessage(
        this.translate.instant('txt_seleccionar_solo_csv'),
        'warning'
      );
      this.limpiarSeleccionExcel();
      return;
    }

    // Validar tamaño
    if (file.size > this.maxTamanioExcel) {
      this.errorArchivoExcel = this.translate.instant('txt_csv_demasiado_grande');
      this.showMessage(
        this.translate.instant('txt_csv_excede_tamano_permitido', {tamano: this.formatearTamanio(this.maxTamanioExcel)}),
        'warning'
      );
      this.limpiarSeleccionExcel();
      return;
    }

    // Actualizar información del archivo seleccionado
    this.archivoExcelSeleccionado = file;
    this.nombreArchivoExcel = file.name;
    this.tamanioArchivoExcel = this.formatearTamanio(file.size);
  }

  /**
   * Sube el archivo CSV a Cloud Storage y luego inicia la importación
   */
  subirArchivoExcel(): void {
    if (!this.archivoExcelSeleccionado) {
      this.showMessage(
        this.translate.instant('txt_seleccionar_archivo_csv'),
        'warning'
      );
      return;
    }

    this.subiendoExcel = true;
    this.progresoSubidaExcel = 0;

    this.storageService.uploadCsvFile(this.archivoExcelSeleccionado).subscribe({
      next: (publicUrl) => {
        console.log(`Archivo CSV subido exitosamente a: ${publicUrl}`);

        const urlBase = publicUrl.split('?')[0];

        // Iniciar la importación masiva
        this.importarProveedoresMasivamente(urlBase);
      },
      error: (error) => {
        console.error('Error al subir archivo CSV:', error);
        this.subiendoExcel = false;
        this.progresoSubidaExcel = 0;

        this.errorArchivoExcel = this.translate.instant('txt_error_subir_csv');
        this.showMessage(
          this.translate.instant('txt_error_subir_csv'),
          'error'
        );
      }
    });
  }

  /**
   * Importa proveedores masivamente usando la URL del CSV
   * @param csvUrl URL del archivo CSV en Cloud Storage
   */
  importarProveedoresMasivamente(csvUrl: string): void {
    this.progresoSubidaExcel = 50;

    this.proveedoresService.importarProveedoresMasivamente(csvUrl).subscribe({
      next: (respuesta: RespuestaImportacion) => {
        this.subiendoExcel = false;
        this.progresoSubidaExcel = 100;

        // Extraer información de la respuesta
        const exitosos = respuesta.exitosos || 0;
        const fallidos = respuesta.fallidos || 0;
        const total = respuesta.total || 0;
        const resultados = respuesta.resultados || [];

        let mensaje = this.translate.instant('txt_proveedores_importados_resumen', {
          exitosos: exitosos,
          fallidos: fallidos,
          total: total
        });

        if (fallidos > 0) {
          this.showMessage(mensaje, exitosos > 0 ? 'success' : 'warning');

          const proveedoresFallidos = resultados
            .filter((r: ResultadoProveedor) => r.status === 'error')
            .map((r: ResultadoProveedor) => `${r.proveedor.nombre}: ${r.error}`);

          if (proveedoresFallidos.length > 0) {
            Swal.fire({
              title: this.translate.instant('txt_resultado_importacion'),
              html: `
                <div>
                  <p>${mensaje}</p>
                </div>
              `,
              icon: exitosos > 0 ? 'info' : 'warning',
              confirmButtonText: `<i class="fa fa-check"></i> ${this.translate.instant('btn_aceptar')}`,
              customClass: {
                confirmButton: 'btn btn-primary'
              },
              buttonsStyling: false
            });
          }
        } else {
          this.showMessage(mensaje, 'success');
        }

        setTimeout(() => {
          this.limpiarSeleccionExcel();
          this.progresoSubidaExcel = 0;
        }, 3000);
      },
      error: (error: any) => {
        console.error('Error al importar proveedores:', error);
        this.subiendoExcel = false;

        let errorMsg = this.translate.instant('txt_error_desconocido');

        if (error.status === 400 && error.error.detalles) {
          errorMsg = Object.values(error.error.detalles).join(', ');
        } else if (error.status === 413) {
          errorMsg = this.translate.instant('msg_archivo_muy_grande');
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
   * Limpia la selección del archivo Excel
   */
  limpiarSeleccionExcel(): void {
    this.archivoExcelSeleccionado = null;
    this.nombreArchivoExcel = '';
    this.tamanioArchivoExcel = '';
    this.errorArchivoExcel = null;

    if (this.excelFileInput) {
      this.excelFileInput.nativeElement.value = '';
    }
  }

  /**
   * Formatea el tamaño del archivo a una representación legible
   * @param bytes Tamaño en bytes
   */
  formatearTamanio(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  guardarProveedor() {
    if (this.formularioProveedor.invalid) {
      Object.keys(this.formularioProveedor.controls).forEach(key => {
        const control = this.formularioProveedor.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.cargando = true;

    this.proveedoresService.registrarProveedor(this.formularioProveedor.value)
      .subscribe({
        next: (respuesta) => {
          if (respuesta && respuesta.error) {
            this.cargando = false;
            this.showMessage(
              respuesta.error || this.translate.instant('msg_proveedor_ya_existe_nombre'),
              'error'
            );
          } else {
            this.cargando = false;
            this.showMessage(
              this.translate.instant('txt_proveedor_registrado_exitosamente'),
              'success'
            );
            this.modalProveedor.close();
          }
        },
        error: (error) => {
          this.cargando = false;

          // Manejar errores
          let errorMsg = this.translate.instant('txt_error_desconocido');

          if (error.status === 400 && error.error.detalles) {
            // Error de validación
            errorMsg = Object.values(error.error.detalles).join(', ');
          } else if (error.status === 409) {
            // Error de conflicto (proveedor ya existe)
            errorMsg = this.translate.instant('msg_proveedor_ya_existe');
          } else if (error.status === 403) {
            // Error de permisos
            errorMsg = this.translate.instant('msg_no_tiene_permisos');
          }
          else if (error.status === 207) {
            // Proveedor ya existe por nombre
            errorMsg = this.translate.instant('msg_proveedor_ya_existe_nombre');

          } else if (error.status === 0) {
            // Error de conexión
            errorMsg = this.translate.instant('msg_error_conexion');
          } else if (error.error.message) {
            errorMsg = error.error.message;
          }

          this.showMessage(errorMsg, 'error');
        }
      });
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
