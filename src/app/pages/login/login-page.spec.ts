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
  

});