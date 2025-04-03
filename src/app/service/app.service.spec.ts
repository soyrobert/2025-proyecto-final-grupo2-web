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
  
});