import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IconPlusComponent } from 'src/app/shared/icon/icon-plus';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ProductosService } from '../../../services/proveedores/productos.service';
import { ProveedoresService } from '../../../services/proveedores/proveedores.service';
import Swal from 'sweetalert2';

interface Proveedor {
  id: number;
  nombre: string;
  [key: string]: any;
}

interface ImagenPreview {
  archivo: File;
  url: string;
  tamanio: string;
}

@Component({
  standalone: true,
  selector: 'app-proveedores-productos',
  templateUrl: './importar-productos.html',
  imports: [
    CommonModule,
    TranslateModule,
    IconPlusComponent,
    ReactiveFormsModule,
    FormsModule,
    ModalComponent
  ],
})
export class ImportarProductos implements OnInit {
  @ViewChild('modalProducto') modalProducto!: ModalComponent;
  @ViewChild('fileInput') fileInput: any;
  
  formularioProducto!: FormGroup;
  cargando: boolean = false;
  proveedores: Proveedor[] = [];
  cargandoProveedores: boolean = false;
  errorProveedores: string | null = null;
  
  // Configuración para las imágenes
  imagenSeleccionada: ImagenPreview[] = [];
  errorImagen: string | null = null;
  maxTamanioImagen: number = 5 * 1024 * 1024; // 5MB en bytes
  formatosPermitidos: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private productosService: ProductosService,
    private proveedoresService: ProveedoresService
  ) {
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    this.cargarProveedores();
  }

  cargarProveedores(): void {
    this.cargandoProveedores = true;
    this.errorProveedores = null;

    this.proveedoresService.obtenerProveedores()
      .subscribe({
        next: (respuesta) => {
          this.proveedores = respuesta;
          this.cargandoProveedores = false;
        },
        error: (error) => {
          console.error('Error al cargar proveedores:', error);
          this.cargandoProveedores = false;
          this.errorProveedores = this.translate.instant('txt_error_cargar_proveedores');
        }
      });
  }

  inicializarFormulario() {
    this.formularioProducto = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      precioUnitario: ['', [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]],
      tiempoEntrega: ['', Validators.required],
      condicionesAlmacenamiento: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      fechaVencimiento: ['', Validators.required],
      estado: ['', Validators.required],
      inventarioInicial: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      imagenes: [''],
      proveedor: ['', Validators.required]
    });
  }

  abrirModalProducto() {
    // Asegurar que tenemos los proveedores cargados
    if (this.proveedores.length === 0 && !this.cargandoProveedores) {
      this.cargarProveedores();
    }
    
    this.inicializarFormulario();
    this.imagenSeleccionada = [];
    this.errorImagen = null;
    this.modalProducto.open();
  }

  /**
   * Maneja la selección de imágenes
   * @param event Evento de cambio del input file
   */
  onImagenSeleccionada(event: any): void {
    this.errorImagen = null;
    const files = event.target.files;
    
    if (files && files.length > 0) {
      // Validar cada archivo seleccionado
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validar formato
        if (!this.formatosPermitidos.includes(file.type)) {
          this.errorImagen = this.translate.instant('txt_formato_imagen_no_valido');
          this.limpiarSeleccionImagen();
          return;
        }
        
        // Validar tamaño
        if (file.size > this.maxTamanioImagen) {
          this.errorImagen = this.translate.instant('txt_imagen_demasiado_grande');
          this.limpiarSeleccionImagen();
          return;
        }

        // Crear preview
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagenSeleccionada.push({
            archivo: file,
            url: e.target.result,
            tamanio: this.formatearTamanio(file.size)
          });
        };
        reader.readAsDataURL(file);
      }
      
      // Actualizar el valor del formulario (usar el primer archivo por ahora)
      this.formularioProducto.patchValue({
        imagenes: files[0]
      });
    }
  }

  /**
   * Elimina una imagen de la previsualización
   * @param index Índice de la imagen a eliminar
   */
  eliminarImagen(index: number): void {
    if (index >= 0 && index < this.imagenSeleccionada.length) {
      this.imagenSeleccionada.splice(index, 1);
      
      // Si no quedan imágenes, limpiar el campo del formulario
      if (this.imagenSeleccionada.length === 0) {
        this.formularioProducto.patchValue({
          imagenes: null
        });
      } else {
        // Actualizar con la primera imagen disponible
        this.formularioProducto.patchValue({
          imagenes: this.imagenSeleccionada[0].archivo
        });
      }
    }
  }

  /**
   * Limpia la selección de imágenes
   */
  limpiarSeleccionImagen(): void {
    this.imagenSeleccionada = [];
    this.formularioProducto.patchValue({
      imagenes: null
    });
    
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
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

  guardarProducto() {
    if (this.formularioProducto.invalid) {
      Object.keys(this.formularioProducto.controls).forEach(key => {
        const control = this.formularioProducto.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.cargando = true;

    // Preparar los datos del producto, incluyendo las imágenes
    const datosProducto = {...this.formularioProducto.value};
    
    // Si hay imágenes seleccionadas, convertirlas a formato adecuado
    if (this.imagenSeleccionada.length > 0) {
      datosProducto.imagenes = this.imagenSeleccionada.map(img => img.archivo);
    }

    this.productosService.registrarProducto(datosProducto)
      .subscribe({
        next: (respuesta) => {
          if (respuesta && respuesta.error) {
            this.cargando = false;
            this.showMessage(
              respuesta.error || this.translate.instant('msg_producto_ya_existe'),
              'error'
            );
          } else {
            this.cargando = false;
            this.showMessage(
              this.translate.instant('txt_producto_registrado_exitosamente'),
              'success'
            );
            this.modalProducto.close();
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
            // Error de conflicto (producto ya existe)
            errorMsg = this.translate.instant('msg_producto_ya_existe');
          } else if (error.status === 413) {
            // Payload muy grande
            errorMsg = this.translate.instant('msg_archivo_muy_grande');
          } else if (error.status === 403) {
            // Error de permisos
            errorMsg = this.translate.instant('msg_no_tiene_permisos');
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