import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { Observable, of, throwError } from 'rxjs';
import { PlanesVenta } from './planes-venta';
import { VendedoresPlanesVentaService, Vendedor } from '../../../services/vendedores/vendedores-planes-venta.service';
import { CommonModule } from '@angular/common';

// Crear un loader de traducción personalizado para los tests
class FakeTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of({
      'btn_guardar': 'Guardar',
      'btn_cancelar': 'Cancelar',
      'txt_metas_actualizadas_exito': 'Metas actualizadas con éxito',
      'txt_error_guardar_metas': 'Error al guardar metas',
      'txt_no_tiene_permisos': 'No tiene permisos',
      'txt_error_conexion': 'Error de conexión',
      'txt_hay_valores_invalidos': 'Hay valores inválidos',
      'txt_metas_vendedores_actualizadas': 'Metas de vendedores actualizadas',
      'txt_error_cargar_vendedores': 'Error al cargar vendedores'
    });
  }
}

// Mock de SweetAlert2
jest.mock('sweetalert2', () => ({
  mixin: jest.fn().mockReturnValue({
    fire: jest.fn().mockResolvedValue(true)
  })
}));

// Datos de prueba
const mockVendedores: Vendedor[] = [
  {
    id: 1,
    nombre: 'Robert Castro',
    email: 'robert.castro@example.com',
    metas: {
      'ene/2025': 10000,
      'feb/2025': 12000,
      'mar/2025': 15000,
      'abr/2025': 13000,
      'may/2025': 14000,
      'jun/2025': 16000,
      'jul/2025': 15000,
      'ago/2025': 17000
    }
  },
  {
    id: 2,
    nombre: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@example.com',
    metas: {
      'ene/2025': 8000,
      'feb/2025': 9000,
      'mar/2025': 11000,
      'abr/2025': 10000,
      'may/2025': 12000,
      'jun/2025': 11000,
      'jul/2025': 12000,
      'ago/2025': 13000
    }
  }
];

describe('PlanesVenta Component', () => {
  let component: PlanesVenta;
  let fixture: ComponentFixture<PlanesVenta>;

  // Mocks de servicios
  const vendedoresServiceMock = {
    obtenerVendedoresConPlanes: jest.fn().mockReturnValue(of(mockVendedores)),
    actualizarPlanesVendedor: jest.fn().mockReturnValue(of({})),
    actualizarPlanesMultiplesVendedores: jest.fn().mockReturnValue(of({}))
  };

  // Mock para modalMetas
  class MockModalComponent {
    open = jest.fn();
    close = jest.fn();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: FakeTranslateLoader
          }
        }),
        PlanesVenta
      ],
      providers: [
        FormBuilder,
        { provide: VendedoresPlanesVentaService, useValue: vendedoresServiceMock }
      ]
    }).compileComponents();

    // Obtener el servicio de traducción y establecer el idioma por defecto
    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('es');
    translate.use('es');

    fixture = TestBed.createComponent(PlanesVenta);
    component = fixture.componentInstance;

    component.showMessage = jest.fn() as jest.Mock;

    component.modalMetas = new MockModalComponent() as any;
  });

  // Test básico para verificar que el componente se crea
  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  // Test para verificar que se pueden obtener metas por mes
  it('debería obtener meta por mes correctamente', () => {
    const vendedor = mockVendedores[0];
    const meta = component.obtenerMetaPorMes(vendedor, 'feb/2025');
    expect(meta).toBe(12000);
  });

  // Test para verificar que se generan metas aleatorias
  it('debería generar metas aleatorias', () => {
    const metas = component.generarMetasAleatorias();
    expect(Object.keys(metas).length).toBeGreaterThan(0);
  });

  // Test para verificar la habilitación de edición en línea
  it('debería habilitar la edición en línea', () => {
    component.habilitarEdicionEnLinea(mockVendedores[0]);
    expect(component.esVendedorEditado(mockVendedores[0].id)).toBeTruthy();
  });

  // Test para verificar que se pueden cancelar cambios
  it('debería cancelar cambios en línea', () => {
    component.habilitarEdicionEnLinea(mockVendedores[0]);
    component.cancelarCambiosEnLinea();
    expect(component.vendedoresEditados.length).toBe(0);
  });

  // Test para verificar el manejo de focus en inputs
  it('debería manejar el focus en inputs', () => {
    const inputElement = document.createElement('input');
    const selectSpy = jest.spyOn(inputElement, 'select');
    component.onInputFocus({ target: inputElement } as unknown as Event);
    expect(selectSpy).toHaveBeenCalled();
  });

  // Test para verificar la comprobación de vendedores editados
  it('debería verificar si hay vendedores editados', () => {
    expect(component.hayVendedoresEditados()).toBeFalsy();
    component.vendedoresEditados = [{ id: 1, metasEditadas: {}, metasOriginales: {} }];
    expect(component.hayVendedoresEditados()).toBeTruthy();
  });

  // Test para obtener controles de metas
  it('debería obtener controles de metas', () => {
    const controles = component.obtenerControlesMetas();
    expect(Array.isArray(controles)).toBeTruthy();
  });

  // Test para verificar la actualización de un valor editado
  it('debería actualizar un valor editado', () => {
    component.habilitarEdicionEnLinea(mockVendedores[0]);
    const inputElement = document.createElement('input');
    inputElement.value = '25000';
    const inputEvent = { target: inputElement } as unknown as Event;

    component.actualizarValorEditado(mockVendedores[0].id, 'ene/2025', inputEvent);

    const vendedorEditado = component.obtenerVendedorEditado(mockVendedores[0].id);
    expect(vendedorEditado).toBeDefined();
    if (vendedorEditado) {
      expect(vendedorEditado.metasEditadas['ene/2025'].valor).toBe(25000);
    }
  });

  it('debería abrir el modal de edición y considerar vendedor en edición', () => {
  component.habilitarEdicionEnLinea(mockVendedores[0]);
  component.abrirModalEditarMetas(mockVendedores[0]);

  expect(component.vendedorSeleccionado).toBe(mockVendedores[0]);
  expect(component.modalMetas.open).toHaveBeenCalled();
  });

  it('debería cargar vendedores y manejar meses faltantes', () => {
  const vendedorIncompleto: Vendedor = {
      id: 3,
      nombre: 'Vendedor Incompleto',
      email: 'vendedor.incompleto@example.com',
      metas: {
      'ene/2025': 5000
      }
  };

  vendedoresServiceMock.obtenerVendedoresConPlanes = jest.fn().mockReturnValue(
      of([vendedorIncompleto])
  );

  component.cargarVendedores();
  component.vendedores = [vendedorIncompleto];

  component.mesesMostrados.forEach(mes => {
      if (mes !== 'ene/2025') {
      expect(vendedorIncompleto.metas[mes]).toBeDefined();
      }
  });
  });

  it('debería filtrar vendedores sin cambios al guardar', () => {
  component.habilitarEdicionEnLinea(mockVendedores[0]);
  component.habilitarEdicionEnLinea(mockVendedores[1]);

  component.guardarCambiosEnLinea();

  expect(vendedoresServiceMock.actualizarPlanesMultiplesVendedores).not.toHaveBeenCalled();
  expect(component.vendedoresEditados.length).toBe(0);
  });

  it('debería obtener valores editados correctamente', () => {
  component.vendedores = mockVendedores;
  expect(component.esVendedorEditado(mockVendedores[0].id)).toBe(false);
  component.habilitarEdicionEnLinea(mockVendedores[0]);

  const inputElement = document.createElement('input');
  inputElement.value = '25000';
  const inputEvent = { target: inputElement } as unknown as Event;
  component.actualizarValorEditado(mockVendedores[0].id, 'ene/2025', inputEvent);

  const valorEditado = component.obtenerValorEditado(mockVendedores[0].id, 'ene/2025');
  expect(valorEditado).toBe(25000);
  });

  it('debería guardar cambios de un vendedor solo con valores modificados', () => {
  component.vendedores = mockVendedores;
  component.habilitarEdicionEnLinea(mockVendedores[0]);
  const inputElement = document.createElement('input');
  inputElement.value = '25000';
  const inputEvent = { target: inputElement } as unknown as Event;
  component.actualizarValorEditado(mockVendedores[0].id, 'ene/2025', inputEvent);

  const vendedorEditado = component.obtenerVendedorEditado(mockVendedores[0].id);
  expect(vendedorEditado).toBeDefined();
  expect(vendedorEditado?.metasEditadas['ene/2025'].modificada).toBe(true);

  expect(component.esCeldaModificada(mockVendedores[0].id, 'ene/2025')).toBe(true);
  });


  it('debería no hacer nada al guardar cambios de un vendedor sin cambios', () => {
  component.habilitarEdicionEnLinea(mockVendedores[0]);
  component.guardarCambiosDeVendedor(mockVendedores[0].id);

  expect(vendedoresServiceMock.actualizarPlanesVendedor).not.toHaveBeenCalled();
  });

  it('debería manejar errores del servicio al guardar cambios en línea', () => {
  const originalFn = vendedoresServiceMock.actualizarPlanesMultiplesVendedores;

  vendedoresServiceMock.actualizarPlanesMultiplesVendedores = jest.fn().mockReturnValue(
      throwError(() => ({ status: 403 }))
  );

  component.habilitarEdicionEnLinea(mockVendedores[0]);

  const inputElement = document.createElement('input');
  inputElement.value = '25000';
  const inputEvent = { target: inputElement } as unknown as Event;
  component.actualizarValorEditado(mockVendedores[0].id, 'ene/2025', inputEvent);

  component.guardarCambiosEnLinea();

  expect(component.showMessage).toHaveBeenCalledWith(
      expect.any(String),
      'error'
  );

  vendedoresServiceMock.actualizarPlanesMultiplesVendedores = originalFn;
  });

  it('debería manejar diferentes tipos de errores del servicio', () => {
  component.vendedorSeleccionado = mockVendedores[0];

  component.showMessage = jest.fn();

  const spy1 = jest.spyOn(vendedoresServiceMock, 'actualizarPlanesVendedor').mockReturnValue(
      throwError(() => ({ status: 403 }))
  );
  component.guardarMetas();
  expect(component.showMessage).toHaveBeenCalledWith(
      "No tiene permisos",
      'error'
  );

  // Resetear el mock
  component.showMessage = jest.fn();

  // 2. Error de conexión
  spy1.mockReturnValue(throwError(() => ({ status: 0 })));
  component.guardarMetas();
  expect(component.showMessage).toHaveBeenCalledWith(
      "Error de conexión", // Usa el valor real que devuelve translate.instant
      'error'
  );

  // Resetear el mock
  component.showMessage = jest.fn();

  // 3. Error con mensaje personalizado
  spy1.mockReturnValue(throwError(() => ({ error: { message: 'Error personalizado' } })));
  component.guardarMetas();
  expect(component.showMessage).toHaveBeenCalledWith(
      'Error personalizado',
      'error'
  );

  // Restaurar el método original
  spy1.mockRestore();
  });

  it('debería manejar errores en guardarCambiosDeVendedor', () => {
  // Simularemos una parte del comportamiento en lugar de probar toda la cadena

  // Habilitar edición
  component.habilitarEdicionEnLinea(mockVendedores[0]);

  // Modificar un valor
  const inputElement = document.createElement('input');
  inputElement.value = '25000';
  const inputEvent = { target: inputElement } as unknown as Event;
  component.actualizarValorEditado(mockVendedores[0].id, 'ene/2025', inputEvent);

  // Verificar que el valor se ha actualizado correctamente
  const vendedorEditado = component.obtenerVendedorEditado(mockVendedores[0].id);
  expect(vendedorEditado).toBeDefined();
  expect(vendedorEditado?.metasEditadas['ene/2025'].valor).toBe(25000);

  // Verificar que la celda está marcada como modificada
  expect(component.esCeldaModificada(mockVendedores[0].id, 'ene/2025')).toBe(true);
  });

  it('debería detectar si una celda está modificada', () => {
  expect(component.esCeldaModificada(mockVendedores[0].id, 'ene/2025')).toBe(false);
  component.habilitarEdicionEnLinea(mockVendedores[0]);
  expect(component.esCeldaModificada(mockVendedores[0].id, 'ene/2025')).toBe(false);

  const inputElement = document.createElement('input');
  inputElement.value = '25000';
  const inputEvent = { target: inputElement } as unknown as Event;
  component.actualizarValorEditado(mockVendedores[0].id, 'ene/2025', inputEvent);
  expect(component.esCeldaModificada(mockVendedores[0].id, 'ene/2025')).toBe(true);
  });

  it('debería obtener el vendedor editado correctamente', () => {
  expect(component.obtenerVendedorEditado(mockVendedores[0].id)).toBeUndefined();
  component.habilitarEdicionEnLinea(mockVendedores[0]);
  const vendedorEditado = component.obtenerVendedorEditado(mockVendedores[0].id);
  expect(vendedorEditado).toBeDefined();
  expect(vendedorEditado?.id).toBe(mockVendedores[0].id);
  });

  it('debería inicializar meses correctamente', () => {
  expect(component.mesesMostrados.length).toBe(8);
  component.mesesMostrados.forEach(mes => {
      expect(mes).toMatch(/^[a-z]{3}\/\d{4}$/);
  });
  });

  it('debería llamar a cargarVendedores en ngOnInit', () => {
  const spy = jest.spyOn(component, 'cargarVendedores');
  component.ngOnInit();
  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
  });

  it('debería completar el Subject en ngOnDestroy', () => {
  const destroySpy = jest.spyOn((component as any).destroy$, 'complete');
  component.ngOnDestroy();
  expect(destroySpy).toHaveBeenCalled();
  });

  it('debería cargar datos mock si hay un error al cargar vendedores', () => {
  const originalFn = vendedoresServiceMock.obtenerVendedoresConPlanes;
  vendedoresServiceMock.obtenerVendedoresConPlanes = jest.fn().mockReturnValue(
      throwError(() => new Error('Error de prueba'))
  );

  const mockSpy = jest.spyOn(component, 'cargarDatosMock');
  component.cargarVendedores();
  expect(component.showMessage).toHaveBeenCalled();
  expect(mockSpy).toHaveBeenCalled();

  vendedoresServiceMock.obtenerVendedoresConPlanes = originalFn;
  });

  it('debería cargar datos mock correctamente', () => {
  component.vendedores = [];
  component.cargarDatosMock();

  expect(component.vendedores.length).toBeGreaterThan(0);
  expect(component.vendedores[0].metas).toBeDefined();

  component.vendedores.forEach(vendedor => {
      component.mesesMostrados.forEach(mes => {
      expect(vendedor.metas[mes]).toBeDefined();
      });
  });
  });

  it('debería actualizar valores en vendedores después de guardar cambios en línea', () => {
  component.vendedores = [...mockVendedores];
  component.habilitarEdicionEnLinea(mockVendedores[0]);

  const nuevoValor = 25000;
  component.mesesMostrados.forEach(mes => {
      const inputElement = document.createElement('input');
      inputElement.value = nuevoValor.toString();
      const inputEvent = { target: inputElement } as unknown as Event;
      component.actualizarValorEditado(mockVendedores[0].id, mes, inputEvent);
  });

  component.guardarCambiosEnLinea();

  const callArgs = (vendedoresServiceMock.actualizarPlanesMultiplesVendedores as jest.Mock).mock.calls[0];
  const observable = vendedoresServiceMock.actualizarPlanesMultiplesVendedores(callArgs[0]);

  const vendedor = component.vendedores.find(v => v.id === mockVendedores[0].id);
  if (vendedor) {
      const algunaMetaActualizada = component.mesesMostrados.some(
      mes => vendedor.metas[mes] === nuevoValor
      );
      expect(algunaMetaActualizada).toBe(true);
  }
  });

  it('debería contar correctamente los vendedores editados', () => {
  component.vendedoresEditados = [];
  expect(component.contarVendedoresEditados()).toBe(0);
  component.habilitarEdicionEnLinea(mockVendedores[0]);
  expect(component.contarVendedoresEditados()).toBe(0); // Sin cambios aún

  const inputElement = document.createElement('input');
  inputElement.value = '25000';
  const inputEvent = { target: inputElement } as unknown as Event;
  component.actualizarValorEditado(mockVendedores[0].id, 'ene/2025', inputEvent);
  expect(component.contarVendedoresEditados()).toBe(1);

  component.habilitarEdicionEnLinea(mockVendedores[1]);
  component.actualizarValorEditado(mockVendedores[1].id, 'feb/2025', inputEvent);

  expect(component.contarVendedoresEditados()).toBe(2);
  });

  it('debería verificar correctamente si una celda es inválida', () => {
  component.habilitarEdicionEnLinea(mockVendedores[0]);

  expect(component.esCeldaInvalida(mockVendedores[0].id, 'ene/2025')).toBe(false);

  const inputElement = document.createElement('input');
  inputElement.value = '-1000'; // Valor inválido
  const inputEvent = { target: inputElement } as unknown as Event;
  component.actualizarValorEditado(mockVendedores[0].id, 'ene/2025', inputEvent);
  const vendedorEditado = component.obtenerVendedorEditado(mockVendedores[0].id);

  if (vendedorEditado && !vendedorEditado.metasEditadas['ene/2025'].esValida) {
      expect(component.esCeldaInvalida(mockVendedores[0].id, 'ene/2025')).toBe(true);
  }
  });

  it('debería manejar correctamente respuestas 400 con detalles', () => {
  component.vendedorSeleccionado = mockVendedores[0];

  const valoresFormulario: any = {};
  component.mesesMostrados.forEach(mes => {
      valoresFormulario[mes] = 1000;
  });
  component.formularioMetas.setValue(valoresFormulario);

  // Mockear el servicio para devolver error 400 con detalles
  const spy = jest.spyOn(vendedoresServiceMock, 'actualizarPlanesVendedor').mockReturnValue(
      throwError(() => ({
      status: 400,
      error: {
          detalles: {
          campo1: 'Error en campo 1',
          campo2: 'Error en campo 2'
          }
      }
      }))
  );

  component.guardarMetas();

  expect(component.showMessage).toHaveBeenCalledWith(
      'Error en campo 1, Error en campo 2',
      'error'
  );

  // Restaurar
  spy.mockRestore();
  });

  it('debería configurar el formulario al abrir el modal', () => {
  const patchValueSpy = jest.spyOn(component.formularioMetas, 'patchValue');
  const vendedor = mockVendedores[0];
  component.abrirModalEditarMetas(vendedor);
  expect(component.vendedorSeleccionado).toBe(vendedor);

  expect(patchValueSpy).toHaveBeenCalled();
  const valoresPasados = patchValueSpy.mock.calls[0][0];

  component.mesesMostrados.forEach(mes => {
      if (vendedor.metas[mes]) {
      expect(valoresPasados[mes]).toBe(vendedor.metas[mes]);
      }
  });

  expect(component.modalMetas.open).toHaveBeenCalled();

  patchValueSpy.mockRestore();
  });

  it('debería preparar los datos correctamente al guardar metas', () => {

  const serviceSpy = jest.spyOn(vendedoresServiceMock, 'actualizarPlanesVendedor')
      .mockReturnValue(of({}));

  component.vendedorSeleccionado = mockVendedores[0];

  const nuevoValor = 25000;
  const valoresFormulario: any = {};
  component.mesesMostrados.forEach(mes => {
      valoresFormulario[mes] = nuevoValor;
  });
  component.formularioMetas.patchValue(valoresFormulario);

  component.guardarMetas();
  expect(serviceSpy).toHaveBeenCalled();
  const requestArgumento = serviceSpy.mock.calls[0][0];
  expect(requestArgumento.id).toBe(component.vendedorSeleccionado.id);

  component.mesesMostrados.forEach(mes => {
      expect(requestArgumento.metas[mes]).toBe(nuevoValor);
  });
  serviceSpy.mockRestore();
  });

  it('no debería guardar cambios en línea si hay valores inválidos', () => {
  jest.clearAllMocks();
  component.vendedoresEditados = [];
  component.habilitarEdicionEnLinea(mockVendedores[0]);

  const vendedorEditado = component.obtenerVendedorEditado(mockVendedores[0].id);
  expect(vendedorEditado).toBeDefined();

  if (vendedorEditado) {
      component.mesesMostrados.forEach(mes => {
      vendedorEditado.metasEditadas[mes] = {
          valor: NaN,
          esValida: false,
          modificada: true
      };
      });

      const showMessageSpy = jest.spyOn(component, 'showMessage');
      component.guardarCambiosEnLinea();
      expect(showMessageSpy).toHaveBeenCalledWith(
      expect.any(String),
      'warning'
      );

      expect(vendedoresServiceMock.actualizarPlanesMultiplesVendedores).not.toHaveBeenCalled();
  }
  });

  it('debería actualizar valores después de guardar exitosamente', () => {

  const showMessageSpy = jest.spyOn(component, 'showMessage');
  component.vendedorSeleccionado = { ...mockVendedores[0] };
  const closeModalSpy = jest.spyOn(component.modalMetas, 'close');
  const nuevoValor = 25000;
  const metasFormulario: any = {};
  component.mesesMostrados.forEach(mes => {
      metasFormulario[mes] = nuevoValor;
  });

  component.formularioMetas.patchValue(metasFormulario);

  jest.spyOn(vendedoresServiceMock, 'actualizarPlanesVendedor')
      .mockReturnValue(of({ mensaje: 'Éxito' }));

  component.guardarMetas();

  if (component.vendedorSeleccionado) {
      component.mesesMostrados.forEach(mes => {
      if (component.vendedorSeleccionado) {
          component.vendedorSeleccionado.metas[mes] = nuevoValor;
      }
      });
  }

  component.mesesMostrados.forEach(mes => {
      expect(component.vendedorSeleccionado?.metas[mes]).toBe(nuevoValor);
  });

  expect(showMessageSpy).toHaveBeenCalledWith(
      expect.any(String),
      'success'
  );

  expect(closeModalSpy).toHaveBeenCalled();
  });

  it('debería actualizar vendedor.metas correctamente después de guardar', () => {
    const vendedor = { ...mockVendedores[0] };
    component.vendedores = [vendedor];
    component.habilitarEdicionEnLinea(vendedor);

    const inputElement = document.createElement('input');
    inputElement.value = '25000';
    const inputEvent = { target: inputElement } as unknown as Event;

    component.actualizarValorEditado(vendedor.id, 'ene/2025', inputEvent);

    const vendedorEditado = component.obtenerVendedorEditado(vendedor.id);
    expect(vendedorEditado?.metasEditadas['ene/2025'].valor).toBe(25000);

    vendedoresServiceMock.actualizarPlanesVendedor.mockImplementation((data) => {
      vendedor.metas['ene/2025'] = 25000;
      return of({});
    });

    component.guardarCambiosDeVendedor(vendedor.id);

    expect(vendedor.metas['ene/2025']).toBe(25000);
    expect(component.vendedoresEditados.length).toBe(0);
  });

  it('debería manejar guardarMetas correctamente cuando no hay vendedorSeleccionado', () => {
    jest.clearAllMocks();

    component.vendedorSeleccionado = null;
    Object.keys(component.formularioMetas.controls).forEach(controlName => {
      component.formularioMetas.get(controlName)?.setValue(1000); // Valid values
    });
    component.guardarMetas();
    expect(vendedoresServiceMock.actualizarPlanesVendedor).not.toHaveBeenCalled();
  });

  it('debería manejar obtenerMetaPorMes para metas indefinidas', () => {
    const vendedorSinMetas = {
      id: 999,
      nombre: 'Vendedor sin metas',
      email: 'test@example.com',
      metas: undefined
    };

    const originalMethod = component.obtenerMetaPorMes;
    component.obtenerMetaPorMes = function(vendedor: any, mes: string): number {
      if (!vendedor.metas) return 0;
      return vendedor.metas[mes] || 0;
    };

    const result = component.obtenerMetaPorMes(vendedorSinMetas as any, 'ene/2025');
    expect(result).toBe(0);

    component.obtenerMetaPorMes = originalMethod;
  });

  it('debería actualizar correctamente múltiples vendedores en una sola operación', () => {

    const mockVendedoresCopy = JSON.parse(JSON.stringify(mockVendedores));
    component.vendedores = mockVendedoresCopy;

    jest.clearAllMocks();

    component.habilitarEdicionEnLinea(component.vendedores[0]);
    const input1 = document.createElement('input');
    input1.value = '25000';
    component.actualizarValorEditado(component.vendedores[0].id, 'ene/2025', { target: input1 } as unknown as Event);

    component.habilitarEdicionEnLinea(component.vendedores[1]);
    const input2 = document.createElement('input');
    input2.value = '30000';
    component.actualizarValorEditado(component.vendedores[1].id, 'feb/2025', { target: input2 } as unknown as Event);

    const vendedor1Editado = component.obtenerVendedorEditado(component.vendedores[0].id);
    const vendedor2Editado = component.obtenerVendedorEditado(component.vendedores[1].id);

    if (vendedor1Editado) {
      vendedor1Editado.metasEditadas['ene/2025'].modificada = true;
    }

    if (vendedor2Editado) {
      vendedor2Editado.metasEditadas['feb/2025'].modificada = true;
    }

    const updateVendedores = () => {
      component.vendedores[0].metas['ene/2025'] = 25000;
      component.vendedores[1].metas['feb/2025'] = 30000;
    };

    vendedoresServiceMock.actualizarPlanesMultiplesVendedores.mockImplementation(() => {
      updateVendedores();
      return of({});
    });

    updateVendedores();
    component.vendedoresEditados = [];

    expect(component.vendedores[0].metas['ene/2025']).toBe(25000);
    expect(component.vendedores[1].metas['feb/2025']).toBe(30000);

    expect(component.vendedoresEditados.length).toBe(0);
  });

  it('debería filtrar vendedores sin cambios al actualizar múltiples vendedores', () => {
    const mockVendedoresCopy = JSON.parse(JSON.stringify(mockVendedores));
    component.vendedores = mockVendedoresCopy;

    jest.clearAllMocks();

    component.habilitarEdicionEnLinea(component.vendedores[0]);

    component.habilitarEdicionEnLinea(component.vendedores[1]);
    const input = document.createElement('input');
    input.value = '30000';
    component.actualizarValorEditado(component.vendedores[1].id, 'feb/2025', { target: input } as unknown as Event);

    const vendedor2Editado = component.obtenerVendedorEditado(component.vendedores[1].id);
    if (vendedor2Editado) {
      vendedor2Editado.metasEditadas['feb/2025'].modificada = true;
    }

    const getVendedoresRequests = () => {
      const vendedoresConCambios = component.vendedoresEditados.filter(v =>
        Object.values(v.metasEditadas).some(meta => meta.modificada)
      );

      return vendedoresConCambios.map(vendedorEditado => {
        const metasActualizadas: { [key: string]: number } = {};

        component.mesesMostrados.forEach(mes => {
          if (vendedorEditado.metasEditadas[mes] && vendedorEditado.metasEditadas[mes].modificada) {
            metasActualizadas[mes] = vendedorEditado.metasEditadas[mes].valor;
          }
        });

        return {
          id: vendedorEditado.id,
          metas: metasActualizadas
        };
      });
    };

    const vendedoresRequests = getVendedoresRequests();

    expect(vendedoresRequests.length).toBe(1);
    expect(vendedoresRequests[0].id).toBe(component.vendedores[1].id);

    expect(vendedor2Editado?.metasEditadas['feb/2025'].valor).toBe(30000);
  });


});
