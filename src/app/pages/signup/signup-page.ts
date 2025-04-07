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
      role: ['cliente'], // Valor por defecto
      country: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required],
    });
  }

  registrarUsuario(): void {
    if (this.registroForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
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
          this.showSuccessMessage(respuesta.message || this.translate.instant('signup_success'));
          
        },
        error: (error) => {
          this.cargando = false;
          
          // Manejar diferentes tipos de errores
          if (error.status === 409) {
            // Email ya registrado
            this.error = error.error?.error || this.translate.instant('error_email_exists');
          } else if (error.status === 400) {
            // Error de validación
            this.error = error.error?.error || this.translate.instant('error_invalid_data');
          } else {
            // Otros errores
            this.error = error.error?.error || this.translate.instant('error_server');
          }
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

  showSuccessMessage(message: string): void {
    Swal.fire({
      title: this.translate.instant('signup_success_title'),
      text: message,
      icon: 'success',
      confirmButtonText: this.translate.instant('ok'),
      confirmButtonColor: '#4361ee'
    });
  }
}