import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    // Mocks de localStorage
    jest.spyOn(Storage.prototype, 'getItem');
    jest.spyOn(Storage.prototype, 'setItem');
    jest.spyOn(Storage.prototype, 'removeItem');
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
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
    it('Debería iniciar sesión correctamente y configurar la sesión', async () => {
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
      expect(req.request.body).toEqual({ email, password });
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

    it('Debería devolver falso cuando falla el inicio de sesión', async () => {
      const email = 'invalid@example.com';
      const password = 'wrongpassword';
      const errorResponse = { status: 401, statusText: 'Unauthorized' };
      
      jest.spyOn(console, 'error').mockImplementation(() => {});
      const promise = service.login(email, password);
      
      // Responder a la solicitud HTTP con un error
      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
      req.error(new ErrorEvent('error'), errorResponse);

      const result = await promise;
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('setSession', () => {
    it('Debe almacenar los datos de la sesión en localStorage', () => {

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
    it('Debería devolver el rol de usuario de localStorage', () => {
      const expectedRole = 'director-ventas';
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(expectedRole);
      
      const result = service.getRole();

      expect(result).toBe(expectedRole);
      expect(localStorage.getItem).toHaveBeenCalledWith('userRole');
    });

    it('Debería devolver nulo cuando no se encuentra el rol', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
      
      const result = service.getRole();
      
      expect(result).toBeNull();
      expect(localStorage.getItem).toHaveBeenCalledWith('userRole');
    });
  });

  
});