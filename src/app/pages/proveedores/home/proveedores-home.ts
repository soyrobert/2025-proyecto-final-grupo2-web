import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IconPlusComponent } from 'src/app/shared/icon/icon-plus';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ProveedoresService } from '../../../services/proveedores/proveedores.service';

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
  error: string = '';

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
    this.error = '';
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
    this.error = '';

    this.proveedoresService.registrarProveedor(this.formularioProveedor.value)
      .subscribe({
        next: (respuesta) => {
          console.log('Proveedor registrado exitosamente:', respuesta);
          this.cargando = false;
          alert(this.translate.instant('txt_proveedor_registrado_exitosamente'));
          this.modalProveedor.close();
        },
        error: (error) => {
          console.error('Error al registrar proveedor:', error);
          this.cargando = false;
          
          // Manejar errores
          if (error.status === 400 && error.error.detalles) {
            // Error de validación
            this.error = Object.values(error.error.detalles).join(', ');
          } else if (error.status === 409) {
            // Error si ya existe
            this.error = error.error.detalles || error.error.error;
          } else if (error.status === 403) {
            // Error de permisos
            this.error = this.translate.instant('txt_no_tiene_permisos');
          } else if (error.status === 0) {
            // Error de conexión
            this.error = this.translate.instant('txt_error_de_conexion');
          } else {
            // Otros errores
            this.error = error.error?.message || this.translate.instant('txt_error_desconocido');
          }
        }
      });
  }
}