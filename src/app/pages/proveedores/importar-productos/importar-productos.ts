import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IconPlusComponent } from 'src/app/shared/icon/icon-plus';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ProductosService } from '../../../services/proveedores/productos.service';
import { ProveedoresService } from '../../../services/proveedores/proveedores.service';
import { StorageService } from '../../../services/storage/storage.service';
import Swal from 'sweetalert2';

interface Proveedor {
  id: number;
  nombre: string;
  [key: string]: any;
}

interface ImagenPreview {
  archivo: File;
  url: string; // URL imagen previsualización local
  tamanio: string;
  publicUrl?: string; // URL en Cloud Storage
  uploading?: boolean; // Estado de subida
  uploadProgress?: number; // Progreso de subida (0-100)
  uploadError?: string; // Error si ocurre
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
    private proveedoresService: ProveedoresService,
    private storageService: StorageService
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
          const nuevaImagen: ImagenPreview = {
            archivo: file,
            url: e.target.result,
            tamanio: this.formatearTamanio(file.size),
            uploading: true,
            uploadProgress: 0
          };
          
          this.imagenSeleccionada.push(nuevaImagen);
          const index = this.imagenSeleccionada.length - 1;
          
          // Iniciar la subida a Cloud Storage
          this.subirImagenACloudStorage(file, index);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  /**
   * Sube una imagen a Cloud Storage y almacena solo la URL base
   * @param file Archivo de imagen
   * @param index Índice en el array de imágenes
   */
  subirImagenACloudStorage(file: File, index: number): void {
    console.log(`Iniciando subida de imagen ${index + 1}: ${file.name}`);
    
    this.storageService.uploadFile(file).subscribe({
      next: (publicUrl) => {
        console.log(`Imagen ${index + 1} subida exitosamente a: ${publicUrl}`);
        
        // Extraer solo la URL base sin los parámetros de query
        const urlBase = publicUrl.split('?')[0];
        console.log(`URL base para almacenamiento: ${urlBase}`);
        
        // Actualizar la imagen con la URL pública
        if (index < this.imagenSeleccionada.length) {
          this.imagenSeleccionada[index].publicUrl = urlBase; // Guardar solo la URL base
          this.imagenSeleccionada[index].uploading = false;
          this.imagenSeleccionada[index].uploadProgress = 100;
        }
      },
      error: (error) => {
        console.error(`Error al subir imagen ${index + 1}:`, error);
        
        if (index < this.imagenSeleccionada.length) {
          this.imagenSeleccionada[index].uploading = false;
          this.imagenSeleccionada[index].uploadError = this.translate.instant('txt_error_subir_imagen');
        }
        
        this.errorImagen = this.translate.instant('txt_error_subir_imagen');
      }
    });
  }

  /**
   * Elimina una imagen de la previsualización
   * @param index Índice de la imagen a eliminar
   */
  eliminarImagen(index: number): void {
    if (index >= 0 && index < this.imagenSeleccionada.length) {
      // No permitir eliminar si la imagen se está subiendo
      if (this.imagenSeleccionada[index].uploading) {
        this.showMessage(
          this.translate.instant('txt_no_puede_eliminar_imagen_subiendo'),
          'warning'
        );
        return;
      }
      
      this.imagenSeleccionada.splice(index, 1);
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

  /**
   * Guarda el producto con las URLs de las imágenes
   */
  guardarProducto() {
    if (this.formularioProducto.invalid) {
      Object.keys(this.formularioProducto.controls).forEach(key => {
        const control = this.formularioProducto.get(key);
        control?.markAsTouched();
      });
      return;
    }
  
    // Verificar si hay imágenes aún subiéndose
    const imagenesSubiendo = this.imagenSeleccionada.some(img => img.uploading);
    if (imagenesSubiendo) {
      this.showMessage(
        this.translate.instant('txt_esperar_subida_imagenes'),
        'warning'
      );
      return;
    }
  
    this.cargando = true;
  
    // Preparar los datos del producto
    const datosProducto = {...this.formularioProducto.value};
    
    if (this.imagenSeleccionada.length > 0) {
      // Filtrar solo las imágenes que se subieron exitosamente
      const imagenesValidas = this.imagenSeleccionada
        .filter(img => img.publicUrl && !img.uploading && !img.uploadError)
        .map(img => img.publicUrl);
      
      datosProducto.imagenes_productos = imagenesValidas;
      
      if (datosProducto.imagenes) {
        delete datosProducto.imagenes;
      }
    } else {
      // Si no hay imágenes, enviar un array vacío
      datosProducto.imagenes_productos = [];
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
          
          let errorMsg = this.translate.instant('txt_error_desconocido');
          
          if (error.status === 400 && error.error.detalles) {
            errorMsg = Object.values(error.error.detalles).join(', ');
          } else if (error.status === 409) {
            errorMsg = this.translate.instant('msg_producto_ya_existe');
          } else if (error.status === 413) {
            errorMsg = this.translate.instant('msg_archivo_muy_grande');
          } else if (error.status === 403) {
            errorMsg = this.translate.instant('msg_no_tiene_permisos');
          } else if (error.status === 0) {
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