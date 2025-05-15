import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { EventEmitter } from '@angular/core';

import { PlanificacionRutas } from './planificacion-rutas';
import { LogisticaService } from '../../../services/logistica/planificacion-rutas-service';

describe('PlanificacionRutas', () => {
  let component: PlanificacionRutas;
  let fixture: ComponentFixture<PlanificacionRutas>;
  let logisticaService: LogisticaService;
  let translateService: TranslateService;

  // Mock para SweetAlert2
  const mockSwal = {
    fire: jest.fn().mockResolvedValue({}),
    mixin: jest.fn().mockReturnThis()
  } as any;

  const mockCamiones = {
    total: 2,
    camiones: [
      {
        id: 1,
        placa: 'ABC123',
        marca: 'Mercedes',
        modelo: 'Actros',
        capacidad_carga_toneladas: 20,
        volumen_carga_metros_cubicos: 30,
        estado_enrutamiento: 'Sin ruta'
      },
      {
        id: 2,
        placa: 'XYZ789',
        marca: 'Volvo',
        modelo: 'FH16',
        capacidad_carga_toneladas: 25,
        volumen_carga_metros_cubicos: 35,
        estado_enrutamiento: 'Enrutado'
      }
    ]
  };

  const mockRespuestaEnrutamiento = {
    mensajes: ['Camión ABC123 enrutado correctamente', 'Se han asignado 1 rutas']
  };

  beforeEach(async () => {
    const logisticaServiceSpy = {
      obtenerCamiones: jest.fn(() => ({
        subscribe: (callbacks: any) => {
          callbacks.next(mockCamiones);
          return { unsubscribe: jest.fn() };
        }
      })),
      asignarRuta: jest.fn(() => ({
        subscribe: (callbacks: any) => {
          callbacks.next(mockRespuestaEnrutamiento);
          return { unsubscribe: jest.fn() };
        }
      }))
    };

    const translateServiceSpy = {
      instant: jest.fn((key) => {
        const traducciones: Record<string, string> = {
          'txt_estado_enrutado': 'Routed',
          'txt_estado_sin_ruta': 'Without route',
          'txt_estado_sin_entregas_programadas': 'No scheduled deliveries',
          'txt_error_cargar_camiones': 'Error loading trucks',
          'txt_camiones_enrutados_exitosamente': 'Trucks successfully routed',
          'txt_error_desconocido': 'Unknown error',
          'msg_no_tiene_permisos': 'No permissions',
          'msg_error_conexion': 'Connection error'
        };
        return traducciones[key] || key;
      }),
      get: jest.fn((key) => {
        const traducciones: Record<string, string> = {
          'txt_estado_enrutado': 'Routed',
          'txt_estado_sin_ruta': 'Without route',
          'txt_estado_sin_entregas_programadas': 'No scheduled deliveries',
          'txt_error_cargar_camiones': 'Error loading trucks',
          'txt_camiones_enrutados_exitosamente': 'Trucks successfully routed',
          'txt_error_desconocido': 'Unknown error',
          'msg_no_tiene_permisos': 'No permissions',
          'msg_error_conexion': 'Connection error'
        };
        return of(traducciones[key] || key);
      }),
      stream: jest.fn((key) => {
        return of(key);
      }),
      currentLang: 'en',
      onLangChange: new EventEmitter(),
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter()
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        TranslateModule.forRoot(),
        PlanificacionRutas
      ],
      providers: [
        { provide: LogisticaService, useValue: logisticaServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy }
      ]
    }).compileComponents();

    logisticaService = TestBed.inject(LogisticaService);
    translateService = TestBed.inject(TranslateService);
  });

  beforeEach(() => {
    jest.spyOn(Swal, 'mixin').mockReturnValue(mockSwal);

    fixture = TestBed.createComponent(PlanificacionRutas);
    component = fixture.componentInstance;

    jest.spyOn(component, 'obtenerFechaActual').mockReturnValue('2025-05-15');

    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar con la fecha actual', () => {
    expect(component.fechaSeleccionada).toBe('2025-05-15');
  });

  it('debe llamar a obtenerFechaActual al inicializar', () => {
    expect(component.fechaSeleccionada).toBe('2025-05-15');
    expect(typeof component.obtenerFechaActual).toBe('function');
  });

  it('debe obtener la fecha actual en formato ISO', () => {
    (component.obtenerFechaActual as jest.Mock).mockRestore();

    const fechaActual = new Date();
    const fechaFormateada = fechaActual.toISOString().substring(0, 10);

    expect(component.obtenerFechaActual()).toBe(fechaFormateada);
  });

  it('debe cargar camiones al inicializar', () => {
    expect(logisticaService.obtenerCamiones).toHaveBeenCalledWith('2025-05-15');
    expect(component.camiones.length).toBe(2);
    expect(component.camiones[0].placa).toBe('ABC123');
    expect(component.camiones[1].placa).toBe('XYZ789');
  });

  it('debe mostrar el indicador de carga mientras se cargan los camiones', fakeAsync(() => {
    (logisticaService.obtenerCamiones as jest.Mock).mockReturnValue({
      subscribe: (callbacks: any) => {
        setTimeout(() => callbacks.next(mockCamiones), 100);
        return { unsubscribe: jest.fn() };
      }
    });

    component.cargarCamiones();
    fixture.detectChanges();
    expect(component.cargando).toBe(true);
    tick(100);
    fixture.detectChanges();
    expect(component.cargando).toBe(false);
  }));

  it('debe manejar errores al cargar camiones', () => {
    const errorMensaje = 'Error de conexión al servidor';
    (logisticaService.obtenerCamiones as jest.Mock).mockReturnValue({
      subscribe: (callbacks: any) => {
        callbacks.error(new Error(errorMensaje));
        return { unsubscribe: jest.fn() };
      }
    });

    jest.spyOn(component, 'showMessage');

    component.cargarCamiones();
    fixture.detectChanges();

    expect(component.errorCarga).toBe(true);
    expect(component.errorMensaje).toBe(errorMensaje);
    expect(component.showMessage).toHaveBeenCalledWith('Error loading trucks', 'error');
  });

  it('debe cargar camiones cuando cambia la fecha', () => {
    jest.spyOn(component, 'cargarCamiones');

    component.fechaSeleccionada = '2025-05-15';
    const inputFecha = fixture.debugElement.query(By.css('#fechaEntrega'));
    inputFecha.triggerEventHandler('change', null);
    fixture.detectChanges();
    expect(component.cargarCamiones).toHaveBeenCalled();
  });

  it('debe enrutar camiones sin ruta', () => {
    jest.spyOn(component, 'cargarCamiones').mockImplementation(() => {});
    jest.spyOn(component, 'showMessage').mockImplementation(() => {});
    const mensajesRespuesta = ['Camión ABC123 enrutado correctamente', 'Se han asignado 1 rutas'];

    const mockSubscribe = jest.fn((callbacks) => {
      callbacks.next({
        mensajes: mensajesRespuesta
      });
      return {
        unsubscribe: jest.fn()
      };
    });

    const mockAsignarRuta = jest.fn().mockReturnValue({
      subscribe: mockSubscribe
    });

    logisticaService.asignarRuta = mockAsignarRuta;
    component.mensajes = [];
    component.procesandoEnrutamiento = false;
    component.enrutarCamionesSinRuta();
    expect(mockAsignarRuta).toHaveBeenCalledWith('2025-05-15');
    expect(mockSubscribe).toHaveBeenCalled();
    expect(component.mensajes.length).toBe(2);
    expect(component.mensajes[0]).toBe('Camión ABC123 enrutado correctamente');
    expect(component.mensajes[1]).toBe('Se han asignado 1 rutas');
    expect(component.showMessage).toHaveBeenCalledWith('Trucks successfully routed', 'success');
    expect(component.cargarCamiones).toHaveBeenCalled();
  });

  it('debe manejar errores al enrutar camiones', fakeAsync(() => {
    const errorMensaje = 'Error al enrutar camiones';

    (logisticaService.asignarRuta as jest.Mock).mockReturnValue({
      subscribe: (callbacks: any) => {
        setTimeout(() => callbacks.error(new Error(errorMensaje)), 10);
        return { unsubscribe: jest.fn() };
      }
    });

    jest.spyOn(component, 'showMessage');
    component.enrutarCamionesSinRuta();
    expect(component.procesandoEnrutamiento).toBe(true);
    tick(10);
    fixture.detectChanges();
    expect(component.procesandoEnrutamiento).toBe(false);

    expect(component.mensajes.length).toBe(1);
    expect(component.mensajes[0]).toBe(`Error al enrutar camiones: ${errorMensaje}`);

    expect(component.showMessage).toHaveBeenCalledWith('Unknown error', 'error');
  }));

  it('debe manejar diferentes tipos de errores al enrutar camiones', () => {
    jest.spyOn(component, 'showMessage');

    const error400 = {
      status: 400,
      error: { detalles: { error1: 'Detalle del error 1', error2: 'Detalle del error 2' } }
    };

    (logisticaService.asignarRuta as jest.Mock).mockReturnValue({
      subscribe: (callbacks: any) => {
        callbacks.error(error400);
        return { unsubscribe: jest.fn() };
      }
    });

    component.enrutarCamionesSinRuta();
    expect(component.showMessage).toHaveBeenLastCalledWith('Detalle del error 1, Detalle del error 2', 'error');

    const error403 = { status: 403 };

    (logisticaService.asignarRuta as jest.Mock).mockReturnValue({
      subscribe: (callbacks: any) => {
        callbacks.error(error403);
        return { unsubscribe: jest.fn() };
      }
    });

    component.enrutarCamionesSinRuta();
    expect(component.showMessage).toHaveBeenLastCalledWith('No permissions', 'error');

    const error0 = { status: 0 };

    (logisticaService.asignarRuta as jest.Mock).mockReturnValue({
      subscribe: (callbacks: any) => {
        callbacks.error(error0);
        return { unsubscribe: jest.fn() };
      }
    });

    component.enrutarCamionesSinRuta();
    expect(component.showMessage).toHaveBeenLastCalledWith('Connection error', 'error');

    const errorCustom = { error: { message: 'Error personalizado' } };

    (logisticaService.asignarRuta as jest.Mock).mockReturnValue({
      subscribe: (callbacks: any) => {
        callbacks.error(errorCustom);
        return { unsubscribe: jest.fn() };
      }
    });

    component.enrutarCamionesSinRuta();
    expect(component.showMessage).toHaveBeenLastCalledWith('Error personalizado', 'error');
  });

  it('debe traducir correctamente los estados de enrutamiento', () => {
    expect(component.getEstadoTraducido('Enrutado')).toBe('Routed');
    expect(component.getEstadoTraducido('Sin ruta')).toBe('Without route');
    expect(component.getEstadoTraducido('Sin entregas programadas')).toBe('No scheduled deliveries');

    expect(component.getEstadoTraducido('Estado no definido')).toBe('Estado no definido');
  });

  it('debe devolver la clase correcta para cada estado de enrutamiento', () => {
    expect(component.getBadgeClass('Enrutado')).toBe('badge bg-success');
    expect(component.getBadgeClass('Routed')).toBe('badge bg-success');
    expect(component.getBadgeClass('Sin ruta')).toBe('badge bg-danger');
    expect(component.getBadgeClass('Without route')).toBe('badge bg-danger');

    expect(component.getBadgeClass('Otro estado')).toBe('badge bg-warning');
  });

  it('debe detectar correctamente si hay camiones sin ruta', () => {
    expect(component.hayCamionesSinRuta()).toBe(true);

    component.camiones = component.camiones.map(c => ({
      ...c,
      estado_enrutamiento: 'Enrutado'
    }));

    expect(component.hayCamionesSinRuta()).toBe(false);
    component.camiones = [];
    expect(component.hayCamionesSinRuta()).toBe(false);
  });

  it('debe mostrar el botón de enrutar solo cuando hay camiones sin ruta', () => {
    fixture.detectChanges();
    let botonEnrutar = fixture.debugElement.query(By.css('button.btn-primary'));
    expect(botonEnrutar).toBeTruthy();

    component.camiones = component.camiones.map(c => ({
      ...c,
      estado_enrutamiento: 'Enrutado'
    }));

    fixture.detectChanges();
    botonEnrutar = fixture.debugElement.query(By.css('button.btn-primary'));
    expect(botonEnrutar).toBeFalsy(); // El botón no debería mostrarse
  });

  it('debe llamar a showMessage con los parámetros correctos', () => {
    const mockMixinReturn = {
      fire: jest.fn().mockResolvedValue({})
    };
    jest.spyOn(Swal, 'mixin').mockReturnValue(mockMixinReturn as any);

    component.showMessage('Mensaje de éxito', 'success');
    expect(Swal.mixin).toHaveBeenCalledWith(expect.objectContaining({
      toast: true,
      position: 'top-end',
      showConfirmButton: false
    }));
    expect(mockMixinReturn.fire).toHaveBeenCalledWith(expect.objectContaining({
      icon: 'success',
      title: 'Mensaje de éxito'
    }));

    component.showMessage('Mensaje de error', 'error');
    expect(mockMixinReturn.fire).toHaveBeenCalledWith(expect.objectContaining({
      icon: 'error',
      title: 'Mensaje de error'
    }));
  });

  it('debe aplicar las clases del badge según el estado de enrutamiento', () => {
    fixture.detectChanges();

    const estadosEnrutamiento = fixture.debugElement.queryAll(By.css('tbody tr td:nth-child(7) span'));

    expect(estadosEnrutamiento[0].nativeElement.classList.contains('badge')).toBe(true);
    expect(estadosEnrutamiento[0].nativeElement.classList.contains('bg-danger')).toBe(true);

    expect(estadosEnrutamiento[1].nativeElement.classList.contains('badge')).toBe(true);
    expect(estadosEnrutamiento[1].nativeElement.classList.contains('bg-success')).toBe(true);
  });

  it('debe mostrar la tabla de camiones cuando hay datos', () => {
    fixture.detectChanges();

    const filasCamiones = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(filasCamiones.length).toBe(2);
  });

  it('debe mostrar mensaje cuando no hay camiones', () => {
    component.camiones = [];
    fixture.detectChanges();
    const mensajeVacio = fixture.debugElement.query(By.css('tbody tr td[colspan="7"]'));
    expect(mensajeVacio).toBeTruthy();
  });

  it('debe deshabilitar el botón de enrutamiento mientras se procesa', () => {
    component.procesandoEnrutamiento = true;
    fixture.detectChanges();

    const botonEnrutar = fixture.debugElement.query(By.css('button.btn-primary'));
    expect(botonEnrutar.nativeElement.disabled).toBe(true);
  });

  it('debe mostrar la sección de mensajes cuando hay mensajes', () => {
    component.mensajes = ['Mensaje de prueba'];
    fixture.detectChanges();

    const seccionMensajes = fixture.debugElement.query(By.css('ul.list-disc'));
    expect(seccionMensajes).toBeTruthy();

    const elementosMensajes = fixture.debugElement.queryAll(By.css('ul.list-disc li'));
    expect(elementosMensajes.length).toBe(1);
    expect(elementosMensajes[0].nativeElement.textContent).toBe('Mensaje de prueba');
  });

  it('debe ocultar la sección de mensajes cuando no hay mensajes', () => {
    component.mensajes = [];
    fixture.detectChanges();

    const seccionMensajes = fixture.debugElement.query(By.css('ul.list-disc'));
    expect(seccionMensajes).toBeFalsy();
  });
});
