import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { ConfigService } from '../config/config.service';
import * as CryptoJS from 'crypto-js';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let configServiceMock: ConfigService;

  beforeEach(() => {
    // Mock de ConfigService
    configServiceMock = {
      getEncryptionKey: jest.fn().mockReturnValue('test-encryption-key')
    } as unknown as ConfigService;

    // Mocks de localStorage
    jest.spyOn(Storage.prototype, 'getItem');
    jest.spyOn(Storage.prototype, 'setItem');
    jest.spyOn(Storage.prototype, 'removeItem');

    // Mock de console.error para pruebas de error
    jest.spyOn(console, 'error').mockImplementation(() => {});

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: ConfigService, useValue: configServiceMock }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('debería iniciar sesión correctamente y configurar la sesión', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockResponse = {
        accessToken: 'token123',
        role: 'director-ventas',
        userId: 1
      };

      const setSessionSpy = jest.spyOn(service, 'setSession');
      const promise = service.login(email, password);

      // Responder a la solicitud HTTP
      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
      expect(req.request.method).toBe('POST');

      // Verificar que el password está encriptado y se envía el flag
      expect(req.request.body.email).toEqual(email);
      expect(req.request.body.isEncrypted).toBe(true);
      expect(req.request.body.password).toBeDefined(); // No podemos verificar el valor exacto ya que está encriptado

      req.flush(mockResponse);

      const result = await promise;
      expect(result).toBe(true);
      expect(setSessionSpy).toHaveBeenCalledWith(
        mockResponse.accessToken,
        mockResponse.role,
        mockResponse.userId,
        email
      );
    });

    it('debería devolver falso cuando falla el inicio de sesión', async () => {
      const email = 'invalid@example.com';
      const password = 'wrongpassword';
      const errorResponse = { status: 401, statusText: 'Unauthorized' };

      const promise = service.login(email, password);

      // Responder a la solicitud HTTP con un error
      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
      req.error(new ErrorEvent('error'), errorResponse);

      const result = await promise;
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('encryptPassword', () => {
    it('debería encriptar correctamente la contraseña', () => {
      const password = 'mySecurePassword';
      const encryptionKey = 'test-encryption-key';

      // Asegurar que configService.getEncryptionKey devuelve la clave de prueba
      jest.spyOn(configServiceMock, 'getEncryptionKey').mockReturnValue(encryptionKey);

      // Espiar el método de encriptación de CryptoJS
      const cryptoSpy = jest.spyOn(CryptoJS.AES, 'encrypt');

      // Invocar al método privado usando la técnica de cast
      const encryptedPassword = (service as any).encryptPassword(password);

      // Verificar que se llamó a CryptoJS.AES.encrypt con los parámetros correctos
      expect(cryptoSpy).toHaveBeenCalledWith(password, encryptionKey);
      expect(typeof encryptedPassword).toBe('string');
      expect(encryptedPassword.length).toBeGreaterThan(0);

      // Limpiar el espía
      cryptoSpy.mockRestore();
    });
  });

  describe('setSession', () => {
    it('debe almacenar los datos de la sesión en localStorage', () => {
      const token = 'sample-token';
      const role = 'director-ventas';
      const userId = 123;
      const email = 'user@example.com';

      service.setSession(token, role, userId, email);

      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', token);
      expect(localStorage.setItem).toHaveBeenCalledWith('userRole', role);
      expect(localStorage.setItem).toHaveBeenCalledWith('userId', '123');
      expect(localStorage.setItem).toHaveBeenCalledWith('userEmail', email);
    });
  });

  describe('getRole', () => {
    it('debería devolver el rol de usuario de localStorage', () => {
      const expectedRole = 'director-ventas';
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(expectedRole);

      const result = service.getRole();

      expect(result).toBe(expectedRole);
      expect(localStorage.getItem).toHaveBeenCalledWith('userRole');
    });

    it('debería devolver nulo cuando no se encuentra el rol', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

      const result = service.getRole();

      expect(result).toBeNull();
      expect(localStorage.getItem).toHaveBeenCalledWith('userRole');
    });
  });

  describe('logout', () => {
    it('debería eliminar todos los datos de sesión de LocalStorage', () => {
      service.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('userRole');
      expect(localStorage.removeItem).toHaveBeenCalledWith('userId');
      expect(localStorage.removeItem).toHaveBeenCalledWith('userEmail');
    });
  });

  describe('isAuthenticated', () => {
    it('debe devolver verdadero cuando exista accessToken', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('token123');

      const result = service.isAuthenticated();

      expect(result).toBe(true);
      expect(localStorage.getItem).toHaveBeenCalledWith('accessToken');
    });

    it('debería devolver falso cuando el token de acceso no existe', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

      const result = service.isAuthenticated();

      expect(result).toBe(false);
      expect(localStorage.getItem).toHaveBeenCalledWith('accessToken');
    });

    it('debería devolver falso cuando el token de acceso es una cadena vacía', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('');

      const result = service.isAuthenticated();

      expect(result).toBe(false);
      expect(localStorage.getItem).toHaveBeenCalledWith('accessToken');
    });
  });
});
