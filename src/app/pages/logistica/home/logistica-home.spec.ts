import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogisticaHome } from './logistica-home';
import { LogisticaService, ProductsResponse } from '../../../services/logistica/logistica.service';
import { TranslateService, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('LogisticaHome', () => {
  let component: LogisticaHome;
  let fixture: ComponentFixture<LogisticaHome>;
  let logisticaService: LogisticaService;
  let translateService: TranslateService;

  const mockProductsResponse: ProductsResponse = {
    products: [
      {
        id: 1,
        nombre: 'Producto 1',
        descripcion: 'Descripción 1',
        precio: 100.0,
        estado: 'en_stock',
        fecha_vencimiento: '2023-12-31',
        proveedor: 'Proveedor 1',
        inventario_inicial: 100,
        condiciones_almacenamiento: 'Almacenar en lugar fresco y seco',
        tiempo_entrega: '3 días',
        imagenes_productos: []
      },
      {
        id: 2,
        nombre: 'Producto 2',
        descripcion: 'Descripción 2',
        precio: 200.0,
        estado: 'agotado',
        fecha_vencimiento: '2024-06-30',
        proveedor: 'Proveedor 2',
        inventario_inicial: 0,
        condiciones_almacenamiento: 'Almacenar en lugar fresco y seco',
        tiempo_entrega: '5 días',
        imagenes_productos: []
      }
    ],
    limit: 10,
    page: 1,
    total: 2,
    total_pages: 1
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        LogisticaService,
        TranslateService,
        {
          provide: TranslatePipe,
          useValue: {
            transform: jest.fn((key) => key)
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LogisticaHome);
    component = fixture.componentInstance;
    logisticaService = TestBed.inject(LogisticaService);
    translateService = TestBed.inject(TranslateService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loadProducts', () => {
    it('deberia cargar los productos correctamente', () => {
      const spy = jest.spyOn(logisticaService, 'getProducts').mockReturnValue(of(mockProductsResponse));

      component.loadProducts();

      expect(spy).toHaveBeenCalledWith(1, 10, '', '', '');
      expect(component.products).toEqual(mockProductsResponse.products);
      expect(component.totalItems).toBe(mockProductsResponse.total);
      expect(component.totalPages).toBe(mockProductsResponse.total_pages);
      expect(component.isLoading).toBe(false);
      expect(component.hasError).toBe(false);
    });

    it('deberia manejar el error de API', () => {
      const errorMessage = 'Error loading products';
      const spy = jest.spyOn(logisticaService, 'getProducts').mockReturnValue(
        throwError(() => new Error(errorMessage))
      );
      const translateSpy = jest.spyOn(translateService, 'instant').mockReturnValue('Error message');

      component.loadProducts();

      expect(spy).toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
      expect(component.hasError).toBe(true);
      expect(component.errorMessage).toBe(errorMessage);
    });

    it('deberia aplicar el filtro de estado correctamente', () => {
      const spy = jest.spyOn(logisticaService, 'getProducts').mockReturnValue(of(mockProductsResponse));

      component.searchStatus = 'txt_en_stock';
      component.loadProducts();

      expect(spy).toHaveBeenCalledWith(1, 10, '', '', 'en_stock');
    });

    it('deberia aplicar varios filtros correctamente', () => {
      const spy = jest.spyOn(logisticaService, 'getProducts').mockReturnValue(of(mockProductsResponse));

      component.searchName = 'producto';
      component.searchCode = '123';
      component.searchStatus = 'txt_agotado';
      component.loadProducts();

      expect(spy).toHaveBeenCalledWith(1, 10, 'producto', '123', 'agotado');
    });
  });

  describe('applyFilters', () => {
    it('deberia restablecerse a la primera página y cargar los productos', () => {
      const loadProductsSpy = jest.spyOn(component, 'loadProducts');
      component.currentPage = 3;

      component.applyFilters();

      expect(component.currentPage).toBe(1);
      expect(loadProductsSpy).toHaveBeenCalled();
    });
  });

  describe('goToPage', () => {
    it('deberia cambiar la página y cargar los productos cuando la página sea válida', () => {
      const loadProductsSpy = jest.spyOn(component, 'loadProducts');
      component.currentPage = 1;
      component.totalPages = 5;

      component.goToPage(3);

      expect(component.currentPage).toBe(3);
      expect(loadProductsSpy).toHaveBeenCalled();
    });

    it('no debe cambiar de página cuando ya está en la página seleccionada', () => {
      const loadProductsSpy = jest.spyOn(component, 'loadProducts');
      component.currentPage = 2;
      component.totalPages = 5;

      component.goToPage(2);

      expect(component.currentPage).toBe(2);
      expect(loadProductsSpy).not.toHaveBeenCalled();
    });

    it('no deberia cambiar de página cuando la página esté por debajo de 1', () => {
      const loadProductsSpy = jest.spyOn(component, 'loadProducts');
      component.currentPage = 2;

      component.goToPage(0);

      expect(component.currentPage).toBe(2);
      expect(loadProductsSpy).not.toHaveBeenCalled();
    });

    it('no deberia cambiar de página cuando la página esté por encima de totalPages', () => {
      const loadProductsSpy = jest.spyOn(component, 'loadProducts');
      component.currentPage = 2;
      component.totalPages = 5;

      component.goToPage(6);

      expect(component.currentPage).toBe(2);
      expect(loadProductsSpy).not.toHaveBeenCalled();
    });
  });

  describe('getStatusClass', () => {
    it('deberia devolver la clase correcta para el estado en_stock', () => {
      expect(component.getStatusClass('en_stock')).toBe('bg-success');
    });

    it('deberia devolver la clase correcta para el estado agotado.', () => {
      expect(component.getStatusClass('agotado')).toBe('bg-danger');
    });

    it('deberia devolver la clase correcta para el estado en_producción', () => {
      expect(component.getStatusClass('en_produccion')).toBe('bg-warning');
    });

    it('deberia devolver la clase predeterminada para el estado desconocido.', () => {
      expect(component.getStatusClass('unknown')).toBe('bg-primary');
    });
  });

  describe('formatCurrency', () => {
    it('deberia formatear la moneda correctamente', () => {
      expect(component.formatCurrency(1000)).toBe('$1.000');
      expect(component.formatCurrency(1500.5)).toBe('$1.500,5');
    });
  });

  describe('formatDate', () => {
    it('deberia formatear la fecha correctamente', () => {
      expect(component.formatDate('2023-12-31')).toBe('31/12/2023');
    });

    it('deberia manejar fecha vacía', () => {
      expect(component.formatDate('')).toBe('');
    });
  });

  describe('getCurrentPageNumber', () => {
    it('deberia devolver el índice + 1 cuando el total de páginas es <= 5', () => {
      component.totalPages = 5;
      expect(component.getCurrentPageNumber(0)).toBe(1);
      expect(component.getCurrentPageNumber(1)).toBe(2);
      expect(component.getCurrentPageNumber(4)).toBe(5);
    });

    it('deberia devolver las páginas 1 a 5 cuando la página actual <= 3', () => {
      component.totalPages = 10;
      component.currentPage = 2;

      expect(component.getCurrentPageNumber(0)).toBe(1);
      expect(component.getCurrentPageNumber(1)).toBe(2);
      expect(component.getCurrentPageNumber(2)).toBe(3);
      expect(component.getCurrentPageNumber(3)).toBe(4);
      expect(component.getCurrentPageNumber(4)).toBe(5);
    });

    it('deberia devolver las últimas 5 páginas cuando currentpage >= totalPages - 2', () => {
      component.totalPages = 10;
      component.currentPage = 9;

      expect(component.getCurrentPageNumber(0)).toBe(6);
      expect(component.getCurrentPageNumber(1)).toBe(7);
      expect(component.getCurrentPageNumber(2)).toBe(8);
      expect(component.getCurrentPageNumber(3)).toBe(9);
      expect(component.getCurrentPageNumber(4)).toBe(10);
    });

    it('deberia devolver la página actual y 2 páginas antes/después cuando esté en el medio.', () => {
      component.totalPages = 10;
      component.currentPage = 5;

      expect(component.getCurrentPageNumber(0)).toBe(3);
      expect(component.getCurrentPageNumber(1)).toBe(4);
      expect(component.getCurrentPageNumber(2)).toBe(5);
      expect(component.getCurrentPageNumber(3)).toBe(6);
      expect(component.getCurrentPageNumber(4)).toBe(7);
    });
  });

  describe('isNumericCode', () => {
    it('deberia devolver true para cadenas numéricas', () => {
      expect(component.isNumericCode('12345')).toBe(true);
      expect(component.isNumericCode('0')).toBe(true);
      expect(component.isNumericCode('')).toBe(true); // Empty string is also considered numeric
    });

    it('deberia devolver false para cadenas que contienen caracteres no numéricos', () => {
      expect(component.isNumericCode('A123')).toBe(false);
      expect(component.isNumericCode('123A')).toBe(false);
      expect(component.isNumericCode('12 34')).toBe(false);
      expect(component.isNumericCode('12.34')).toBe(false);
    });
  });

  describe('clearFilters', () => {
    it('deberia restablecer todos los filtros y recargar los productos', () => {
      component.searchCode = '123';
      component.searchName = 'test';
      component.searchStatus = 'txt_en_stock';
      component.currentPage = 3;
      const loadProductsSpy = jest.spyOn(component, 'loadProducts');
      component.clearFilters();

      expect(component.searchCode).toBe('');
      expect(component.searchName).toBe('');
      expect(component.searchStatus).toBe('');
      expect(component.currentPage).toBe(1);
      expect(loadProductsSpy).toHaveBeenCalled();
    });
  });

  describe('handleKeyDown', () => {
    it('deberia llamar a applyFilters cuando se presiona Enter', () => {
      const applyFiltersSpy = jest.spyOn(component, 'applyFilters');
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      component.handleKeyDown(enterEvent);
      expect(applyFiltersSpy).toHaveBeenCalled();
    });

    it('no deberia llamar a applyFilters cuando se presiona otra tecla', () => {
      const applyFiltersSpy = jest.spyOn(component, 'applyFilters');
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
      component.handleKeyDown(tabEvent);
      expect(applyFiltersSpy).not.toHaveBeenCalled();
    });
  });

  describe('loadProducts state filtering', () => {
    it('deberia aplicar el filtro de estado en_produccion correctamente', () => {
      const spy = jest.spyOn(logisticaService, 'getProducts').mockReturnValue(of(mockProductsResponse));

      component.searchStatus = 'txt_en_produccion';
      component.loadProducts();

      expect(spy).toHaveBeenCalledWith(1, 10, '', '', 'en_produccion');
    });

    it('no deberia aplicar filtro de estado cuando se selecciona txt_todos', () => {
      const spy = jest.spyOn(logisticaService, 'getProducts').mockReturnValue(of(mockProductsResponse));

      component.searchStatus = 'txt_todos';
      component.loadProducts();

      expect(spy).toHaveBeenCalledWith(1, 10, '', '', '');
    });

    it('deberia filtrar código no numérico', () => {
      const spy = jest.spyOn(logisticaService, 'getProducts').mockReturnValue(of(mockProductsResponse));
      const isNumericCodeSpy = jest.spyOn(component, 'isNumericCode');

      component.searchCode = 'ABC123';
      component.loadProducts();

      expect(isNumericCodeSpy).toHaveBeenCalledWith('ABC123');
      expect(spy).toHaveBeenCalledWith(1, 10, '', '', '');
    });
  });

});
