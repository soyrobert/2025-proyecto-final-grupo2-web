import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IconPlusComponent } from 'src/app/shared/icon/icon-plus';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ProductosService } from '../../../services/proveedores/productos.service';
import Swal from 'sweetalert2';

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
export class ImportarProductos {
  @ViewChild('modalProducto') modalProducto!: ModalComponent;
  formularioProducto!: FormGroup;
  cargando: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private productosService: ProductosService
  ) {
    this.inicializarFormulario();
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
    this.inicializarFormulario();
    this.modalProducto.open();
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

    this.productosService.registrarProducto(this.formularioProducto.value)
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