import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { ProductosService } from './productos.service';
import { environment } from '../../../environments/environment';

describe('ProductosService', () => {
  let service: ProductosService;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductosService]
    });

    service = TestBed.inject(ProductosService);
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);

    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn().mockImplementation((key) => {
        return key === 'accessToken' ? 'mock-token' : null;
      }),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('getToken', () => {
    it('debería devolver el token desde localStorage', () => {
      const token = (service as any).getToken();
      expect(token).toBe('mock-token');
      expect(localStorage.getItem).toHaveBeenCalledWith('accessToken');
    });

    it('debería devolver cadena vacía si el token no está en localStorage', () => {
      jest.spyOn(localStorage, 'getItem').mockReturnValueOnce(null);
      const token = (service as any).getToken();
      expect(token).toBe('');
    });
  });

  describe('getHeaders', () => {
    it('debería devolver HttpHeaders con Authorization y Content-Type', () => {
      const headers = (service as any).getHeaders();
      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('Authorization')).toBe('Bearer mock-token');
    });
  });

  describe('registrarProducto', () => {
    it('debería enviar petición POST con los datos del producto transformados', () => {
      const mockProducto = {
        nombre: 'Producto Test',
        descripcion: 'Descripción de prueba',
        tiempoEntrega: '1-3 días',
        precioUnitario: '10.99',
        condicionesAlmacenamiento: 'Mantener refrigerado',
        fechaVencimiento: '2025-12-31',
        estado: 'Activo',
        inventarioInicial: '100',
        imagenes: new File([''], 'test.jpg', { type: 'image/jpeg' }),
        proveedor: '12345'
      };

      const expectedData = {
        nombre: 'Producto Test',
        descripcion: 'Descripción de prueba',
        tiempo_entrega: '1-3 días',
        precio: 10.99,
        condiciones_almacenamiento: 'Mantener refrigerado',
        fecha_vencimiento: '2025-12-31',
        estado: 'en_stock',
        inventario_inicial: 100,
        imagenes_productos: [new File([''], 'test.jpg', { type: 'image/jpeg' })],
        proveedor: '12345'
      };

      service.registrarProducto(mockProducto).subscribe(res => {
        expect(res).toBeTruthy();
      });

      const req = httpMock.expectOne(`${environment.productosApiUrl}/productos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(expectedData);
      expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
      
      req.flush({ success: true });
    });

    it('debería mapear correctamente el estado al formato de la API', () => {
      // Prueba estado "Activo"
      let mockProducto = getMockProducto('Activo');
      service.registrarProducto(mockProducto).subscribe();
      let req = httpMock.expectOne(`${environment.productosApiUrl}/productos`);
      expect(req.request.body.estado).toBe('en_stock');
      req.flush({});

      // Prueba estado "Inactivo"
      mockProducto = getMockProducto('Inactivo');
      service.registrarProducto(mockProducto).subscribe();
      req = httpMock.expectOne(`${environment.productosApiUrl}/productos`);
      expect(req.request.body.estado).toBe('en_produccion');
      req.flush({});

      // Prueba estado "Agotado"
      mockProducto = getMockProducto('Agotado');
      service.registrarProducto(mockProducto).subscribe();
      req = httpMock.expectOne(`${environment.productosApiUrl}/productos`);
      expect(req.request.body.estado).toBe('agotado');
      req.flush({});

      // Prueba estado por defecto
      mockProducto = getMockProducto('Estado No Reconocido');
      service.registrarProducto(mockProducto).subscribe();
      req = httpMock.expectOne(`${environment.productosApiUrl}/productos`);
      expect(req.request.body.estado).toBe('en_stock');
      req.flush({});
    });

    it('debería manejar productos sin imágenes', () => {
      const mockProducto = {
        nombre: 'Producto Sin Imagen',
        descripcion: 'Descripción de prueba',
        tiempoEntrega: '1-3 días',
        precioUnitario: '10.99',
        condicionesAlmacenamiento: 'Mantener refrigerado',
        fechaVencimiento: '2025-12-31',
        estado: 'Activo',
        inventarioInicial: '100',
        imagenes: null,
        proveedor: '12345'
      };

      service.registrarProducto(mockProducto).subscribe();

      const req = httpMock.expectOne(`${environment.productosApiUrl}/productos`);
      expect(req.request.body.imagenes_productos).toEqual([]);
      req.flush({});
    });
  });

  describe('obtenerProductos', () => {
    it('debería enviar petición GET para obtener todos los productos', () => {
      const mockProductos = [
        { id: 1, nombre: 'Producto 1' },
        { id: 2, nombre: 'Producto 2' }
      ];

      service.obtenerProductos().subscribe(productos => {
        expect(productos).toEqual(mockProductos);
      });

      const req = httpMock.expectOne(`${environment.productosApiUrl}/productos`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
      
      req.flush(mockProductos);
    });
  });

  describe('obtenerProducto', () => {
    it('debería enviar petición GET para obtener un producto específico por ID', () => {
      const mockProducto = { id: 1, nombre: 'Producto 1' };
      const productId = 1;

      service.obtenerProducto(productId).subscribe(producto => {
        expect(producto).toEqual(mockProducto);
      });

      const req = httpMock.expectOne(`${environment.productosApiUrl}/productos/${productId}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
      
      req.flush(mockProducto);
    });

    it('debería manejar correctamente IDs de producto tipo string', () => {
      const mockProducto = { id: 'abc123', nombre: 'Producto String ID' };
      const productId = 'abc123';

      service.obtenerProducto(productId).subscribe(producto => {
        expect(producto).toEqual(mockProducto);
      });

      const req = httpMock.expectOne(`${environment.productosApiUrl}/productos/${productId}`);
      expect(req.request.method).toBe('GET');
      
      req.flush(mockProducto);
    });
  });


  function getMockProducto(estado: string) {
    return {
      nombre: 'Producto Test',
      descripcion: 'Descripción de prueba',
      tiempoEntrega: '1-3 días',
      precioUnitario: '10.99',
      condicionesAlmacenamiento: 'Mantener refrigerado',
      fechaVencimiento: '2025-12-31',
      estado: estado,
      inventarioInicial: '100',
      imagenes: null,
      proveedor: '12345'
    };
  }
});