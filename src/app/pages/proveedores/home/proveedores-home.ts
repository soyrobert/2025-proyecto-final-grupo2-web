import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IconPlusComponent } from 'src/app/shared/icon/icon-plus';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ProveedoresService } from '../../../services/proveedores/proveedores.service';
import Swal from 'sweetalert2';

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
export class ProveedoresHome {
  @ViewChild('modalProveedor') modalProveedor!: ModalComponent;
  formularioProveedor!: FormGroup;
  cargando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private proveedoresService: ProveedoresService
  ) {
    this.inicializarFormulario();
  }

  inicializarFormulario() {
    this.formularioProveedor = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      numeroContacto: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      pais: ['', Validators.required],
      caracteristicas: ['', Validators.required],
      condiciones: ['', Validators.required],
    });
  }

  abrirModalProveedor() {
    this.inicializarFormulario();
    this.modalProveedor.open();
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