import { TestBed } from '@angular/core/testing';
import { AppService } from './app.service';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { $themeConfig } from '../theme.config';

describe('AppService', () => {
  let service: AppService;
  let translateService: any;
  let store: any;
  let mockDocument: any;
  let mockClassList: any;
  
  const originalThemeConfig = { ...$themeConfig };

  beforeEach(() => {
    mockClassList = {
      add: jest.fn(),
      remove: jest.fn()
    };
    
    mockDocument = {
      querySelector: jest.fn().mockReturnValue({
        classList: mockClassList
      })
    };
    
    window.document.querySelector = mockDocument.querySelector;
    
    // Mock de localStorage
    const localStorageMock = {
      getItem: jest.fn().mockImplementation((key) => {
        const storage: Record<string, string> = {
          'theme': 'dark',
          'menu': 'vertical',
          'i18n_locale': 'es'
        };
        return storage[key] || null;
      }),
      setItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Mock store
    store = {
      select: jest.fn().mockReturnValue(of({
        languageList: [
          { code: 'en', name: 'English' },
          { code: 'es', name: 'Spanish' },
        ],
        animation: 'animate__fadeIn'
      })),
      dispatch: jest.fn()
    };
    
    // Mock translateService
    translateService = {
      use: jest.fn(),
      currentLang: 'en'
    };
    
    TestBed.configureTestingModule({
      providers: [
        AppService,
        { provide: TranslateService, useValue: translateService },
        { provide: Store, useValue: store }
      ]
    });
    
    service = TestBed.inject(AppService);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  it('Debe inicializar y aplicar los estilos predeterminados', () => {
    expect(store.select).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'toggleTheme', payload: 'dark' });
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'toggleMenu', payload: 'vertical' });
  });

  it('Debería alternar el idioma correctamente', () => {
    const languageItem = { code: 'es', name: 'Spanish' };
    const result = service.toggleLanguage(languageItem);
    
    expect(translateService.use).toHaveBeenCalledWith('es');
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'toggleLocale', payload: 'es' });
    expect(result).toEqual(languageItem);
  });

  it('Debería alternar el idioma con el predeterminado', () => {
    const result = service.toggleLanguage(null);
    
    expect(translateService.use).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalled();
    expect(result).toBeTruthy();
  });

  it('Deberían agregarse clases de animación', () => {
    service.changeAnimation('add');
    
    expect(mockDocument.querySelector).toHaveBeenCalledWith('.animation');
    expect(mockClassList.add).toHaveBeenCalledWith('animate__animated');
    expect(mockClassList.add).toHaveBeenCalledWith('animate__fadeIn');
  });

  it('Deberia remover las clases de animación ', () => {
    service.changeAnimation('remove');
    
    expect(mockDocument.querySelector).toHaveBeenCalledWith('.animation');
    expect(mockClassList.remove).toHaveBeenCalledWith('animate__animated');
    expect(mockClassList.remove).toHaveBeenCalledWith('animate__fadeIn');
  });

  it('Debe usar valores de configuración cuando localStorage esté vacío', () => {
    jest.spyOn(window.localStorage, 'getItem').mockImplementation(() => null);
    
    service.initStoreData();
    
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'toggleTheme', payload: $themeConfig.theme });
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'toggleMenu', payload: $themeConfig.menu });
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'toggleLayout', payload: $themeConfig.layout });
  });

  it('debería suscribirse correctamente al store', () => {
    const mockStoreData = {
      languageList: [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
      ],
      animation: 'animate__fadeIn'
    };
    
    store.select.mockReturnValue(of(mockStoreData));
    service.initStoreData();
    expect(service.storeData).toEqual(mockStoreData);
  });

  it('debería manejar correctamente la ausencia del elemento de animación', () => {
    window.document.querySelector = jest.fn().mockReturnValue(null);
    
    service.changeAnimation('add');
    service.changeAnimation('remove');

    expect(window.document.querySelector).toHaveBeenCalledWith('.animation');
  });

  it('debería manejar correctamente cuando no hay animación definida', () => {
    service.storeData = { animation: undefined };
    service.changeAnimation();
    expect(window.document.querySelector).not.toHaveBeenCalled();
  });

  it('debería obtener correctamente los valores de localStorage', () => {
    const localStorageSpy = jest.spyOn(window.localStorage, 'getItem');
    
    service.initStoreData();
    
    expect(localStorageSpy).toHaveBeenCalledWith('theme');
    expect(localStorageSpy).toHaveBeenCalledWith('menu');
    expect(localStorageSpy).toHaveBeenCalledWith('layout');
    expect(localStorageSpy).toHaveBeenCalledWith('i18n_locale');
    expect(localStorageSpy).toHaveBeenCalledWith('rtlClass');
    expect(localStorageSpy).toHaveBeenCalledWith('animation');
    expect(localStorageSpy).toHaveBeenCalledWith('navbar');
    expect(localStorageSpy).toHaveBeenCalledWith('semidark');
  });

  it('debería manejar el caso de no tener animación definida', () => {
    service.storeData = { animation: null };
    const querySpy = jest.spyOn(document, 'querySelector');
    
    service.changeAnimation();

    expect(querySpy).not.toHaveBeenCalled();
  });

  it('debería manejar correctamente la ausencia del elemento de animación', () => {
    window.document.querySelector = jest.fn().mockReturnValue(null);
    
    expect(() => {
      service.changeAnimation('add');
      service.changeAnimation('remove');
    }).not.toThrow();
    
    expect(window.document.querySelector).toHaveBeenCalledWith('.animation');
  });

  it('debería leer todos los valores necesarios de localStorage', () => {
    const localStorageSpy = jest.spyOn(localStorage, 'getItem');
    
    service.initStoreData();
    
    expect(localStorageSpy).toHaveBeenCalledWith('theme');
    expect(localStorageSpy).toHaveBeenCalledWith('menu');
    expect(localStorageSpy).toHaveBeenCalledWith('layout');
    expect(localStorageSpy).toHaveBeenCalledWith('i18n_locale');
    expect(localStorageSpy).toHaveBeenCalledWith('rtlClass');
    expect(localStorageSpy).toHaveBeenCalledWith('animation');
    expect(localStorageSpy).toHaveBeenCalledWith('navbar');
    expect(localStorageSpy).toHaveBeenCalledWith('semidark');
  });

  it('debería manejar el caso cuando storeData.animation es falsy', () => {
    service.storeData = { animation: null };
    const querySpy = jest.spyOn(document, 'querySelector');
    
    service.changeAnimation();

    expect(querySpy).not.toHaveBeenCalled();
  });

  it('debería manejar el caso cuando no hay idioma en el almacenamiento local ni configurado', () => {
    translateService.currentLang = null;

    service.storeData = {
      languageList: [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
      ]
    };
    const result = service.toggleLanguage(null);

    expect(translateService.use).toHaveBeenCalledWith('es');
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'toggleLocale', payload: 'es' });
  });

  
});