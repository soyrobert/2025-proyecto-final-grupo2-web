import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LogisticaService, RespuestaCamiones, RespuestaAsignarRuta, Camion } from './planificacion-rutas-service';
import { environment } from '../../../environments/environment';

describe('LogisticaService', () => {
  let service: LogisticaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LogisticaService]
    });

    service = TestBed.inject(LogisticaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('obtenerCamiones', () => {
    it('debería realizar una solicitud GET con los parámetros correctos', () => {
      // Datos de prueba
      const fecha = '2025-05-14';
      const mockRespuesta: RespuestaCamiones = {
        camiones: [
          {
            id: 1,
            placa: 'ABC123',
            marca: 'Mercedes',
            modelo: '2023',
            capacidad_carga_toneladas: 10,
            volumen_carga_metros_cubicos: 30,
            estado_enrutamiento: 'Sin ruta'
          }
        ],
        total: 1
      };

      // Llamada al servicio
      service.obtenerCamiones(fecha).subscribe(respuesta => {
        expect(respuesta).toEqual(mockRespuesta);
        expect(respuesta.total).toBe(1);
        expect(respuesta.camiones.length).toBe(1);
        expect(respuesta.camiones[0].placa).toBe('ABC123');
      });

      // Verificar que la solicitud es correcta
      const req = httpMock.expectOne(`${environment.obtenerRutasApiUrl}?fecha=${fecha}`);
      expect(req.request.method).toBe('GET');

      req.flush(mockRespuesta);
    });

    it('debería manejar una respuesta vacía correctamente', () => {
      const fecha = '2025-05-14';
      const mockRespuestaVacia: RespuestaCamiones = {
        camiones: [],
        total: 0
      };

      service.obtenerCamiones(fecha).subscribe(respuesta => {
        expect(respuesta).toEqual(mockRespuestaVacia);
        expect(respuesta.total).toBe(0);
        expect(respuesta.camiones.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.obtenerRutasApiUrl}?fecha=${fecha}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRespuestaVacia);
    });

    it('debería manejar errores correctamente', () => {
      const fecha = '2025-05-14';
      const errorMsg = 'Error del servidor';

      service.obtenerCamiones(fecha).subscribe({
        next: () => fail('Se esperaba un error'),
        error: error => {
          expect(error.statusText).toBe('Server Error');
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.obtenerRutasApiUrl}?fecha=${fecha}`);
      req.flush(errorMsg, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('asignarRuta', () => {
    it('debería realizar una solicitud POST con el cuerpo correcto', () => {
      const fecha = '2025-05-14';
      const mockRespuesta: RespuestaAsignarRuta = {
        mensajes: ['Ruta asignada exitosamente al camión ABC123']
      };

      service.asignarRuta(fecha).subscribe(respuesta => {
        expect(respuesta).toEqual(mockRespuesta);
        expect(respuesta.mensajes.length).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.asignarRutasApiUrl}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ fecha });
      req.flush(mockRespuesta);
    });

    it('debería manejar errores de asignación correctamente', () => {
      const fecha = '2025-05-14';
      const errorMsg = 'No hay camiones disponibles';

      service.asignarRuta(fecha).subscribe({
        next: () => fail('Se esperaba un error'),
        error: error => {
          expect(error.statusText).toBe('Bad Request');
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.asignarRutasApiUrl}`);
      req.flush(errorMsg, { status: 400, statusText: 'Bad Request' });
    });

    it('debería manejar errores de autorización correctamente', () => {
      const fecha = '2025-05-14';
      const errorMsg = 'No tiene permisos para realizar esta acción';

      service.asignarRuta(fecha).subscribe({
        next: () => fail('Se esperaba un error'),
        error: error => {
          expect(error.statusText).toBe('Forbidden');
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne(`${environment.asignarRutasApiUrl}`);
      req.flush(errorMsg, { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('comportamiento con diferentes estados de camiones', () => {
    it('debería manejar diferentes estados de camiones correctamente', () => {
      const fecha = '2025-05-14';
      const mockRespuesta: RespuestaCamiones = {
        camiones: [
          {
            id: 1,
            placa: 'ABC123',
            marca: 'Mercedes',
            modelo: '2023',
            capacidad_carga_toneladas: 10,
            volumen_carga_metros_cubicos: 30,
            estado_enrutamiento: 'Enrutado'
          },
          {
            id: 2,
            placa: 'XYZ789',
            marca: 'Volvo',
            modelo: '2024',
            capacidad_carga_toneladas: 15,
            volumen_carga_metros_cubicos: 40,
            estado_enrutamiento: 'Sin ruta'
          },
          {
            id: 3,
            placa: 'DEF456',
            marca: 'Scania',
            modelo: '2022',
            capacidad_carga_toneladas: 12,
            volumen_carga_metros_cubicos: 35,
            estado_enrutamiento: 'Sin entregas programadas'
          }
        ],
        total: 3
      };

      service.obtenerCamiones(fecha).subscribe(respuesta => {
        expect(respuesta).toEqual(mockRespuesta);
        expect(respuesta.total).toBe(3);

        // Verificar los diferentes estados
        expect(respuesta.camiones[0].estado_enrutamiento).toBe('Enrutado');
        expect(respuesta.camiones[1].estado_enrutamiento).toBe('Sin ruta');
        expect(respuesta.camiones[2].estado_enrutamiento).toBe('Sin entregas programadas');
      });

      const req = httpMock.expectOne(`${environment.obtenerRutasApiUrl}?fecha=${fecha}`);
      req.flush(mockRespuesta);
    });
  });
});
