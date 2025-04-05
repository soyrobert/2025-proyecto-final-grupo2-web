import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IconPlusComponent } from 'src/app/shared/icon/icon-plus';
import { ModalComponent } from '../../../components/modal/modal.component';

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

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService
  ) {
    this.inicializarFormulario();
  }

  inicializarFormulario() {
    this.formularioProveedor = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      numeroContacto: ['', Validators.required],
      pais: ['', Validators.required],
      caracteristicas: [''],
      condiciones: ['']
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


    console.log('Datos del proveedor:', this.formularioProveedor.value);
    
    alert('Proveedor guardado exitosamente');
    
    this.modalProveedor.close();
  }
}