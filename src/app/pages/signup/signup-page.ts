import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SignupService, SignupRequest } from '../../services/vendedores/signup.service';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-signup-page',
  templateUrl: './signup-page.html',
  styleUrls: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule
  ]
})
export class SignupVendedores implements OnInit {
  registroForm!: FormGroup;
  cargando = false;
  error = '';
  showPassword = false;
  paises = [
    'Argentina',
    'Bolivia',
    'Brasil',
    'Chile',
    'Colombia',
    'Costa Rica',
    'Cuba',
    'Ecuador',
    'El Salvador',
    'Guatemala',
    'Honduras',
    'México',
    'Nicaragua',
    'Panamá',
    'Paraguay',
    'Perú',
    'Puerto Rico',
    'República Dominicana',
    'Uruguay',
    'Venezuela',
    'España',
    'Estados Unidos'
  ];

  constructor(
    private fb: FormBuilder,
    private signupService: SignupService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  inicializarFormulario(): void {
    this.registroForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['vendedor'],
      country: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required],
    });
  }

  registrarUsuario(): void {
    if (this.registroForm.invalid) {
      Object.keys(this.registroForm.controls).forEach(key => {
        this.registroForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.cargando = true;
    this.error = '';

    // Preparar los datos para enviar al backend
    const datosRegistro: SignupRequest = {
      ...this.registroForm.value
    };

    this.signupService.registerUser(datosRegistro)
      .subscribe({
        next: (respuesta) => {
          this.cargando = false;
          
          // Mostrar mensaje de éxito
          this.showMessage(
            respuesta.message || this.translate.instant('signup_success'),
            'success'
          );
          
        },
        error: (error) => {
          this.cargando = false;
          
          // Manejar diferentes tipos de errores
          let errorMessage = '';
          if (error.status === 409) {
            // Email ya registrado
            errorMessage = error.error?.error || this.translate.instant('error_email_exists');
          } else if (error.status === 400) {
            // Error de validación
            errorMessage = error.error?.error || this.translate.instant('error_invalid_data');
          } else {
            // Otros errores
            errorMessage = error.error?.error || this.translate.instant('error_server');
          }
          
          // Mostrar mensaje de error
          this.showMessage(errorMessage, 'error');
          this.error = errorMessage;
        }
      });
  }

  isInvalid(controlName: string): boolean {
    const control = this.registroForm.get(controlName);
    return (control?.invalid && control?.touched) || false;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
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