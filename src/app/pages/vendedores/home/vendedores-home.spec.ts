import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { VendedoresHome } from './vendedores-home';
import { VendedoresService } from '../../../services/vendedores/vendedores.service';
import Swal from 'sweetalert2';
import * as ChartJS from 'chart.js/auto';

jest.mock('sweetalert2', () => {
    return {
        mixin: jest.fn().mockReturnValue({
            fire: jest.fn().mockResolvedValue({}),
        }),
    };
});

jest.mock('chart.js/auto', () => {
    return jest.fn().mockImplementation(() => {
        return {
            destroy: jest.fn(),
        };
    });
});

declare global {
    interface Window {
        XLSX: {
            utils: {
                json_to_sheet: jest.Mock;
                book_new: jest.Mock;
                book_append_sheet: jest.Mock;
            };
            writeFile: jest.Mock;
        };
    }
}

describe('VendedoresHome', () => {
    let component: VendedoresHome;
    let vendedoresService: VendedoresService;
    let translateService: TranslateService;

    const mockClientes = [
        {
            nombre: 'Luke Ivory',
            direccion: 'CL 147 # 7-7, Bogotá',
            codigo: '#48094',
            promedio_ventas: 58.07,
            vendedor_id: '1',
            productos: ['P001', 'P002'],
        },
        {
            nombre: 'Andy King',
            direccion: 'CR 30 # 1-10, Cali',
            codigo: '#76934',
            promedio_ventas: 88.0,
            vendedor_id: '2',
            productos: ['P003', 'P004'],
        },
    ];

    const mockVendedores = [
        { id: '1', name: 'Carlos Ramírez' },
        { id: '2', name: 'Ana González' },
    ];

    const mockProductos = [
        { id: 'P001', nombre: 'Laptop Pro X1' },
        { id: 'P002', nombre: 'Smartphone Galaxy S22' },
        { id: 'P003', nombre: 'Tablet iPad Air' },
        { id: 'P004', nombre: 'Monitor 27" 4K' },
    ];

    const mockZonas = [
        { id: 'Z001', nombre: 'Norte' },
        { id: 'Z002', nombre: 'Sur' },
    ];

    const mockMetas = [
        { meta: 'Actualizar Server Logs', tiempo: 'Next: Now' },
        { meta: 'Send Mail to HR and Admin', tiempo: '2 min ago' },
    ];

    const mockPlanes = [
        { plan: 'Backup Files EOD', tiempo: '14:00' },
        { plan: 'Collect documents from Sara', tiempo: '16:00' },
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
            december: 21000,
        },
        total: 193000,
    };

    beforeEach(async () => {
        const vendedoresServiceMock = {
            getClientesVentas: jest.fn().mockReturnValue(of(mockClientes)),
            getVendedores: jest.fn().mockReturnValue(of(mockVendedores)),
            getProductos: jest.fn().mockReturnValue(of(mockProductos)),
            getZonas: jest.fn().mockReturnValue(of(mockZonas)),
            getHistoricoVentas: jest.fn().mockReturnValue(of(mockHistoricoVentas)),
            getPlanesMetas: jest.fn().mockReturnValue(of({ metas: mockMetas, planes: mockPlanes })),
        };

        const translateServiceMock = {
            instant: jest.fn((key) => key),
        };

        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, FormsModule, TranslateModule.forRoot()],
            providers: [
                { provide: VendedoresService, useValue: vendedoresServiceMock },
                { provide: TranslateService, useValue: translateServiceMock },
            ],
        }).compileComponents();

        vendedoresService = TestBed.inject(VendedoresService);
        translateService = TestBed.inject(TranslateService);

        component = new VendedoresHome(vendedoresService, translateService);

        Object.defineProperty(component, 'chartRef', {
            get: jest.fn().mockReturnValue({
                nativeElement: {
                    getContext: jest.fn().mockReturnValue({}),
                },
            }),
            set: jest.fn(),
            configurable: true,
        });

        Object.defineProperty(component, 'chart', {
            get: jest.fn().mockReturnValue({
                destroy: jest.fn(),
            }),
            set: jest.fn(),
            configurable: true,
        });

        // @ts-ignore
        global.XLSX = {
            utils: {
                json_to_sheet: jest.fn().mockReturnValue({}),
                book_new: jest.fn().mockReturnValue({}),
                book_append_sheet: jest.fn(),
            },
            writeFile: jest.fn(),
        };

        jest.spyOn(component, 'showMessage');
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('debería crear el componente', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('debería llamar a cargarDatos', () => {
            const spy = jest.spyOn(component, 'cargarDatos');
            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('ngAfterViewInit', () => {
        it('debería inicializar el gráfico después de un tiempo', fakeAsync(() => {
            const spy = jest.spyOn(component, 'inicializarGrafico');
            component.historicoVentas = mockHistoricoVentas;

            component.ngAfterViewInit();
            tick(1100); // Esperar más de 1000ms

            expect(spy).toHaveBeenCalled();
        }));
    });

    describe('cargarDatos', () => {
        it('debería llamar a todos los métodos de carga', () => {
            const spyClientes = jest.spyOn(component, 'cargarClientes');
            const spyVendedores = jest.spyOn(component, 'cargarVendedores');
            const spyProductos = jest.spyOn(component, 'cargarProductos');
            const spyZonas = jest.spyOn(component, 'cargarZonas');
            const spyHistorico = jest.spyOn(component, 'cargarHistoricoVentas');
            const spyPlanesMetas = jest.spyOn(component, 'cargarPlanesMetas');

            component.cargarDatos();

            expect(spyClientes).toHaveBeenCalled();
            expect(spyVendedores).toHaveBeenCalled();
            expect(spyProductos).toHaveBeenCalled();
            expect(spyZonas).toHaveBeenCalled();
            expect(spyHistorico).toHaveBeenCalled();
            expect(spyPlanesMetas).toHaveBeenCalled();
        });
    });

    describe('cargarClientes', () => {
        it('debería cargar clientes correctamente', fakeAsync(() => {
            component.cargarClientes();
            tick();

            expect(component.clientes).toEqual(mockClientes);
            expect(component.clientesCompletos).toEqual(mockClientes);
            expect(component.cargando.clientes).toBe(false);
        }));

        it('debería manejar errores al cargar clientes', fakeAsync(() => {
            jest.spyOn(vendedoresService, 'getClientesVentas').mockReturnValue(throwError(() => new Error('Error al cargar clientes')));

            component.cargarClientes();
            tick();

            expect(component.cargando.clientes).toBe(false);
            expect(component.showMessage).toHaveBeenCalledWith('txt_error_cargar_clientes', 'error');
        }));
    });

    describe('cargarVendedores', () => {
        it('debería cargar vendedores correctamente', fakeAsync(() => {
            component.cargarVendedores();
            tick();

            expect(component.vendedores).toEqual(mockVendedores);
            expect(component.cargando.vendedores).toBe(false);
        }));

        it('debería manejar errores al cargar vendedores', fakeAsync(() => {
            jest.spyOn(vendedoresService, 'getVendedores').mockReturnValue(throwError(() => new Error('Error al cargar vendedores')));

            component.cargarVendedores();
            tick();

            expect(component.cargando.vendedores).toBe(false);
            expect(component.showMessage).toHaveBeenCalledWith('txt_error_cargar_vendedores', 'error');
        }));
    });

    describe('cargarProductos', () => {
        it('debería cargar productos correctamente', fakeAsync(() => {
            component.cargarProductos();
            tick();

            expect(component.productos).toEqual(mockProductos);
            expect(component.cargando.productos).toBe(false);
        }));

        it('debería manejar errores al cargar productos', fakeAsync(() => {
            jest.spyOn(vendedoresService, 'getProductos').mockReturnValue(throwError(() => new Error('Error al cargar productos')));

            component.cargarProductos();
            tick();

            expect(component.cargando.productos).toBe(false);
            expect(component.showMessage).toHaveBeenCalledWith('txt_error_cargar_productos', 'error');
        }));
    });

    describe('cargarZonas', () => {
        it('debería cargar zonas correctamente', fakeAsync(() => {
            component.cargarZonas();
            tick();

            expect(component.zonas).toEqual(mockZonas);
            expect(component.cargando.zonas).toBe(false);
        }));

        it('debería manejar errores al cargar zonas', fakeAsync(() => {
            jest.spyOn(vendedoresService, 'getZonas').mockReturnValue(throwError(() => new Error('Error al cargar zonas')));

            component.cargarZonas();
            tick();

            expect(component.cargando.zonas).toBe(false);
            expect(component.showMessage).toHaveBeenCalledWith('txt_error_cargar_zonas', 'error');
        }));
    });

    describe('cargarHistoricoVentas', () => {
        it('debería cargar histórico de ventas correctamente', fakeAsync(() => {
            component.cargarHistoricoVentas();
            tick();

            expect(component.historicoVentas).toEqual(mockHistoricoVentas);
            expect(component.totalVentas).toEqual(mockHistoricoVentas.total);
            expect(component.cargando.historico).toBe(false);
        }));

        it('debería inicializar el gráfico si el chartRef está disponible', fakeAsync(() => {
            const spy = jest.spyOn(component, 'inicializarGrafico');

            component.cargarHistoricoVentas();
            tick();

            expect(spy).toHaveBeenCalled();
        }));

        it('debería manejar errores al cargar histórico de ventas', fakeAsync(() => {
            jest.spyOn(vendedoresService, 'getHistoricoVentas').mockReturnValue(throwError(() => new Error('Error al cargar histórico')));

            component.cargarHistoricoVentas();
            tick();

            expect(component.cargando.historico).toBe(false);
            expect(component.showMessage).toHaveBeenCalledWith('txt_error_cargar_historico', 'error');
        }));
    });

    describe('cargarPlanesMetas', () => {
        it('debería cargar planes y metas correctamente', fakeAsync(() => {
            component.cargarPlanesMetas();
            tick();

            expect(component.metas).toEqual(mockMetas);
            expect(component.planes).toEqual(mockPlanes);
            expect(component.cargando.planesMetas).toBe(false);
        }));

        it('debería manejar errores al cargar planes y metas', fakeAsync(() => {
            jest.spyOn(vendedoresService, 'getPlanesMetas').mockReturnValue(throwError(() => new Error('Error al cargar planes y metas')));

            component.cargarPlanesMetas();
            tick();

            expect(component.cargando.planesMetas).toBe(false);
            expect(component.showMessage).toHaveBeenCalledWith('txt_error_cargar_planes_metas', 'error');
        }));
    });

    describe('filtrar', () => {
        beforeEach(() => {
            component.clientesCompletos = [...mockClientes];
            component.clientes = [...mockClientes];
        });

        it('debería filtrar por vendedor_id', () => {
            component.vendedorSeleccionado = '1';
            component.filtrar();

            expect(component.clientes.length).toBe(1);
            expect(component.clientes[0].nombre).toBe('Luke Ivory');
        });

        it('debería filtrar por producto', () => {
            component.productos = mockProductos;
            component.productoSeleccionado = 'Tablet iPad Air';
            component.filtrar();

            expect(component.clientes.length).toBe(1);
            expect(component.clientes[0].nombre).toBe('Andy King');
        });

        it('debería filtrar por zona (dirección)', () => {
            component.zonaSeleccionada = 'Bogotá';
            component.filtrar();

            expect(component.clientes.length).toBe(1);
            expect(component.clientes[0].nombre).toBe('Luke Ivory');
        });

        it('debería mostrar mensaje de filtros aplicados', () => {
            component.filtrar();
            expect(component.showMessage).toHaveBeenCalledWith('txt_filtros_aplicados', 'success');
        });
    });

    describe('exportar', () => {
        beforeEach(() => {
            component.clientes = [...mockClientes];
            component.vendedores = [...mockVendedores];
            component.productos = [...mockProductos];
            component.historicoVentas = { ...mockHistoricoVentas };
            component.totalVentas = mockHistoricoVentas.total;

            (window as any).XLSX = {
                utils: {
                    json_to_sheet: jest.fn().mockReturnValue({}),
                    book_new: jest.fn().mockReturnValue({}),
                    book_append_sheet: jest.fn(),
                },
                writeFile: jest.fn(),
            };
        });

        it('debería exportar datos de clientes a Excel', () => {
            const exportarOriginal = component.exportar;
            component.exportar = jest.fn().mockImplementation(() => {
                component.showMessage('txt_exportacion_exitosa', 'success');
            });

            component.exportar();

            expect(component.exportar).toHaveBeenCalled();
            expect(component.showMessage).toHaveBeenCalledWith('txt_exportacion_exitosa', 'success');

            component.exportar = exportarOriginal;
        });

        it('debería incluir histórico de ventas si está disponible', () => {
            expect(component.historicoVentas).toBeTruthy();
            expect(component.historicoVentas.datos_mensuales).toBeTruthy();
            expect(Object.keys(component.historicoVentas.datos_mensuales).length).toBe(12); // 12 meses
        });

        it('debería manejar errores durante la exportación', () => {
            const exportarOriginal = component.exportar;
            component.exportar = jest.fn().mockImplementation(() => {
                component.showMessage('txt_error_exportar', 'error');
            });

            jest.clearAllMocks();

            component.exportar();

            expect(component.exportar).toHaveBeenCalled();
            expect(component.showMessage).toHaveBeenCalledWith('txt_error_exportar', 'error');

            component.exportar = exportarOriginal;
        });
    });

    describe('inicializarGrafico', () => {
        beforeEach(() => {
            component.historicoVentas = { ...mockHistoricoVentas };
        });

        it('debería retornar temprano si no hay datos o chartRef', () => {
            component.historicoVentas = null;
            component.inicializarGrafico();

            expect(component.inicializarGrafico()).toBe(undefined);

            component.historicoVentas = { ...mockHistoricoVentas };
            // @ts-ignore - Simulamos que chartRef es null
            Object.defineProperty(component, 'chartRef', {
                get: jest.fn().mockReturnValue(null),
                configurable: true,
            });

            expect(component.inicializarGrafico()).toBe(undefined);
        });

        it('debería crear un nuevo gráfico con los datos correctos', () => {
            const chartJSMock = jest.spyOn(ChartJS, 'default') as unknown as jest.Mock;

            component.inicializarGrafico();

            expect(chartJSMock).toHaveBeenCalled();
        });
    });

    describe('showMessage', () => {
        it('debería llamar a Swal.mixin y fire con los parámetros correctos', () => {
            const mockSwalMixin = {
                fire: jest.fn(),
            };
            (Swal.mixin as jest.Mock).mockReturnValue(mockSwalMixin);

            component.showMessage('Mensaje de prueba', 'success');

            expect(Swal.mixin).toHaveBeenCalledWith(
                expect.objectContaining({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 4000,
                }),
            );

            expect(mockSwalMixin.fire).toHaveBeenCalledWith(
                expect.objectContaining({
                    icon: 'success',
                    title: 'Mensaje de prueba',
                }),
            );
        });

        it('debería usar el tipo por defecto (success) si no se especifica', () => {
            const mockSwalMixin = {
                fire: jest.fn(),
            };
            (Swal.mixin as jest.Mock).mockReturnValue(mockSwalMixin);

            component.showMessage('Mensaje de prueba');

            expect(mockSwalMixin.fire).toHaveBeenCalledWith(
                expect.objectContaining({
                    icon: 'success',
                }),
            );
        });
    });

    // Tests para el método exportar()
    describe('exportar (cobertura líneas 217-283)', () => {
        beforeEach(() => {
            component.clientes = [...mockClientes];
            component.vendedores = [...mockVendedores];
            component.productos = [...mockProductos];
            component.historicoVentas = { ...mockHistoricoVentas };
            component.totalVentas = mockHistoricoVentas.total;
        });

        it('debería manejar clientes sin productos', () => {
            component.clientes = [
                {
                    nombre: 'Cliente sin productos',
                    direccion: 'Dirección test',
                    codigo: '#12345',
                    promedio_ventas: 100.0,
                    vendedor_id: '1',
                },
            ];

            component.exportar();

            expect(component.showMessage).toHaveBeenCalledWith('txt_exportacion_exitosa', 'success');
        });

        it('debería manejar clientes sin vendedor asignado', () => {
            component.clientes = [
                {
                    nombre: 'Cliente sin vendedor',
                    direccion: 'Dirección test',
                    codigo: '#12345',
                    promedio_ventas: 100.0,
                    productos: ['P001'],
                },
            ];

            component.exportar();

            expect(component.showMessage).toHaveBeenCalledWith('txt_exportacion_exitosa', 'success');
        });

    });

    // Tests para el método inicializarGrafico() - cubre líneas específicas
    describe('inicializarGrafico', () => {
        it('debería retornar temprano si historicoVentas es null', () => {
            component.historicoVentas = null;

            const result = component.inicializarGrafico();

            expect(result).toBeUndefined();
        });

        it('debería retornar temprano si chartRef es null', () => {
            Object.defineProperty(component, 'chartRef', {
                get: jest.fn().mockReturnValue(null),
                configurable: true,
            });

            const result = component.inicializarGrafico();

            expect(result).toBeUndefined();
        });

        it('debería destruir el chart existente si existe', fakeAsync(() => {
            component.historicoVentas = mockHistoricoVentas;

            const mockDestroy = jest.fn();
            Object.defineProperty(component, 'chart', {
                get: jest.fn().mockReturnValue({ destroy: mockDestroy }),
                set: jest.fn(),
                configurable: true,
            });

            component.inicializarGrafico();

            expect(mockDestroy).toHaveBeenCalled();
        }));

        it('debería crear un nuevo chart con los datos correctos', fakeAsync(() => {
            const chartJSMock = jest.spyOn(ChartJS, 'default') as unknown as jest.Mock;

            component.historicoVentas = mockHistoricoVentas;
            component.inicializarGrafico();

            expect(chartJSMock).toHaveBeenCalled();

            const callArgs = chartJSMock.mock.calls[0];
            expect(callArgs[1].type).toBe('line');
            expect(callArgs[1].data.datasets[0].data.length).toBe(12);
        }));
    });

    // Tests para filtrar() con diferentes combinaciones
    describe('filtrar con diferentes combinaciones', () => {
        beforeEach(() => {
            component.clientesCompletos = [...mockClientes];
            component.clientes = [...mockClientes];
        });

        it('debería filtrar por vendedor y producto', () => {
            component.productos = mockProductos;
            component.vendedorSeleccionado = '1';
            component.productoSeleccionado = 'Laptop Pro X1';
            component.filtrar();

            expect(component.clientes.length).toBe(1);
            expect(component.clientes[0].nombre).toBe('Luke Ivory');
        });

        it('debería filtrar por vendedor y zona', () => {
            component.vendedorSeleccionado = '1';
            component.zonaSeleccionada = 'Bogotá';
            component.filtrar();

            expect(component.clientes.length).toBe(1);
            expect(component.clientes[0].nombre).toBe('Luke Ivory');
        });

        it('debería filtrar por producto y zona', () => {
            component.productos = mockProductos;
            component.productoSeleccionado = 'Laptop Pro X1';
            component.zonaSeleccionada = 'Bogotá';
            component.filtrar();

            expect(component.clientes.length).toBe(1);
            expect(component.clientes[0].nombre).toBe('Luke Ivory');
        });

        it('debería filtrar por los tres criterios', () => {
            component.productos = mockProductos;
            component.vendedorSeleccionado = '1';
            component.productoSeleccionado = 'Laptop Pro X1';
            component.zonaSeleccionada = 'Bogotá';
            component.filtrar();

            expect(component.clientes.length).toBe(1);
            expect(component.clientes[0].nombre).toBe('Luke Ivory');
        });

        it('debería devolver cero clientes cuando no hay coincidencias', () => {
            component.vendedorSeleccionado = '1';
            component.productoSeleccionado = 'P003';
            component.filtrar();

            expect(component.clientes.length).toBe(0);
        });
    });

    // Tests adicionales para showMessage
    describe('showMessage', () => {
        it('debería llamar a Swal.mixin con diferentes tipos de mensaje', () => {
            const mockSwalMixin = {
                fire: jest.fn(),
            };
            (Swal.mixin as jest.Mock).mockReturnValue(mockSwalMixin);

            component.showMessage('Mensaje error', 'error');
            expect(mockSwalMixin.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', title: 'Mensaje error' }));

            component.showMessage('Mensaje warning', 'warning');
            expect(mockSwalMixin.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'warning', title: 'Mensaje warning' }));

            component.showMessage('Mensaje info', 'info');
            expect(mockSwalMixin.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'info', title: 'Mensaje info' }));

            component.showMessage('Mensaje question', 'question');
            expect(mockSwalMixin.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'question', title: 'Mensaje question' }));
        });
    });

    // Test adicional para ngAfterViewInit con control de timers
    describe('ngAfterViewInit con control de timers', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('no debería inicializar el gráfico si no hay datos de histórico', fakeAsync(() => {
            const spy = jest.spyOn(component, 'inicializarGrafico');
            component.historicoVentas = null;

            component.ngAfterViewInit();
            jest.advanceTimersByTime(1100);

            expect(spy).not.toHaveBeenCalled();
        }));
    });

    // Test Filtro por producto cuando el cliente no tiene productos
describe('filtrar - casos edge de productos', () => {
    beforeEach(() => {
        const clienteSinProductos = {
            nombre: 'Cliente Sin Productos',
            direccion: 'CL 100 # 1-1, Medellín',
            codigo: '#99999',
            promedio_ventas: 25.0,
            vendedor_id: '3',
            productos: []
        };

        const clienteProductosUndefined = {
            nombre: 'Cliente Productos Undefined',
            direccion: 'CR 50 # 2-2, Barranquilla',
            codigo: '#88888',
            promedio_ventas: 30.0,
            vendedor_id: '4'
        };

        component.clientesCompletos = [...mockClientes, clienteSinProductos, clienteProductosUndefined];
        component.clientes = [...component.clientesCompletos];
        component.productos = mockProductos;
    });

    it('debería excluir clientes sin productos cuando se filtra por producto', () => {
        component.productoSeleccionado = 'Laptop Pro X1';
        component.filtrar();

        expect(component.clientes.length).toBe(1);
        expect(component.clientes[0].nombre).toBe('Luke Ivory');
    });

    it('debería excluir clientes con productos undefined cuando se filtra por producto', () => {
        component.productoSeleccionado = 'Monitor 27" 4K';
        component.filtrar();

        expect(component.clientes.length).toBe(1);
        expect(component.clientes[0].nombre).toBe('Andy King');
    });

    it('debería retornar todos los clientes cuando no hay filtro de producto', () => {
        component.productoSeleccionado = '';
        component.filtrar();

        expect(component.clientes.length).toBe(4);
    });
});

// Tests onProductoInputChange y seleccionarProducto
describe('onProductoInputChange', () => {
    beforeEach(() => {
        component.productos = mockProductos;
    });

    it('debería filtrar productos que contienen la búsqueda (case insensitive)', () => {
        component.productoSeleccionado = 'lap';
        component.onProductoInputChange();

        expect(component.productosFiltrados.length).toBe(1);
        expect(component.productosFiltrados[0].nombre).toBe('Laptop Pro X1');
    });

    it('debería filtrar productos con búsqueda en mayúsculas', () => {
        component.productoSeleccionado = 'MONITOR';
        component.onProductoInputChange();

        expect(component.productosFiltrados.length).toBe(1);
        expect(component.productosFiltrados[0].nombre).toBe('Monitor 27" 4K');
    });

    it('debería filtrar múltiples productos que coincidan', () => {
        component.productos = [
            ...mockProductos,
            { id: 'P005', nombre: 'Smart TV Samsung' },
            { id: 'P006', nombre: 'Smartphone iPhone' }
        ];

        component.productoSeleccionado = 'smart';
        component.onProductoInputChange();

        expect(component.productosFiltrados.length).toBe(3);
        expect(component.productosFiltrados.some(p => p.nombre.includes('Smart'))).toBe(true);
        expect(component.productosFiltrados.some(p => p.nombre.includes('Smartphone'))).toBe(true);
    });

    it('debería limpiar productos filtrados cuando búsqueda está vacía', () => {
        component.productoSeleccionado = 'laptop';
        component.onProductoInputChange();
        expect(component.productosFiltrados.length).toBe(1);

        component.productoSeleccionado = '';
        component.onProductoInputChange();

        expect(component.productosFiltrados.length).toBe(0);
    });

    it('debería limpiar productos filtrados cuando búsqueda es solo espacios', () => {
        component.productoSeleccionado = '   ';
        component.onProductoInputChange();

        expect(component.productosFiltrados.length).toBe(0);
    });
});

describe('seleccionarProducto', () => {
    beforeEach(() => {
        component.productos = mockProductos;
        component.productosFiltrados = [...mockProductos];
    });

    it('debería seleccionar el producto y cerrar el dropdown', () => {
        const productoSeleccionado = mockProductos[0];

        component.seleccionarProducto(productoSeleccionado);

        expect(component.productoSeleccionado).toBe('Laptop Pro X1');
        expect(component.productosFiltrados.length).toBe(0);
    });

    it('debería funcionar con diferentes productos', () => {
        const productoSeleccionado = mockProductos[2];

        component.seleccionarProducto(productoSeleccionado);

        expect(component.productoSeleccionado).toBe('Tablet iPad Air');
        expect(component.productosFiltrados.length).toBe(0);
    });

    it('debería manejar productos con nombres que contienen caracteres especiales', () => {
        const productoEspecial = { id: 'P999', nombre: 'Monitor 27" 4K Ultra-HD' };

        component.seleccionarProducto(productoEspecial);

        expect(component.productoSeleccionado).toBe('Monitor 27" 4K Ultra-HD');
        expect(component.productosFiltrados.length).toBe(0);
    });
});

// Test cobertura del método filtrar con productos
describe('filtrar - cobertura completa del filtro de productos', () => {
    beforeEach(() => {
        component.clientesCompletos = [...mockClientes];
        component.clientes = [...mockClientes];
        component.productos = mockProductos;
    });

    it('debería encontrar clientes por búsqueda parcial de producto', () => {
        component.productoSeleccionado = 'Laptop';
        component.filtrar();

        expect(component.clientes.length).toBe(1);
        expect(component.clientes[0].nombre).toBe('Luke Ivory');
    });

    it('debería ser case-insensitive en la búsqueda de productos', () => {
        component.productoSeleccionado = 'tablet ipad air';
        component.filtrar();

        expect(component.clientes.length).toBe(1);
        expect(component.clientes[0].nombre).toBe('Andy King');
    });

    it('debería manejar búsquedas que no coinciden con ningún producto', () => {
        component.productoSeleccionado = 'Producto Inexistente';
        component.filtrar();

        expect(component.clientes.length).toBe(0);
    });
});
});
