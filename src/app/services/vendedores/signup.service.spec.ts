import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SignupService, SignupRequest, SignupResponse } from './signup.service';
import { environment } from '../../../environments/environment';

describe('SignupService', () => {
  let service: SignupService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SignupService]
    });
    
    service = TestBed.inject(SignupService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() => {
    httpMock.verify();
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  describe('registerUser', () => {
    it('debería enviar una solicitud POST con los datos del usuario', () => {
      // Datos de prueba
      const userData: SignupRequest = {
        name: 'Usuario Test',
        email: 'test@example.com',
        password: 'password123',
        role: 'cliente',
        country: 'Colombia',
        city: 'Bogotá',
        address: 'Calle 123',
        acceptPolicy: true
      };
      
      const mockResponse: SignupResponse = {
        userId: 1,
        message: 'Usuario registrado correctamente'
      };
      
      // Llamar al método del servicio
      service.registerUser(userData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
      
      // Verificar que se hizo la solicitud correcta
      const req = httpMock.expectOne(`${environment.apiBaseUrl}/signup`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.body).toEqual(userData);
      
      // Simular respuesta del servidor
      req.flush(mockResponse);
    });
    
    it('debería manejar errores del servidor correctamente', () => {
      // Datos de prueba
      const userData: SignupRequest = {
        name: 'Usuario Test',
        email: 'existente@example.com',
        password: 'password123',
        role: 'cliente',
        country: 'Colombia',
        city: 'Bogotá',
        address: 'Calle 123',
        acceptPolicy: true
      };
      
      const errorResponse = {
        status: 409,
        statusText: 'Conflict',
        error: {
          error: 'El email ya está registrado'
        }
      };
      
      // Llamar al método del servicio y esperar un error
      service.registerUser(userData).subscribe({
        next: () => fail('Se esperaba un error'),
        error: error => {
          expect(error.status).toBe(409);
          expect(error.error.error).toBe('El email ya está registrado');
        }
      });
      
      // Verificar que se hizo la solicitud correcta
      const req = httpMock.expectOne(`${environment.apiBaseUrl}/signup`);
      expect(req.request.method).toBe('POST');
      
      // Simular respuesta de error del servidor
      req.flush(errorResponse.error, {
        status: errorResponse.status,
        statusText: errorResponse.statusText
      });
    });
    
    it('debería manejar errores de validación (400) correctamente', () => {
      // Datos de prueba con contraseña muy corta
      const userData: SignupRequest = {
        name: 'Usuario Test',
        email: 'test@example.com',
        password: 'pass', // Contraseña muy corta
        role: 'cliente',
        country: 'Colombia',
        city: 'Bogotá',
        address: 'Calle 123',
        acceptPolicy: true
      };
      
      const errorResponse = {
        status: 400,
        statusText: 'Bad Request',
        error: {
          error: 'Datos inválidos',
          details: {
            password: 'La contraseña debe tener al menos 8 caracteres'
          }
        }
      };
      
      // Llamar al método del servicio y esperar un error
      service.registerUser(userData).subscribe({
        next: () => fail('Se esperaba un error'),
        error: error => {
          expect(error.status).toBe(400);
          expect(error.error.error).toBe('Datos inválidos');
          expect(error.error.details.password).toBe('La contraseña debe tener al menos 8 caracteres');
        }
      });
      
      // Verificar que se hizo la solicitud correcta
      const req = httpMock.expectOne(`${environment.apiBaseUrl}/signup`);
      expect(req.request.method).toBe('POST');
      
      // Simular respuesta de error del servidor
      req.flush(errorResponse.error, {
        status: errorResponse.status,
        statusText: errorResponse.statusText
      });
    });
    
    it('debería manejar errores de red correctamente', () => {
      // Datos de prueba
      const userData: SignupRequest = {
        name: 'Usuario Test',
        email: 'test@example.com',
        password: 'password123',
        role: 'cliente',
        country: 'Colombia',
        city: 'Bogotá',
        address: 'Calle 123',
        acceptPolicy: true
      };
      
      const errorEvent = new ProgressEvent('error');
      
      // Llamar al método del servicio y esperar un error
      service.registerUser(userData).subscribe({
        next: () => fail('Se esperaba un error'),
        error: error => {
          expect(error instanceof ProgressEvent).toBe(true);
          expect(error.type).toBe('error');
        }
      });
      
      // Verificar que se hizo la solicitud correcta
      const req = httpMock.expectOne(`${environment.apiBaseUrl}/signup`);
      expect(req.request.method).toBe('POST');
      
      // Simular error de red
      req.error(errorEvent);
    });
  });
});