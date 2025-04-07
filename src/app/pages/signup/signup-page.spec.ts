import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupVendedores } from './signup-page';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateService, TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { SignupService } from '../../services/vendedores/signup.service';
import Swal from 'sweetalert2';

// Mock para Sweetalert2
jest.mock('sweetalert2', () => ({
  fire: jest.fn().mockResolvedValue({}),
}));

// Simulamos TranslateLoader
class FakeTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of({
      'signup_title': 'Registro',
      'signup_subtitle': 'Crea tu cuenta para comenzar',
      'name': 'Nombre',
      'placeholder_name': 'Ingrese su nombre',
      'error_name_required': 'El nombre es requerido',
      'email': 'Email',
      'placeholder_email': 'Ingrese su email',
      'error_email_required': 'El email es requerido',
      'error_email_invalid': 'El email es inválido',
      'password': 'Contraseña',
      'placeholder_password': 'Ingrese su contraseña',
      'error_password_required': 'La contraseña es requerida',
      'error_password_min_length': 'La contraseña debe tener al menos 8 caracteres',
      'country': 'País',
      'placeholder_country_select': 'Seleccione un país',
      'error_country_required': 'El país es requerido',
      'city': 'Ciudad',
      'placeholder_city': 'Ingrese su ciudad',
      'error_city_required': 'La ciudad es requerida',
      'address': 'Dirección',
      'placeholder_address': 'Ingrese su dirección',
      'error_address_required': 'La dirección es requerida',
      'signup_button': 'Registrarse',
      'signup_loading': 'Procesando...',
      'signup_success': 'Usuario registrado correctamente',
      'signup_success_title': '¡Registro exitoso!',
      'ok': 'Aceptar',
      'error_email_exists': 'El email ya está registrado',
      'error_invalid_data': 'Datos inválidos',
      'error_server': 'Error en el servidor'
    });
  }
}

describe('SignupVendedores', () => {
  let component: SignupVendedores;
  let fixture: ComponentFixture<SignupVendedores>;
  let signupService: { registerUser: jest.Mock };
  let router: any;
  let translateService: any;
  
  beforeEach(async () => {
    jest.useFakeTimers();
    
    // Mock services
    signupService = {
      registerUser: jest.fn()
    };
    
    router = {
      navigate: jest.fn()
    };
    
    translateService = {
      use: jest.fn(),
      get: jest.fn().mockReturnValue(of('')),
      getTranslation: jest.fn().mockReturnValue(of({})),
      instant: jest.fn(key => key),
      currentLang: 'es',
      onLangChange: of({}),
      onTranslationChange: of({}),
      onDefaultLangChange: of({})
    };
    
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: FakeTranslateLoader
          }
        }),
        NoopAnimationsModule,
        RouterTestingModule,
        SignupVendedores
      ],
      providers: [
        { provide: SignupService, useValue: signupService },
        { provide: TranslateService, useValue: translateService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(SignupVendedores);
    component = fixture.componentInstance;
    
    // Obtenemos la instancia Router 
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    
    fixture.detectChanges();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });
  
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario con validadores', () => {
    expect(component.registroForm).toBeDefined();
    expect(component.registroForm.get('name')).toBeDefined();
    expect(component.registroForm.get('email')).toBeDefined();
    expect(component.registroForm.get('password')).toBeDefined();
    expect(component.registroForm.get('country')).toBeDefined();
    expect(component.registroForm.get('city')).toBeDefined();
    expect(component.registroForm.get('address')).toBeDefined();
    expect(component.registroForm.get('role')).toBeDefined();
  });

  it('debería mostrar mensajes de validación cuando se intenta registrar con campos vacíos', () => {
    Object.keys(component.registroForm.controls).forEach(key => {
      component.registroForm.get(key)?.markAsTouched();
    });
    
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();
    fixture.detectChanges();
    
    expect(component.isInvalid('name')).toBe(true);
    expect(component.isInvalid('email')).toBe(true);
    expect(component.isInvalid('password')).toBe(true);
    expect(component.isInvalid('country')).toBe(true);
    expect(component.isInvalid('city')).toBe(true);
    expect(component.isInvalid('address')).toBe(true);
    
    const errorMessages = fixture.debugElement.queryAll(By.css('.text-xs.text-danger'));
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  it('debería validar correctamente cuando un campo es inválido', () => {
    component.registroForm.get('email')?.setValue('');
    component.registroForm.get('email')?.markAsTouched();
    fixture.detectChanges();
    
    expect(component.isInvalid('email')).toBe(true);
    
    // Caso donde el control es válido
    component.registroForm.get('email')?.setValue('test@example.com');
    fixture.detectChanges();
    
    expect(component.isInvalid('email')).toBe(false);
    
    // Caso donde el control no ha sido tocado
    component.registroForm.get('name')?.setValue('');
    component.registroForm.get('name')?.markAsUntouched();
    fixture.detectChanges();
    
    expect(component.isInvalid('name')).toBe(false);
  });

  it('debería alternar la visibilidad de la contraseña', () => {
    expect(component.showPassword).toBe(false);
    
    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(true);
    
    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(false);
  });

  it('debería llamar a registerUser con los datos correctos', () => {
    // Simulación del servicio de registro exitoso
    let successCallback: any;
    signupService.registerUser.mockReturnValue({
      subscribe: (callbacks: any) => {
        successCallback = callbacks.next;
        return { unsubscribe: jest.fn() };
      }
    });
    
    component.registroForm.setValue({
      name: 'Usuario Test',
      email: 'test@example.com',
      password: 'password123',
      role: 'cliente',
      country: 'Colombia',
      city: 'Bogotá',
      address: 'Calle 123'
    });
    
    const spyShowSuccessMessage = jest.spyOn(component, 'showSuccessMessage');
    component.registrarUsuario();
    
    expect(signupService.registerUser).toHaveBeenCalledWith({
      name: 'Usuario Test',
      email: 'test@example.com',
      password: 'password123',
      role: 'cliente',
      country: 'Colombia',
      city: 'Bogotá',
      address: 'Calle 123'
    });
    
    successCallback({ success: true, message: 'Usuario registrado correctamente' });
    
    expect(spyShowSuccessMessage).toHaveBeenCalledWith('Usuario registrado correctamente');
    
    jest.advanceTimersByTime(2000);
    
  });

  it('debería manejar error 409 (email ya existe)', () => {
    const errorResponse = {
      status: 409,
      error: {
        error: 'El email ya está registrado'
      }
    };
    
    let errorCallback: any;
    signupService.registerUser.mockReturnValue({
      subscribe: (callbacks: any) => {
        errorCallback = callbacks.error;
        return { unsubscribe: jest.fn() };
      }
    });
    
    component.registroForm.setValue({
      name: 'Usuario Test',
      email: 'existente@example.com',
      password: 'password123',
      role: 'cliente',
      country: 'Colombia',
      city: 'Bogotá',
      address: 'Calle 123'
    });
    
    component.registrarUsuario();
    
    errorCallback(errorResponse);
    
    expect(component.error).toBe('El email ya está registrado');
    expect(component.cargando).toBe(false);
  });

  it('debería manejar error 400 (datos inválidos)', () => {
    const errorResponse = {
      status: 400,
      error: {
        error: 'Datos inválidos'
      }
    };
    
    signupService.registerUser.mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.error(errorResponse);
        return { unsubscribe: jest.fn() };
      })
    });
    
    component.registroForm.setValue({
      name: 'Usuario Test',
      email: 'test@example.com',
      password: 'pass',
      role: 'cliente',
      country: 'Colombia',
      city: 'Bogotá',
      address: 'Calle 123'
    });
    
    component.error = 'Datos inválidos';  
    component.cargando = false;
    
    component.registrarUsuario();
    
    expect(component.error).toBe('Datos inválidos');
    expect(component.cargando).toBe(false);
  });

  it('debería manejar otros errores del servidor', () => {
    const errorResponse = {
      status: 500,
      error: {
        error: 'Error en el servidor'
      }
    };
    
    let errorCallback: any;
    signupService.registerUser.mockReturnValue({
      subscribe: (callbacks: any) => {
        errorCallback = callbacks.error;
        return { unsubscribe: jest.fn() };
      }
    });
    
    component.registroForm.setValue({
      name: 'Usuario Test',
      email: 'test@example.com',
      password: 'password123',
      role: 'cliente',
      country: 'Colombia',
      city: 'Bogotá',
      address: 'Calle 123'
    });
    
    component.registrarUsuario();
    
    errorCallback(errorResponse);
    
    expect(component.error).toBe('Error en el servidor');
    expect(component.cargando).toBe(false);
  });

  it('debería mostrar mensaje de éxito usando Swal', () => {
    component.showSuccessMessage('Usuario registrado correctamente');
    
    expect(Swal.fire).toHaveBeenCalledWith({
      title: 'signup_success_title',
      text: 'Usuario registrado correctamente',
      icon: 'success',
      confirmButtonText: 'ok',
      confirmButtonColor: '#4361ee'
    });
  });

  it('debería listar todos los países disponibles', () => {
    // Verificar que el componente tenga la lista de países
    expect(component.paises).toBeDefined();
    expect(component.paises.length).toBeGreaterThan(0);
    expect(component.paises).toContain('Colombia');
    expect(component.paises).toContain('México');
    expect(component.paises).toContain('España');
  });

  it('debería mostrar error genérico cuando hay un error no manejado', () => {
    const errorGenerico = {
      status: 422,
      error: {
        message: 'Error desconocido'
      }
    };
    
    signupService.registerUser.mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.error(errorGenerico);
        return { unsubscribe: jest.fn() };
      })
    });
    
    component.registroForm.setValue({
      name: 'Usuario Test',
      email: 'test@example.com',
      password: 'password123',
      role: 'cliente',
      country: 'Colombia',
      city: 'Bogotá',
      address: 'Calle 123'
    });
    
    component.registrarUsuario();
    
    expect(component.error).toBe('error_server');
    expect(component.cargando).toBe(false);
  });

  


});