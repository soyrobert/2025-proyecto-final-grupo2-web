import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VendedoresPlanesVentaService, Vendedor, VendedorRequest } from './vendedores-planes-venta.service';
import { environment } from '../../../environments/environment';

describe('VendedoresPlanesVentaService', () => {
  let service: VendedoresPlanesVentaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VendedoresPlanesVentaService]
    });
    service = TestBed.inject(VendedoresPlanesVentaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  // Prueba real que utiliza los métodos internos del servicio
  describe('Métodos internos', () => {
    it('debería generar datos mock correctamente', () => {
      const datosMock = (service as any).generarDatosMock();
      expect(datosMock).toBeDefined();
      expect(datosMock.length).toBe(5);
      expect(datosMock[0].nombre).toBe('Robert Castro');

    datosMock.forEach((vendedor: Vendedor) => {
      expect(Object.keys(vendedor.metas).length).toBeGreaterThan(0);
    });
    });

    it('debería generar metas aleatorias correctamente', () => {
      const meses = ['ene/2025', 'feb/2025', 'mar/2025'];
      const metas = (service as any).generarMetasAleatorias(meses);

      expect(metas).toBeDefined();
      expect(Object.keys(metas).length).toBe(3);

      Object.values(metas).forEach(valor => {
        expect(typeof valor).toBe('number');
        expect(valor).toBeGreaterThanOrEqual(5000);
        expect(valor).toBeLessThanOrEqual(20000);
      });
    });

    it('debería manejar diferentes tipos de errores HTTP', () => {
      const errorEvent = new ErrorEvent('error', { message: 'Error de red' });
      const httpErrorResponse1 = { error: errorEvent } as any;
      const resultado1 = (service as any).handleError(httpErrorResponse1);
      expect(resultado1).toBeDefined();

      const httpErrorResponse2 = {
        error: { mensaje: 'Error personalizado desde la API' }
      } as any;
      const resultado2 = (service as any).handleError(httpErrorResponse2);
      expect(resultado2).toBeDefined();

      [401, 403, 404, 500].forEach(statusCode => {
        const httpErrorResponse = { status: statusCode } as any;
        const resultado = (service as any).handleError(httpErrorResponse);
        expect(resultado).toBeDefined();
      });

      const httpErrorResponse3 = { status: 0 } as any;
      const resultado3 = (service as any).handleError(httpErrorResponse3);
      expect(resultado3).toBeDefined();
    });
  });

  describe('obtenerVendedoresConPlanes', () => {

    it('debería generar la estructura correcta de meses', () => {
      service.obtenerVendedoresConPlanes().subscribe(vendedores => {
        const vendedor = vendedores[0];
        const meses = Object.keys(vendedor.metas);

        expect(meses.length).toBe(8);

        meses.forEach(mes => {
          expect(mes).toMatch(/^[a-z]{3}\/\d{4}$/);
        });
      });
    });
  });

  describe('actualizarPlanesVendedor', () => {
    it('debería actualizar los planes de un vendedor', () => {
      const vendedorRequest: VendedorRequest = {
        id: 1,
        metas: {
          'ene/2025': 15000,
          'feb/2025': 16000
        }
      };

      service.actualizarPlanesVendedor(vendedorRequest).subscribe(response => {
        expect(response).toBeTruthy();
        expect(response.mensaje).toBe('Actualización exitosa');
      });

      const req = httpMock.expectOne(environment.ventasApiUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(vendedorRequest);
      req.flush({ mensaje: 'Actualización exitosa' });
    });

    it('debería manejar errores al actualizar planes', () => {
      const vendedorRequest: VendedorRequest = {
        id: 1,
        metas: {
          'ene/2025': 15000
        }
      };

      service.actualizarPlanesVendedor(vendedorRequest).subscribe({
        next: () => fail('Se esperaba un error'),
        error: error => {
          expect(error).toBeTruthy();
          expect(error.message).toBe('No tiene permisos suficientes para acceder a este recurso');
        }
      });

      const req = httpMock.expectOne(environment.ventasApiUrl);
      expect(req.request.method).toBe('PUT');
      req.flush('Error al actualizar', { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('actualizarPlanesMultiplesVendedores', () => {
    it('debería actualizar planes de múltiples vendedores', () => {
      const vendedoresRequest: VendedorRequest[] = [
        {
          id: 1,
          metas: {
            'ene/2025': 15000
          }
        },
        {
          id: 2,
          metas: {
            'feb/2025': 16000
          }
        }
      ];

      service.actualizarPlanesMultiplesVendedores(vendedoresRequest).subscribe(response => {
        expect(response).toBeTruthy();
        expect(response.mensaje).toBe('Actualización múltiple exitosa');
      });

      const req = httpMock.expectOne(environment.ventasApiUrl);
      expect(req.request.method).toBe('PUT');

      expect(req.request.body).toEqual({
        vendedores: vendedoresRequest
      });

      req.flush({ mensaje: 'Actualización múltiple exitosa' });
    });

    it('debería manejar errores al actualizar múltiples planes', () => {
      const vendedoresRequest: VendedorRequest[] = [
        {
          id: 1,
          metas: {
            'ene/2025': 15000
          }
        }
      ];

      service.actualizarPlanesMultiplesVendedores(vendedoresRequest).subscribe({
        next: () => fail('Se esperaba un error'),
        error: error => {
          expect(error).toBeTruthy();
          expect(error.message).toBe('No tiene permisos suficientes para acceder a este recurso');
        }
      });

      const req = httpMock.expectOne(environment.ventasApiUrl);
      expect(req.request.method).toBe('PUT');
      req.flush('Error al actualizar múltiples', { status: 403, statusText: 'Forbidden' });
    });

    it('debería manejar errores de tipo 401', () => {
      const vendedoresRequest: VendedorRequest[] = [{ id: 1, metas: { 'ene/2025': 15000 } }];

      service.actualizarPlanesMultiplesVendedores(vendedoresRequest).subscribe({
        next: () => fail('Se esperaba un error'),
        error: error => {
          expect(error).toBeTruthy();
          expect(error.message).toBe('No está autorizado para realizar esta operación');
        }
      });

      const req = httpMock.expectOne(environment.ventasApiUrl);
      req.flush('No autorizado', { status: 401, statusText: 'Unauthorized' });
    });

    it('debería manejar errores de tipo 404', () => {
      const vendedoresRequest: VendedorRequest[] = [{ id: 1, metas: { 'ene/2025': 15000 } }];

      service.actualizarPlanesMultiplesVendedores(vendedoresRequest).subscribe({
        next: () => fail('Se esperaba un error'),
        error: error => {
          expect(error).toBeTruthy();
          expect(error.message).toBe('No se encontraron datos para esta consulta');
        }
      });

      const req = httpMock.expectOne(environment.ventasApiUrl);
      req.flush('No encontrado', { status: 404, statusText: 'Not Found' });
    });
  });
});
