import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProveedoresService } from './proveedores.service';
import { environment } from '../../../environments/environment';

describe('ProveedoresService', () => {
  let service: ProveedoresService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    // Mock de localStorage
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-token');
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProveedoresService]
    });
    
    service = TestBed.inject(ProveedoresService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });
  
  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });
  
  describe('registrarProveedor', () => {
    it('debería enviar una solicitud POST con los datos del proveedor y el token de autenticación', () => {
      const mockProveedor = {
        nombre: 'Proveedor Test',
        email: 'test@example.com',
        numeroContacto: '1234567890',
        pais: 'Colombia',
        caracteristicas: 'Características de prueba',
        condiciones: 'Condiciones de prueba'
      };
      
      const mockRespuesta = {
        total: 1,
        exitosos: 1,
        fallidos: 0,
        resultados: [
          {
            indice: 0,
            status: 'success',
            proveedor: {
              id: 1,
              nombre: 'Proveedor Test',
              email: 'test@example.com',
              numero_contacto: '1234567890',
              pais: 'Colombia',
              caracteristicas: 'Características de prueba',
              condiciones_comerciales_tributarias: 'Condiciones de prueba',
              fecha_registro: '2025-04-05T12:00:00Z'
            }
          }
        ]
      };
      
      service.registrarProveedor(mockProveedor).subscribe(response => {
        expect(response).toEqual(mockRespuesta);
      });
      
      const req = httpMock.expectOne(`${environment.proveedoresApiUrl}/proveedores`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
      
      // Verificar que se mapearon correctamente los datos
      expect(req.request.body).toEqual({
        nombre: 'Proveedor Test',
        email: 'test@example.com',
        numero_contacto: '1234567890',
        pais: 'Colombia',
        caracteristicas: 'Características de prueba',
        condiciones_comerciales_tributarias: 'Condiciones de prueba'
      });
      
      req.flush(mockRespuesta);
    });
    
    it('debería propagar el error cuando la solicitud falla', () => {
      const mockProveedor = {
        nombre: 'Proveedor Test',
        email: 'test@example.com',
        numeroContacto: '1234567890',
        pais: 'Colombia',
        caracteristicas: 'Características de prueba',
        condiciones: 'Condiciones de prueba'
      };
      
      const mockError = {
        status: 409,
        statusText: 'Conflict',
        error: {
          error: 'El proveedor ya está registrado',
          detalles: `Ya existe un proveedor con el email ${mockProveedor.email}`
        }
      };
      
      service.registrarProveedor(mockProveedor).subscribe({
        next: () => fail('Debería haber fallado'),
        error: error => {
          expect(error.status).toBe(409);
          expect(error.error.error).toBe('El proveedor ya está registrado');
        }
      });
      
      const req = httpMock.expectOne(`${environment.proveedoresApiUrl}/proveedores`);
      req.flush(mockError.error, { status: 409, statusText: 'Conflict' });
    });
  });

  
  describe('getToken', () => {
    it('debería obtener el token de localStorage', () => {

      service.obtenerProveedores().subscribe();
      
      const req = httpMock.expectOne(`${environment.proveedoresApiUrl}/proveedores`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
      expect(localStorage.getItem).toHaveBeenCalledWith('accessToken');
      
      req.flush([]);
    });
    
    it('debería manejar el caso en que no hay token', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
      
      service.obtenerProveedores().subscribe();
      
      const req = httpMock.expectOne(`${environment.proveedoresApiUrl}/proveedores`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer ');
      
      req.flush([]);
    });
  });
});