import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LogisticaService, ProductsResponse, Product } from './logistica.service';
import { environment } from '../../../environments/environment';

describe('LogisticaService', () => {
  let service: LogisticaService;
  let httpMock: HttpTestingController;
  let apiUrl: string;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LogisticaService]
    });
    service = TestBed.inject(LogisticaService);
    httpMock = TestBed.inject(HttpTestingController);
    apiUrl = `${environment.busquedaProductosApiUrl}`;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProducts', () => {
    const mockResponse: ProductsResponse = {
      products: [
        {
          id: 1,
          nombre: 'Producto 1',
          descripcion: 'Descripción del producto 1',
          precio: 100,
          estado: 'en_stock',
          fecha_vencimiento: '2023-12-31',
          proveedor: 'Proveedor 1',
          inventario_inicial: 50,
          condiciones_almacenamiento: 'Almacenar en lugar fresco',
          tiempo_entrega: '2 días',
          imagenes_productos: []
        }
      ],
      limit: 10,
      page: 1,
      total: 1,
      total_pages: 1
    };

    it('debería obtener productos con parámetros predeterminados', () => {
      service.getProducts().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/productos?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('debería obtener productos con parámetros personalizados', () => {
      service.getProducts(2, 20, 'test', '123', 'en_stock').subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/productos?page=2&limit=20&name=test&code=123&status=en_stock`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('deberían obtenerse productos con parámetros parciales.', () => {
      service.getProducts(2, 20, undefined, '123').subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/productos?page=2&limit=20&code=123`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getProductById', () => {
    const mockProduct: Product = {
      id: 1,
      nombre: 'Producto 1',
      descripcion: 'Descripción del producto 1',
      precio: 100,
      estado: 'en_stock',
      fecha_vencimiento: '2023-12-31',
      proveedor: 'Proveedor 1',
      inventario_inicial: 50,
      condiciones_almacenamiento: 'Almacenar en lugar fresco',
      tiempo_entrega: '2 días',
      imagenes_productos: []
    };

    it('debería obtener el producto por id', () => {
      service.getProductById(1).subscribe(product => {
        expect(product).toEqual(mockProduct);
      });

      const req = httpMock.expectOne(`${apiUrl}/productos/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProduct);
    });
  });
});