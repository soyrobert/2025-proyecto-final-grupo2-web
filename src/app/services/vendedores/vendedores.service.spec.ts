import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VendedoresService } from './vendedores.service';
import { environment } from '../../../environments/environment';

describe('VendedoresService', () => {
  let service: VendedoresService;
  let httpMock: HttpTestingController;

  // Datos de prueba
  const mockClientes = [
    {
      nombre: 'Luke Ivory',
      direccion: 'CL 147 # 7-7, Bogotá',
      codigo: '#48094',
      promedio_ventas: 58.07
    },
    {
      nombre: 'Andy King',
      direccion: 'CR 30 # 1-10, Cali',
      codigo: '#76934',
      promedio_ventas: 88.00
    }
  ];

  const mockVendedores = [
    { id: '1', nombre: 'Carlos Ramírez' },
    { id: '2', nombre: 'Ana González' }
  ];

  const mockProductos = [
    { id: 'P001', nombre: 'Laptop Pro X1' },
    { id: 'P002', nombre: 'Smartphone Galaxy S22' }
  ];

  const mockZonas = [
    { id: 'Z001', nombre: 'Norte' },
    { id: 'Z002', nombre: 'Sur' }
  ];

  const mockHistoricoVentas = {
    datos_mensuales: {
      january: 10000,
      february: 12000,
      march: 15000,
      april: 13000,
      may: 14000,
      june: 16000,
      july: 18000,
      august: 17000,
      september: 19000,
      october: 20000,
      november: 18000,
      december: 21000
    },
    total: 193000
  };

  const mockPlanesMetas = {
    metas: [
      { meta: 'Actualizar Server Logs', tiempo: 'Next: Now' },
      { meta: 'Send Mail to HR and Admin', tiempo: '2 min ago' }
    ],
    planes: [
      { plan: 'Backup Files EOD', tiempo: '14:00' },
      { plan: 'Collect documents from Sara', tiempo: '16:00' }
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VendedoresService]
    });

    service = TestBed.inject(VendedoresService);
    httpMock = TestBed.inject(HttpTestingController);

    const mockLocalStorage = {
      getItem: jest.fn().mockReturnValue('mock-token')
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getToken', () => {
    it('debería obtener el token del localStorage', () => {
      // @ts-ignore - accediendo a método privado para probar
      const token = service.getToken();
      expect(token).toBe('mock-token');
      expect(localStorage.getItem).toHaveBeenCalledWith('accessToken');
    });

    it('debería devolver string vacío si no hay token', () => {
      (localStorage.getItem as jest.Mock).mockReturnValueOnce(null);
      // @ts-ignore - accediendo a método privado para probar
      const token = service.getToken();
      expect(token).toBe('');
    });
  });

  describe('getHeaders', () => {
    it('debería configurar los headers con el token', () => {
      // @ts-ignore - accediendo a método privado para probar
      const headers = service.getHeaders();
      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('Authorization')).toBe('Bearer mock-token');
    });
  });

  describe('getClientesVentas', () => {
    it('debería devolver datos de clientes correctamente', () => {
      service.getClientesVentas().subscribe(clientes => {
        expect(clientes.length).toBe(2);
        expect(clientes).toEqual(jasmine.arrayContaining([
          jasmine.objectContaining({ nombre: 'Luke Ivory' }),
          jasmine.objectContaining({ nombre: 'Andy King' })
        ]));
      });

      const req = httpMock.expectOne(environment.clientesVentasApiUrl);
      expect(req.request.method).toBe('GET');
      req.flush({ clientes: mockClientes });
    });

    it('debería manejar respuesta sin clientes', () => {
      service.getClientesVentas().subscribe(clientes => {
        expect(clientes).toEqual([]);
      });

      const req = httpMock.expectOne(environment.clientesVentasApiUrl);
      req.flush({});
    });

    it('debería manejar errores', () => {
      service.getClientesVentas().subscribe({
        next: clientes => {
          expect(clientes).toEqual([]);
        },
        error: () => {
          fail('No debería entrar en error, debería devolver array vacío');
        }
      });

      const req = httpMock.expectOne(environment.clientesVentasApiUrl);
      req.error(new ErrorEvent('network error'));
    });
  });

  describe('getVendedores', () => {
    it('debería devolver vendedores correctamente', () => {
      service.getVendedores().subscribe(vendedores => {
        expect(vendedores.length).toBe(2);
        expect(vendedores).toEqual(mockVendedores);
      });

      const req = httpMock.expectOne(environment.listaVendedoresApiUrl);
      expect(req.request.method).toBe('GET');
      req.flush({ vendedores: mockVendedores });
    });

    it('debería manejar respuesta de array directamente', () => {
      service.getVendedores().subscribe(vendedores => {
        expect(vendedores.length).toBe(2);
        expect(vendedores).toEqual(mockVendedores);
      });

      const req = httpMock.expectOne(environment.listaVendedoresApiUrl);
      req.flush(mockVendedores);
    });

    it('debería manejar respuestas vacías o inválidas', () => {
      service.getVendedores().subscribe(vendedores => {
        expect(vendedores).toEqual([]);
      });

      const req = httpMock.expectOne(environment.listaVendedoresApiUrl);
      req.flush({});
    });

    it('debería manejar errores', () => {
      service.getVendedores().subscribe({
        next: vendedores => {
          expect(vendedores).toEqual([]);
        },
        error: () => {
          fail('No debería entrar en error, debería devolver array vacío');
        }
      });

      const req = httpMock.expectOne(environment.listaVendedoresApiUrl);
      req.error(new ErrorEvent('network error'));
    });
  });

  describe('getProductos', () => {
    it('debería devolver productos correctamente', () => {
      service.getProductos().subscribe(productos => {
        expect(productos.length).toBe(2);
        expect(productos).toEqual(mockProductos);
      });

      const req = httpMock.expectOne(environment.listaProductosApiUrl);
      expect(req.request.method).toBe('GET');
      req.flush({ productos: mockProductos });
    });

    it('debería manejar errores', () => {
      service.getProductos().subscribe({
        next: productos => {
          expect(productos).toEqual([]);
        }
      });

      const req = httpMock.expectOne(environment.listaProductosApiUrl);
      req.error(new ErrorEvent('network error'));
    });
  });

  describe('getZonas', () => {
    it('debería devolver zonas correctamente', () => {
      service.getZonas().subscribe(zonas => {
        expect(zonas.length).toBe(2);
        expect(zonas).toEqual(mockZonas);
      });

      const req = httpMock.expectOne(environment.listaZonasApiUrl);
      expect(req.request.method).toBe('GET');
      req.flush({ zonas: mockZonas });
    });

    it('debería manejar errores', () => {
      service.getZonas().subscribe({
        next: zonas => {
          expect(zonas).toEqual([]);
        }
      });

      const req = httpMock.expectOne(environment.listaZonasApiUrl);
      req.error(new ErrorEvent('network error'));
    });
  });

  describe('getHistoricoVentas', () => {
    it('debería devolver histórico de ventas correctamente', () => {
      service.getHistoricoVentas().subscribe(historico => {
        expect(historico).toEqual(mockHistoricoVentas);
      });

      const req = httpMock.expectOne(environment.historicoVentasApiUrl);
      expect(req.request.method).toBe('GET');
      req.flush({ historico_ventas: mockHistoricoVentas });
    });

    it('debería usar fallback si solo hay ceros', () => {
      const historicoConCeros = {
        datos_mensuales: {
          january: 0, february: 0, march: 0, april: 0, may: 0, june: 0,
          july: 0, august: 0, september: 0, october: 0, november: 0, december: 0
        },
        total: 0
      };

      service.getHistoricoVentas().subscribe(historico => {
        expect(historico).toEqual(mockHistoricoVentas);
      });

      const req = httpMock.expectOne(environment.historicoVentasApiUrl);
      req.flush({
        historico_ventas: historicoConCeros,
        historico_ventas_fallback: mockHistoricoVentas
      });
    });

    it('debería usar historico_ventas_fallback si no hay historico_ventas', () => {
      service.getHistoricoVentas().subscribe(historico => {
        expect(historico).toEqual(mockHistoricoVentas);
      });

      const req = httpMock.expectOne(environment.historicoVentasApiUrl);
      req.flush({ historico_ventas_fallback: mockHistoricoVentas });
    });

    it('debería generar datos aleatorios si no hay datos', () => {
      service.getHistoricoVentas().subscribe(historico => {
        expect(historico).toBeDefined();
        expect(historico.datos_mensuales).toBeDefined();
        expect(historico.total).toBeDefined();
        expect(typeof historico.total).toBe('number');
      });

      const req = httpMock.expectOne(environment.historicoVentasApiUrl);
      req.flush({});
    });

    it('debería manejar errores', () => {
      service.getHistoricoVentas().subscribe(historico => {
        expect(historico).toBeDefined();
        expect(historico.datos_mensuales).toBeDefined();
        expect(historico.total).toBeDefined();
      });

      const req = httpMock.expectOne(environment.historicoVentasApiUrl);
      req.error(new ErrorEvent('network error'));
    });
  });

  describe('getPlanesMetas', () => {
    it('debería devolver planes y metas correctamente', () => {
      service.getPlanesMetas().subscribe(data => {
        expect(data).toEqual(mockPlanesMetas);
      });

      const req = httpMock.expectOne(environment.planesMetaApiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockPlanesMetas);
    });

    it('debería generar datos aleatorios si no hay datos', () => {
      service.getPlanesMetas().subscribe(data => {
        expect(data.metas).toBeDefined();
        expect(data.planes).toBeDefined();
        expect(Array.isArray(data.metas)).toBe(true);
        expect(Array.isArray(data.planes)).toBe(true);
      });

      const req = httpMock.expectOne(environment.planesMetaApiUrl);
      req.flush({});
    });

    it('debería manejar errores', () => {
      service.getPlanesMetas().subscribe(data => {
        expect(data.metas).toBeDefined();
        expect(data.planes).toBeDefined();
        expect(Array.isArray(data.metas)).toBe(true);
        expect(Array.isArray(data.planes)).toBe(true);
      });

      const req = httpMock.expectOne(environment.planesMetaApiUrl);
      req.error(new ErrorEvent('network error'));
    });
  });

  // Tests para métodos privados auxiliares
  describe('métodos auxiliares', () => {
    it('asignarVendedorAleatorio debería devolver un ID válido', () => {
      // @ts-ignore - accediendo a método privado para probar
      const vendedorId = service.asignarVendedorAleatorio();
      expect(typeof vendedorId).toBe('string');
      expect(vendedorId).toBeTruthy();
    });

    it('generarProductosAleatorios debería devolver un array de IDs', () => {
      // @ts-ignore - accediendo a método privado para probar
      const productos = service.generarProductosAleatorios();
      expect(Array.isArray(productos)).toBe(true);
      expect(productos.length).toBeGreaterThan(0);
      expect(productos.length).toBeLessThanOrEqual(3);
    });

    it('calcularTotalFromMensuales debería sumar correctamente', () => {
      const datos = {
        january: 100,
        february: 200,
        march: 300
      };
      // @ts-ignore - accediendo a método privado para probar
      const total = service.calcularTotalFromMensuales(datos);
      expect(total).toBe(600);
    });

    it('generarDatosMensualesAleatorios debería devolver datos para todos los meses', () => {
      // @ts-ignore - accediendo a método privado para probar
      const datos = service.generarDatosMensualesAleatorios();
      const meses = ['january', 'february', 'march', 'april', 'may', 'june',
                   'july', 'august', 'september', 'october', 'november', 'december'];

      meses.forEach(mes => {
        expect(datos[mes]).toBeDefined();
        expect(typeof datos[mes]).toBe('number');
      });
    });

    it('generarMetasAleatorias debería devolver un array de metas', () => {
      // @ts-ignore - accediendo a método privado para probar
      const metas = service.generarMetasAleatorias();
      expect(Array.isArray(metas)).toBe(true);
      expect(metas.length).toBeGreaterThan(0);

      metas.forEach(meta => {
        expect(meta.meta).toBeDefined();
        expect(meta.tiempo).toBeDefined();
      });
    });

    it('generarPlanesAleatorios debería devolver un array de planes', () => {
      // @ts-ignore - accediendo a método privado para probar
      const planes = service.generarPlanesAleatorios();
      expect(Array.isArray(planes)).toBe(true);
      expect(planes.length).toBeGreaterThan(0);

      planes.forEach(plan => {
        expect(plan.plan).toBeDefined();
        expect(plan.tiempo).toBeDefined();
      });
    });
  });
});
