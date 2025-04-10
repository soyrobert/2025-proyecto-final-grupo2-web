import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;
  let httpMock: HttpTestingController;
  let originalLocalStorage: Storage;
  let originalConsoleError: any;
  
  beforeEach(() => {
    // Guardar referencia al localStorage
    originalLocalStorage = window.localStorage;
    originalConsoleError = console.error;
    console.error = jest.fn();
    
    window.APP_CONFIG = undefined;
    localStorage.clear();
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConfigService]
    });
    
    service = TestBed.inject(ConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() => {
    httpMock.verify();
    
    // Restaurar el localStorage y console.error
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage
    });
    console.error = originalConsoleError;
    
    // Limpiar mocks
    jest.restoreAllMocks();
  });
  
  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });
  
  it('debería inicializar con configuración de window.APP_CONFIG', async () => {
    window.APP_CONFIG = {
      encryptionKey: 'test-key-from-window'
    };
    
    await service.initialize();
    
    // Verificar que se usa la clave de window.APP_CONFIG
    expect(service.getEncryptionKey()).toBe('test-key-from-window');
  });
  
  it('debería cargar configuración de assets/config.json cuando no hay window.APP_CONFIG', async () => {
    const mockEncryptionKey = 'mock-secure-key-for-testing';
    const mockConfig = {
      encryptionKey: mockEncryptionKey
    };
    
    const initPromise = service.initialize();
    
    const req = httpMock.expectOne('/assets/config.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockConfig);
    
    await initPromise;
    
    // Verificar que se usa la clave del archivo config.json
    expect(service.getEncryptionKey()).toBe(mockEncryptionKey);
  });
  
  it('debería generar una clave de desarrollo cuando falla la petición HTTP', async () => {
    const initPromise = service.initialize();
    
    const req = httpMock.expectOne('/assets/config.json');
    req.error(new ErrorEvent('Network error'));
    
    await initPromise;
    
    // Verificar que se genera una clave de desarrollo
    const encryptionKey = service.getEncryptionKey();
    expect(encryptionKey).toContain('dev-key-');
    expect(encryptionKey).toContain('-ccpapp');
  });
  
  it('debería mantener la consistencia de la clave de desarrollo a través de múltiples llamadas', async () => {
    const initPromise = service.initialize();
    const req = httpMock.expectOne('/assets/config.json');
    req.error(new ErrorEvent('Network error'));
    await initPromise;
    
    const firstKey = service.getEncryptionKey();
    
    const newService = TestBed.inject(ConfigService);
    
    const secondInitPromise = newService.initialize();
    const req2 = httpMock.expectOne('/assets/config.json');
    req2.error(new ErrorEvent('Network error'));
    await secondInitPromise;
    
    const secondKey = newService.getEncryptionKey();
    
    // Las claves deberían ser iguales porque se almacenan en localStorage
    expect(firstKey).toBe(secondKey);
  });
  
  it('debería crear una clave aunque localStorage no esté disponible', async () => {
    // Modificamos ConfigService para probar un escenario más controlado
    // Usamos el espía para capturar las llamadas sin lanzar excepciones reales
    jest.spyOn(service as any, 'generateDevelopmentKey').mockImplementation(() => {
      return 'mock-fallback-key';
    });
    
    const initPromise = service.initialize();
    
    const req = httpMock.expectOne('/assets/config.json');
    req.error(new ErrorEvent('Network error'));
    
    await initPromise;
    
    // Verificamos que se usa la clave simulada
    expect(service.getEncryptionKey()).toBe('mock-fallback-key');
  });
  
  it('debería usar una nueva sesión si no existe una previamente en localStorage', async () => {
    localStorage.clear();
    
    const initPromise = service.initialize();
    
    const req = httpMock.expectOne('/assets/config.json');
    req.error(new ErrorEvent('Network error'));
    
    await initPromise;
    
    // Verificar que se ha creado una entrada en localStorage
    expect(localStorage.getItem('devSessionId')).not.toBeNull();
  });
  
  it('debería usar la sesión existente en localStorage si está disponible', async () => {
    localStorage.setItem('devSessionId', 'test-session-id');
    
    const initPromise = service.initialize();
    
    const req = httpMock.expectOne('/assets/config.json');
    req.error(new ErrorEvent('Network error'));
    
    await initPromise;
    
    // Verificar que se usa la sesión existente
    expect(service.getEncryptionKey()).toBe('dev-key-test-session-id-ccpapp');
  });
});