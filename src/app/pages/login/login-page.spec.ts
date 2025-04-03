import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login-page';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import { TranslateService, TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { AppService } from 'src/app/service/app.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MenuModule } from 'headlessui-angular';
import { By } from '@angular/platform-browser';
import { IconCaretDownComponent } from 'src/app/shared/icon/icon-caret-down';
import { IconMailComponent } from 'src/app/shared/icon/icon-mail';
import { IconLockDotsComponent } from 'src/app/shared/icon/icon-lock-dots';

// Simulamos TranslateLoader
class FakeTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of({
      'login': 'Login',
      'txt_ingrese_contraseña': 'Ingrese su contraseña',
      'email': 'Email',
      'plh_ingrese_correo': 'Ingrese su correo',
      'password': 'Contraseña',
      'plh_ingrese_contraseña': 'Ingrese su contraseña',
      'btn_iniciar_sesion': 'Iniciar sesión',
      'txt_no_tiene_cuenta': '¿No tiene cuenta?',
      'btn_registrarse': 'Registrarse',
      'txt_recordar_clave': 'Recordar contraseña',
      'derechos_reservados': 'Todos los derechos reservados'
    });
  }
}

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authService: { login: jest.Mock };
  let router: any;
  let store: any;
  let translateService: any;
  let appService: any;
  
  beforeEach(async () => {
    jest.useFakeTimers();
    
    // Mock services
    authService = {
      login: jest.fn()
    };
    
    router = {
      navigate: jest.fn()
    };
    
    store = {
      select: jest.fn().mockReturnValue(of({
        locale: 'en',
        languageList: [
          { code: 'en', name: 'English' },
          { code: 'es', name: 'Spanish' },
        ]
      })),
      dispatch: jest.fn()
    };
    
    translateService = {
      use: jest.fn(),
      get: jest.fn().mockReturnValue(of('')),
      getTranslation: jest.fn().mockReturnValue(of({})),
      instant: jest.fn(key => key),
      currentLang: 'en',
      onLangChange: of({}),
      onTranslationChange: of({}),
      onDefaultLangChange: of({})
    };
    
    appService = {
      toggleLanguage: jest.fn()
    };
    
    // Mock localStorage
    const originalGetItem = Storage.prototype.getItem;
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      if (key === 'userRole') return null;
      return originalGetItem.call(localStorage, key);
    });
    
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        MenuModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: FakeTranslateLoader
          }
        }),
        NoopAnimationsModule,
        RouterTestingModule,
        IconCaretDownComponent,
        IconMailComponent,
        IconLockDotsComponent,
        LoginPage
      ],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Store, useValue: store },
        { provide: TranslateService, useValue: translateService },
        { provide: AppService, useValue: appService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(LoginPage);
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

  it('Debe mostrar mensajes de validación cuando se envía un formulario con campos vacíos', () => {
    // Clic  en el botón de inicio de sesión
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
    submitButton.nativeElement.click();
    fixture.detectChanges();
    
    // Comprobar el estado de validación
    expect(component.emailTouched).toBe(true);
    expect(component.passwordTouched).toBe(true);
    
    // Obtener mensajes de error
    const errorMessages = fixture.debugElement.queryAll(By.css('.bg-danger'));
    expect(errorMessages.length).toBe(2);
    expect(errorMessages[0].nativeElement.textContent).toContain('Ingrese un email válido');
    expect(errorMessages[1].nativeElement.textContent).toContain('La contraseña es requerida');
  });

  it('Debe llamar a authService.login con las credenciales correctas', async () => {
    authService.login.mockResolvedValue(true);
    
    // Llenar el formulario
    component.email = 'test@example.com';
    component.password = 'password123';
    
    // Enviar el formulario
    await component.onSubmit();
    
    // Comprobar que el servicio de autenticación fue llamado
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('Debe navegar a la página de vendedores después de iniciar sesión correctamente como director de ventas', async () => {
    authService.login.mockResolvedValue(true);
    Storage.prototype.getItem = jest.fn().mockImplementation((key) => {
      return key === 'userRole' ? 'director-ventas' : null;
    });
    
    // Llenar el formulario
    component.email = 'director@example.com';
    component.password = 'password123';
    
    // Enviar el formulario
    await component.onSubmit();
    jest.runAllTimers();
    
    // Comprobar navegación
    expect(router.navigate).toHaveBeenCalledWith(['/vendedores']);
  });

  it('Debe navegar a la página de logística después de iniciar sesión correctamente como encargado de logistica', async () => {
    authService.login.mockResolvedValue(true);
    Storage.prototype.getItem = jest.fn().mockImplementation((key) => {
      return key === 'userRole' ? 'encargado-logistica' : null;
    });
    
    component.email = 'logistica@example.com';
    component.password = 'password123';
    
    await component.onSubmit();
    jest.runAllTimers();
    
    // Comprobar navegación
    expect(router.navigate).toHaveBeenCalledWith(['/logistica']);
  });

  it('Debe navegar a la página de proveedores después de iniciar sesión correctamente como director de compras.', async () => {
    authService.login.mockResolvedValue(true);
    Storage.prototype.getItem = jest.fn().mockImplementation((key) => {
      return key === 'userRole' ? 'director-compras' : null;
    });
    
    component.email = 'compras@example.com';
    component.password = 'password123';
    
    await component.onSubmit();
    jest.runAllTimers();
    
    // Comprobar navegación
    expect(router.navigate).toHaveBeenCalledWith(['/proveedores']);
  });
  

});