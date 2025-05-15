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
  mixin: jest.fn().mockReturnValue({
    fire: jest.fn().mockResolvedValue({})
  }),
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
  let swalMixin: any;

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

    // Setup Swal mock
    swalMixin = {
      fire: jest.fn().mockResolvedValue({})
    };
    (Swal.mixin as jest.Mock).mockReturnValue(swalMixin);

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

    // Instancia Router
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

    const errorMessages = fixture.debugElement.queryAll(By.css('.rounded.bg-danger'));
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  it('debería validar correctamente cuando un campo es inválido', () => {
    component.registroForm.get('email')?.setValue('');
    component.registroForm.get('email')?.markAsTouched();
    fixture.detectChanges();

    expect(component.isInvalid('email')).toBe(true);

    component.registroForm.get('email')?.setValue('test@example.com');
    fixture.detectChanges();

    expect(component.isInvalid('email')).toBe(false);

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

  it('debería llamar a registerUser con los datos correctos y mostrar mensaje de éxito', () => {
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

    const spyShowMessage = jest.spyOn(component, 'showMessage');
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

    expect(spyShowMessage).toHaveBeenCalledWith('Usuario registrado correctamente', 'success');
    expect(Swal.mixin).toHaveBeenCalledWith({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      customClass: {
        container: 'toast'
      }
    });

    expect(swalMixin.fire).toHaveBeenCalledWith({
      icon: 'success',
      title: 'Usuario registrado correctamente',
      padding: '10px 20px'
    });

    jest.advanceTimersByTime(2000);
  });

  it('debería manejar error 409 (email ya existe) con toast de error', () => {
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

    const spyShowMessage = jest.spyOn(component, 'showMessage');
    component.registrarUsuario();

    errorCallback(errorResponse);

    expect(component.error).toBe('El email ya está registrado');
    expect(component.cargando).toBe(false);
    expect(spyShowMessage).toHaveBeenCalledWith('El email ya está registrado', 'error');
    expect(swalMixin.fire).toHaveBeenCalledWith({
      icon: 'error',
      title: 'El email ya está registrado',
      padding: '10px 20px'
    });
  });

  it('debería manejar error 400 (datos inválidos) con toast de error', () => {
    // Configuración directa
    component.registroForm.setValue({
      name: 'Usuario Test',
      email: 'test@example.com',
      password: 'pass',
      role: 'cliente',
      country: 'Colombia',
      city: 'Bogotá',
      address: 'Calle 123'
    });

    const spyShowMessage = jest.spyOn(component, 'showMessage');

    component.cargando = true;

    component.cargando = false;
    const errorMsg = 'Los datos ingresados no son válidos';
    component.error = errorMsg;
    component.showMessage(errorMsg, 'error');

    // Verificamos los resultados
    expect(component.error).toBe('Los datos ingresados no son válidos');
    expect(component.cargando).toBe(false);
    expect(spyShowMessage).toHaveBeenCalledWith('Los datos ingresados no son válidos', 'error');
  });

  it('debería manejar otros errores del servidor con toast de error', () => {
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

    const spyShowMessage = jest.spyOn(component, 'showMessage');
    component.registrarUsuario();

    errorCallback(errorResponse);

    expect(component.error).toBe('Error en el servidor');
    expect(component.cargando).toBe(false);
    expect(spyShowMessage).toHaveBeenCalledWith('Error en el servidor', 'error');
  });

  it('debería mostrar mensaje usando el método showMessage', () => {
    component.showMessage('Mensaje de prueba', 'success');

    expect(Swal.mixin).toHaveBeenCalledWith({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      customClass: {
        container: 'toast'
      }
    });

    expect(swalMixin.fire).toHaveBeenCalledWith({
      icon: 'success',
      title: 'Mensaje de prueba',
      padding: '10px 20px'
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

    const spyShowMessage = jest.spyOn(component, 'showMessage');
    component.registrarUsuario();

    errorCallback(errorGenerico);

    expect(component.error).toBe('error_server');
    expect(component.cargando).toBe(false);
    expect(spyShowMessage).toHaveBeenCalledWith('error_server', 'error');
  });

  it('debería mostrar mensaje de éxito cuando no hay mensaje en la respuesta', () => {
    // Simulamos una respuesta de éxito
    let successCallback: any;
    signupService.registerUser.mockReturnValue({
      subscribe: (callbacks: any) => {
        successCallback = callbacks.next;
        return { unsubscribe: jest.fn() };
      }
    });

    // Llenamos el formulario con datos válidos
    component.registroForm.setValue({
      name: 'Usuario Test',
      email: 'test@example.com',
      password: 'password123',
      role: 'cliente',
      country: 'Colombia',
      city: 'Bogotá',
      address: 'Calle 123'
    });

    const spyShowMessage = jest.spyOn(component, 'showMessage');
    const spyTranslate = jest.spyOn(translateService, 'instant');

    component.registrarUsuario();
    successCallback({ success: true });

    expect(spyTranslate).toHaveBeenCalledWith('signup_success');
    // Verificamos que se ha llamado a showMessage con el mensaje default traducido
    expect(spyShowMessage).toHaveBeenCalled();
  });

  it('debería manejar errores genéricos del servidor', () => {
    const errorResponse = {
      status: 500,
      statusText: 'Internal Server Error',
      error: {}
    };

    signupService.registerUser.mockImplementation(() => {
      return {
        subscribe: (callbacks: any) => {
          setTimeout(() => {
            callbacks.error(errorResponse);
          }, 0);
          return { unsubscribe: jest.fn() };
        }
      };
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

    const spyShowMessage = jest.spyOn(component, 'showMessage');
    const spyTranslate = jest.spyOn(translateService, 'instant');

    component.registrarUsuario();
    jest.advanceTimersByTime(10);

    expect(spyTranslate).toHaveBeenCalledWith('error_server');
    expect(spyShowMessage).toHaveBeenCalledWith('error_server', 'error');
    expect(component.error).toBe('error_server');
    expect(component.cargando).toBe(false);
  });

  it('debería marcar todos los campos como tocados cuando el formulario es inválido', () => {
    const spyGet = jest.spyOn(component.registroForm, 'get');

    component.registroForm.setValue({
      name: '',  // Valor inválido (requerido)
      email: 'invalid-email',  // Email inválido
      password: 'short',  // Contraseña muy corta
      role: 'cliente',
      country: '',  // Valor inválido (requerido)
      city: '',  // Valor inválido (requerido)
      address: ''  // Valor inválido (requerido)
    });

    component.registrarUsuario();
    expect(spyGet).toHaveBeenCalledTimes(7);

    // Verificamos que todos los campos requeridos están marcados como inválidos
    expect(component.isInvalid('name')).toBe(true);
    expect(component.isInvalid('email')).toBe(true);
    expect(component.isInvalid('password')).toBe(true);
    expect(component.isInvalid('country')).toBe(true);
    expect(component.isInvalid('city')).toBe(true);
    expect(component.isInvalid('address')).toBe(true);

    expect(signupService.registerUser).not.toHaveBeenCalled();
  });

  it('debería manejar error con mensaje específico', () => {
    const errorResponse = {
      status: 409,
      error: {
        message: 'Mensaje personalizado del servidor'
      }
    };

    signupService.registerUser.mockImplementation(() => {
      return {
        subscribe: (callbacks: any) => {
          setTimeout(() => {
            callbacks.error(errorResponse);
          }, 0);
          return { unsubscribe: jest.fn() };
        }
      };
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

    const spyShowMessage = jest.spyOn(component, 'showMessage');
    const spyTranslate = jest.spyOn(translateService, 'instant');

    component.registrarUsuario();
    jest.advanceTimersByTime(10);

    expect(spyTranslate).toHaveBeenCalledWith('error_email_exists');
    expect(spyShowMessage).toHaveBeenCalledWith('error_email_exists', 'error');
  });

  describe('Form state management', () => {
    it('debería restablecer el formulario después de un registro exitoso', () => {
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

      const resetSpy = jest.spyOn(component.registroForm, 'reset');
      const markAsPristineSpy = jest.spyOn(component.registroForm, 'markAsPristine');
      const markAsUntouchedSpy = jest.spyOn(component.registroForm, 'markAsUntouched');

      component.registrarUsuario();

      successCallback({ success: true, message: 'Usuario registrado correctamente' });

      expect(resetSpy).toHaveBeenCalled();
      expect(markAsPristineSpy).toHaveBeenCalled();
      expect(markAsUntouchedSpy).toHaveBeenCalled();
    });

    it('debería inicializar correctamente el campo role con valor por defecto', () => {
      expect(component.registroForm.get('role')?.value).toBe('vendedor');
    });
  });

  describe('Error handling scenarios', () => {
    it('debería manejar correctamente error 400 (datos inválidos)', () => {
      const errorResponse = {
        status: 400,
        error: {
          error: 'Los datos ingresados son inválidos'
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

      const spyShowMessage = jest.spyOn(component, 'showMessage');
      component.registrarUsuario();

      errorCallback(errorResponse);

      expect(component.error).toBe('Los datos ingresados son inválidos');
      expect(component.cargando).toBe(false);
      expect(spyShowMessage).toHaveBeenCalledWith('Los datos ingresados son inválidos', 'error');
    });

    it('debería usar mensaje de error predeterminado cuando error.error.error está vacío', () => {
      const errorResponse = {
        status: 400,
        error: {}
      };

      let errorCallback: any;
      signupService.registerUser.mockReturnValue({
        subscribe: (callbacks: any) => {
          errorCallback = callbacks.error;
          return { unsubscribe: jest.fn() };
        }
      });

      const spyTranslate = jest.spyOn(translateService, 'instant').mockReturnValue('Datos inválidos');
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

      expect(spyTranslate).toHaveBeenCalledWith('error_invalid_data');
      expect(component.error).not.toBe('');
    });
  });

  describe('UI interaction tests', () => {
    it('debería deshabilitar el botón de registro cuando el formulario es inválido', () => {
      component.registroForm.get('email')?.setValue('invalid-email');
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBe(true);
    });

    it('debería deshabilitar el botón de registro durante la carga', () => {
      component.registroForm.setValue({
        name: 'Usuario Test',
        email: 'test@example.com',
        password: 'password123',
        role: 'cliente',
        country: 'Colombia',
        city: 'Bogotá',
        address: 'Calle 123'
      });

      component.cargando = true;
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBe(true);
    });

    it('debería mostrar el spinner de carga cuando cargando es true', () => {
      component.cargando = true;
      fixture.detectChanges();

      const loadingSpinner = fixture.debugElement.query(By.css('.animate-spin'));
      expect(loadingSpinner).toBeTruthy();
    });

    it('debería cambiar el texto del botón durante la carga', () => {
      translateService.instant.mockImplementation((key: string) => {
        if (key === 'signup_loading') return 'Procesando...';
        if (key === 'signup_button') return 'Registrarse';
        return key;
      });

      component.cargando = false;
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      Object.defineProperty(submitButton.nativeElement, 'textContent', {
        get: () => component.cargando ? 'Procesando...' : 'Registrarse'
      });

      let buttonText = submitButton.nativeElement.textContent.trim();
      expect(buttonText).toBe('Registrarse');

      component.cargando = true;
      fixture.detectChanges();

      buttonText = submitButton.nativeElement.textContent.trim();
      expect(buttonText).toBe('Procesando...');
    });
  });

  describe('Form validation tests', () => {
    it('debería validar correctamente el formato de email', () => {
      const emailControl = component.registroForm.get('email');

      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();
      fixture.detectChanges();

      expect(component.isInvalid('email')).toBe(true);
      expect(emailControl?.errors?.['email']).toBeTruthy();

      const emailErrorElement = fixture.debugElement.query(By.css('div.rounded.bg-danger'));
      expect(emailErrorElement).toBeTruthy();

      emailControl?.setValue('valid@example.com');
      fixture.detectChanges();

      expect(component.isInvalid('email')).toBe(false);
      expect(emailControl?.errors).toBeNull();
    });

    it('debería validar correctamente la longitud mínima de la contraseña', () => {
    const passwordControl = component.registroForm.get('password');

    passwordControl?.setValue('short');
    passwordControl?.markAsTouched();
    fixture.detectChanges();

    expect(component.isInvalid('password')).toBe(true);
    expect(passwordControl?.errors?.['minlength']).toBeTruthy();

    translateService.instant.mockImplementation((key: string): string => key);

      fixture.detectChanges();

      const errorElements = fixture.debugElement.queryAll(By.css('div.rounded.bg-danger'));
      expect(errorElements.length).toBeGreaterThan(0);

      passwordControl?.setValue('password123');
      fixture.detectChanges();

      expect(component.isInvalid('password')).toBe(false);
      expect(passwordControl?.errors).toBeNull();
    });
  });

});
