import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProveedoresHome } from './proveedores-home';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProveedoresService } from '../../../services/proveedores/proveedores.service';
import { StorageService } from '../../../services/storage/storage.service';
import { Observable, of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { Component, Input } from '@angular/core';

// Mock para Sweetalert2
jest.mock('sweetalert2', () => ({
  mixin: jest.fn().mockReturnValue({
    fire: jest.fn().mockResolvedValue({}),
  }),
  fire: jest.fn().mockResolvedValue({})
}));

// Mock para TranslateLoader
class FakeTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of({
      'dashboard': 'Dashboard',
      'txt_title_proveedores': 'Proveedores',
      'btn_agregar_proveedor': 'Agregar proveedor',
      'txt_intrucciones_de_uso': 'Instrucciones de uso',
      'txt_intrucciones_de_uso_guia': 'Descargue la plantilla y complete los datos.',
      'name': 'Nombre',
      'txt_ingrese_el_nombre': 'Ingrese el nombre del proveedor',
      'txt_por_favor_ingrese_el_nombre': 'Por favor ingrese el nombre',
      'email': 'Email',
      'txt_ingrese_el_email': 'Ingrese el email del proveedor',
      'txt_por_favor_ingrese_el_email': 'Por favor ingrese el email',
      'txt_email_invalido': 'El email es inválido',
      'txt_numero_de_contacto': 'Número de contacto',
      'txt_ingrese_el_numero_de_contacto': 'Ingrese el número de contacto',
      'txt_por_favor_ingrese_el_numero_de_contacto': 'Por favor ingrese el número de contacto',
      'txt_solo_numeros': 'Solo se permiten números',
      'pais': 'País',
      'txt_seleccione_el_pais': 'Seleccione el país',
      'txt_por_favor_seleccione_el_pais': 'Por favor seleccione el país',
      'caracteristicas': 'Características',
      'txt_ingrese_las_caracteristicas': 'Ingrese las características del proveedor',
      'txt_por_favor_ingrese_las_caracteristicas': 'Por favor ingrese las características',
      'txt_condiciones_comerciales': 'Condiciones comerciales y tributarias',
      'txt_ingrese_las_condiciones': 'Ingrese las condiciones comerciales y tributarias',
      'txt_por_favor_ingrese_las_condiciones': 'Por favor ingrese las condiciones',
      'btn_cancelar': 'Cancelar',
      'txt_guardando': 'Guardando...',
      'txt_proveedor_registrado_exitosamente': 'Proveedor registrado exitosamente',
      'msg_proveedor_ya_existe': 'Ya existe un proveedor con este email',
      'msg_no_tiene_permisos': 'No tiene permisos para realizar esta acción',
      'msg_error_conexion': 'Error de conexión con el servidor',
      'txt_error_desconocido': 'Ha ocurrido un error desconocido',
      'txt_importacion_masiva_proveedores': 'Importación masiva de proveedores',
      'txt_importacion_masiva_proveedores_descripcion': 'Desde aquí puedes importar múltiples proveedores utilizando un archivo CSV.',
      'txt_arrastrar_archivo_csv': 'Arrastra aquí tu archivo CSV',
      'txt_o_click_para_seleccionar': 'o haz clic para seleccionar',
      'txt_formatos_csv_permitidos': 'Formatos permitidos',
      'txt_tamanio_maximo': 'Tamaño máximo',
      'txt_solo_archivos_csv': 'Solo se permiten archivos CSV',
      'txt_archivo_no_compatible': 'El archivo seleccionado no es compatible',
      'txt_formato_csv_no_valido': 'El formato del archivo no es válido',
      'txt_csv_demasiado_grande': 'El archivo CSV excede el tamaño máximo permitido',
      'txt_seleccionar_archivo_csv': 'Por favor, selecciona un archivo CSV primero',
      'txt_seleccionar_solo_csv': 'Por favor, selecciona solo archivos CSV',
      'txt_error_subir_csv': 'Error al subir el archivo CSV',
      'txt_subiendo': 'Subiendo...',
      'txt_subiendo_archivo': 'Subiendo archivo...',
      'txt_procesando_datos': 'Procesando datos...',
      'txt_completado': 'Completado',
      'btn_subir_datos': 'Subir datos',
      'btn_eliminar': 'Eliminar',
      'txt_proveedores_importados_resumen': 'Se importaron {exitosos} de {total} proveedores. {fallidos} fallidos.',
      'txt_resultado_importacion': 'Resultado de la importación',
      'btn_aceptar': 'Aceptar',
      'msg_archivo_muy_grande': 'El archivo es demasiado grande',
    });
  }
}

@Component({
  standalone: true,
  selector: 'icon-plus',
  template: '<div>Plus Icon</div>'
})
class MockIconPlusComponent {}

@Component({
  standalone: true,
  selector: 'app-modal',
  template: '<div><ng-content></ng-content></div>'
})
class MockModalComponent {
  @Input() title: string = '';
  open = jest.fn();
  close = jest.fn();
}

describe('ProveedoresHome', () => {
  let component: ProveedoresHome;
  let fixture: ComponentFixture<ProveedoresHome>;
  let proveedoresService: any;
  let translateService: any;
  let storageService: any;

  beforeEach(async () => {

    proveedoresService = {
      registrarProveedor: jest.fn(),
      importarProveedoresMasivamente: jest.fn()
    };

    translateService = {
      use: jest.fn(),
      get: jest.fn().mockReturnValue(of('')),
      getTranslation: jest.fn().mockReturnValue(of({})),
      instant: jest.fn(key => key),
      currentLang: 'es',
      onLangChange: of({}),
      onTranslationChange: of({}),
      onDefaultLangChange: of({})
    };

    storageService = {
      uploadCsvFile: jest.fn().mockReturnValue(of('https://storage.example.com/data.csv'))
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: FakeTranslateLoader
          }
        }),
        ProveedoresHome
      ],
      providers: [
        FormBuilder,
        { provide: ProveedoresService, useValue: proveedoresService },
        { provide: TranslateService, useValue: translateService },
        { provide: StorageService, useValue: storageService }
      ]
    })
    .overrideComponent(ProveedoresHome, {
      set: {
        imports: [
          CommonModule,
          ReactiveFormsModule,
          FormsModule,
          TranslateModule,
          MockIconPlusComponent,
          MockModalComponent
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProveedoresHome);
    component = fixture.componentInstance;

    // Asignamos un mock para modal
    component.modalProveedor = {
      open: jest.fn(),
      close: jest.fn()
    } as any;

    // Mock para los elementos del DOM relacionados con la importación
    component.excelFileInput = {
      nativeElement: {
        value: '',
        click: jest.fn()
      }
    };

    component.dropZone = {
      nativeElement: document.createElement('div')
    };

    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario con validadores', () => {
    expect(component.formularioProveedor).toBeDefined();
    expect(component.formularioProveedor.get('nombre')).toBeDefined();
    expect(component.formularioProveedor.get('email')).toBeDefined();
    expect(component.formularioProveedor.get('numeroContacto')).toBeDefined();
    expect(component.formularioProveedor.get('pais')).toBeDefined();
    expect(component.formularioProveedor.get('caracteristicas')).toBeDefined();
    expect(component.formularioProveedor.get('condiciones')).toBeDefined();
  });

  it('debería abrir el modal al llamar a abrirModalProveedor', () => {
    component.abrirModalProveedor();
    expect(component.modalProveedor.open).toHaveBeenCalled();
  });

  it('debería marcar todos los campos como touched cuando se envía el formulario con datos inválidos', () => {
    const nombreControl = component.formularioProveedor.get('nombre');
    const spyMarkAsTouched = jest.spyOn(nombreControl!, 'markAsTouched');

    component.guardarProveedor();

    expect(spyMarkAsTouched).toHaveBeenCalled();
    expect(proveedoresService.registrarProveedor).not.toHaveBeenCalled();
  });

  it('debería llamar al servicio con los datos correctos y mostrar mensaje de éxito al guardar', () => {
    proveedoresService.registrarProveedor.mockReturnValue(of({
      success: true
    }));

    component.formularioProveedor.setValue({
      nombre: 'Proveedor Test',
      email: 'test@example.com',
      numeroContacto: '1234567890',
      pais: 'Colombia',
      caracteristicas: 'Características de prueba',
      condiciones: 'Condiciones de prueba'
    });

    const spyShowMessage = jest.spyOn(component, 'showMessage');

    component.guardarProveedor();

    expect(proveedoresService.registrarProveedor).toHaveBeenCalledWith({
      nombre: 'Proveedor Test',
      email: 'test@example.com',
      numeroContacto: '1234567890',
      pais: 'Colombia',
      caracteristicas: 'Características de prueba',
      condiciones: 'Condiciones de prueba'
    });

    expect(spyShowMessage).toHaveBeenCalledWith('txt_proveedor_registrado_exitosamente', 'success');
    expect(component.modalProveedor.close).toHaveBeenCalled();
    expect(component.cargando).toBe(false);
  });

  it('debería mostrar errores de validación cuando falla con error 400', () => {
    const errorResponse = {
      status: 400,
      error: {
        error: 'Datos inválidos',
        detalles: {
          email: 'El formato del email es incorrecto',
          nombre: 'Este campo es requerido'
        }
      }
    };

    proveedoresService.registrarProveedor.mockReturnValue(throwError(() => errorResponse));

    component.formularioProveedor.setValue({
      nombre: 'Proveedor Test',
      email: 'test@example.com',
      numeroContacto: '1234567890',
      pais: 'Colombia',
      caracteristicas: 'Características de prueba',
      condiciones: 'Condiciones de prueba'
    });

    const spyShowMessage = jest.spyOn(component, 'showMessage');

    component.guardarProveedor();

    // Debe mostrar el mensaje con los detalles concatenados
    expect(spyShowMessage).toHaveBeenCalledWith('El formato del email es incorrecto, Este campo es requerido', 'error');
    expect(component.modalProveedor.close).not.toHaveBeenCalled();
    expect(component.cargando).toBe(false);
  });

  it('debería mostrar un mensaje de error cuando falla el registro con error 409', () => {
    const errorResponse = {
      status: 409,
      error: {
        error: 'El proveedor ya existe',
        detalles: 'Ya existe un proveedor con este email'
      }
    };

    proveedoresService.registrarProveedor.mockReturnValue(throwError(() => errorResponse));

    component.formularioProveedor.setValue({
      nombre: 'Proveedor Test',
      email: 'test@example.com',
      numeroContacto: '1234567890',
      pais: 'Colombia',
      caracteristicas: 'Características de prueba',
      condiciones: 'Condiciones de prueba'
    });

    const spyShowMessage = jest.spyOn(component, 'showMessage');

    component.guardarProveedor();

    expect(spyShowMessage).toHaveBeenCalledWith('msg_proveedor_ya_existe', 'error');
    expect(component.modalProveedor.close).not.toHaveBeenCalled();
    expect(component.cargando).toBe(false);
  });

  it('debería mostrar un mensaje de error cuando falla el registro con error 403', () => {
    const errorResponse = {
      status: 403,
      error: {
        error: 'Acceso denegado',
        message: 'No tiene permisos para realizar esta acción'
      }
    };

    proveedoresService.registrarProveedor.mockReturnValue(throwError(() => errorResponse));

    component.formularioProveedor.setValue({
      nombre: 'Proveedor Test',
      email: 'test@example.com',
      numeroContacto: '1234567890',
      pais: 'Colombia',
      caracteristicas: 'Características de prueba',
      condiciones: 'Condiciones de prueba'
    });

    const spyShowMessage = jest.spyOn(component, 'showMessage');

    component.guardarProveedor();

    expect(spyShowMessage).toHaveBeenCalledWith('msg_no_tiene_permisos', 'error');
    expect(component.cargando).toBe(false);
  });

  it('debería mostrar un mensaje de error de conexión cuando falla con status 0', () => {
    const errorResponse = {
      status: 0,
      error: {}
    };

    proveedoresService.registrarProveedor.mockReturnValue(throwError(() => errorResponse));

    component.formularioProveedor.setValue({
      nombre: 'Proveedor Test',
      email: 'test@example.com',
      numeroContacto: '1234567890',
      pais: 'Colombia',
      caracteristicas: 'Características de prueba',
      condiciones: 'Condiciones de prueba'
    });

    const spyShowMessage = jest.spyOn(component, 'showMessage');

    component.guardarProveedor();

    expect(spyShowMessage).toHaveBeenCalledWith('msg_error_conexion', 'error');
    expect(component.cargando).toBe(false);
  });

  it('debería usar el mensaje del servidor cuando está disponible', () => {
    const errorResponse = {
      status: 500,
      error: {
        message: 'Error interno del servidor'
      }
    };

    proveedoresService.registrarProveedor.mockReturnValue(throwError(() => errorResponse));

    component.formularioProveedor.setValue({
      nombre: 'Proveedor Test',
      email: 'test@example.com',
      numeroContacto: '1234567890',
      pais: 'Colombia',
      caracteristicas: 'Características de prueba',
      condiciones: 'Condiciones de prueba'
    });

    const spyShowMessage = jest.spyOn(component, 'showMessage');

    component.guardarProveedor();

    expect(spyShowMessage).toHaveBeenCalledWith('Error interno del servidor', 'error');
    expect(component.cargando).toBe(false);
  });

  // Probar los diferentes tipos de mensajes de Sweetalert2
  it('debería mostrar una notificación con Sweetalert2 del tipo éxito', () => {
    component.showMessage('Mensaje de éxito', 'success');

    expect(Swal.mixin).toHaveBeenCalledWith({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      customClass: {
        container: 'toast'
      }
    });

    const mockMixin = Swal.mixin({toast: true});
    expect(mockMixin.fire).toHaveBeenCalledWith({
      icon: 'success',
      title: 'Mensaje de éxito',
      padding: '10px 20px'
    });
  });

  it('debería mostrar una notificación con Sweetalert2 del tipo advertencia', () => {
    component.showMessage('Mensaje de advertencia', 'warning');

    const mockMixin = Swal.mixin({toast: true});
    expect(mockMixin.fire).toHaveBeenCalledWith({
      icon: 'warning',
      title: 'Mensaje de advertencia',
      padding: '10px 20px'
    });
  });

  it('debería mostrar una notificación con Sweetalert2 del tipo información', () => {
    component.showMessage('Mensaje informativo', 'info');

    const mockMixin = Swal.mixin({toast: true});
    expect(mockMixin.fire).toHaveBeenCalledWith({
      icon: 'info',
      title: 'Mensaje informativo',
      padding: '10px 20px'
    });
  });

  it('debería mostrar una notificación con Sweetalert2 del tipo pregunta', () => {
    component.showMessage('Mensaje de pregunta', 'question');

    const mockMixin = Swal.mixin({toast: true});
    expect(mockMixin.fire).toHaveBeenCalledWith({
      icon: 'question',
      title: 'Mensaje de pregunta',
      padding: '10px 20px'
    });
  });

  it('debería mostrar un mensaje de error cuando falla el registro con error 207 (proveedor existente por nombre)', () => {
    const errorResponse = {
      status: 207,
      error: {
        error: 'Ya existe un proveedor con el nombre',
        detalles: 'Ya existe un proveedor con el nombre "Proveedor Ejemplo S.A."'
      }
    };

    proveedoresService.registrarProveedor.mockReturnValue(throwError(() => errorResponse));

    component.formularioProveedor.setValue({
      nombre: 'Proveedor Ejemplo S.A.',
      email: 'test@example.com',
      numeroContacto: '1234567890',
      pais: 'Colombia',
      caracteristicas: 'Características de prueba',
      condiciones: 'Condiciones de prueba'
    });

    const spyShowMessage = jest.spyOn(component, 'showMessage');

    component.guardarProveedor();

    expect(spyShowMessage).toHaveBeenCalledWith('msg_proveedor_ya_existe_nombre', 'error');
    expect(component.modalProveedor.close).not.toHaveBeenCalled();
    expect(component.cargando).toBe(false);
  });

  describe('Importación masiva de proveedores', () => {
    beforeEach(() => {
      jest.spyOn(component, 'limpiarSeleccionExcel');
      jest.spyOn(component, 'procesarArchivoExcel');
      jest.spyOn(component, 'subirArchivoExcel');
      jest.spyOn(component, 'importarProveedoresMasivamente');
      jest.spyOn(component, 'showMessage');
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('debería inicializar las propiedades de importación masiva correctamente', () => {
      expect(component.archivoExcelSeleccionado).toBeNull();
      expect(component.nombreArchivoExcel).toBe('');
      expect(component.tamanioArchivoExcel).toBe('');
      expect(component.errorArchivoExcel).toBeNull();
      expect(component.subiendoExcel).toBe(false);
      expect(component.progresoSubidaExcel).toBe(0);
      expect(component.maxTamanioExcel).toBe(1048576); // 1MB
      expect(component.formatosExcelPermitidos).toContain('text/csv');
    });

    it('debería llamar a inicializarDropZone en ngAfterViewInit', () => {
      jest.spyOn(component, 'inicializarDropZone');
      component.ngAfterViewInit();
      expect(component.inicializarDropZone).toHaveBeenCalled();
    });

    it('debería procesar correctamente un archivo CSV válido', () => {
      const csvFile = new File(['nombre,email,numeroContacto'], 'test.csv', { type: 'text/csv' });
      jest.spyOn(component, 'formatearTamanio').mockReturnValue('10 KB');

      component.procesarArchivoExcel(csvFile);

      expect(component.archivoExcelSeleccionado).toBe(csvFile);
      expect(component.nombreArchivoExcel).toBe('test.csv');
      expect(component.tamanioArchivoExcel).toBe('10 KB');
      expect(component.errorArchivoExcel).toBeNull();
    });

    it('debería limpiar la selección del archivo CSV correctamente', () => {
      component.archivoExcelSeleccionado = new File(['data'], 'test.csv', { type: 'text/csv' });
      component.nombreArchivoExcel = 'test.csv';
      component.tamanioArchivoExcel = '10 KB';
      component.errorArchivoExcel = 'error previo';

      component.limpiarSeleccionExcel();

      expect(component.archivoExcelSeleccionado).toBeNull();
      expect(component.nombreArchivoExcel).toBe('');
      expect(component.tamanioArchivoExcel).toBe('');
      expect(component.errorArchivoExcel).toBeNull();
      expect(component.excelFileInput.nativeElement.value).toBe('');
    });

    it('debería formatear el tamaño del archivo correctamente', () => {
      expect(component.formatearTamanio(0)).toBe('0 B');
      expect(component.formatearTamanio(1024)).toBe('1 KB');
      expect(component.formatearTamanio(1048576)).toBe('1 MB');
      expect(component.formatearTamanio(1073741824)).toBe('1 GB');
      expect(component.formatearTamanio(2048)).toBe('2 KB');
    });

    it('debería mostrar un mensaje si no hay archivo seleccionado al intentar subir', () => {
      component.archivoExcelSeleccionado = null;

      component.subirArchivoExcel();

      expect(component.showMessage).toHaveBeenCalledWith('txt_seleccionar_archivo_csv', 'warning');
      expect(storageService.uploadCsvFile).not.toHaveBeenCalled();
    });

    it('debería manejar errores al subir el archivo CSV', fakeAsync(() => {
      // Configuración inicial
      const csvFile = new File(['data'], 'test.csv', { type: 'text/csv' });
      component.archivoExcelSeleccionado = csvFile;

      // Mock de error al subir
      storageService.uploadCsvFile.mockReturnValue(throwError(() => new Error('Error de subida')));

      // Ejecutar el método
      component.subirArchivoExcel();
      tick();

      // Verificar
      expect(component.subiendoExcel).toBe(false);
      expect(component.progresoSubidaExcel).toBe(0);
      expect(component.errorArchivoExcel).toBe('txt_error_subir_csv');
      expect(component.showMessage).toHaveBeenCalledWith('txt_error_subir_csv', 'error');
    }));

    // Prueba para el método onExcelSeleccionado
    it('debería ejecutar onExcelSeleccionado correctamente cuando se selecciona un archivo', () => {
        const csvFile = new File(['data'], 'test.csv', { type: 'text/csv' });
        const event = {
        target: {
            files: [csvFile]
        }
        };

        component.onExcelSeleccionado(event);

        expect(component.procesarArchivoExcel).toHaveBeenCalledWith(csvFile);
    });

    // Prueba para manejar una importación parcialmente exitosa
    it('debería manejar una importación parcialmente exitosa', fakeAsync(() => {
        const respuestaConErrores = {
        exitosos: 7,
        fallidos: 3,
        total: 10,
        resultados: [
            {
            indice: 1,
            status: 'error',
            proveedor: { nombre: 'Proveedor 1' },
            error: 'Email inválido'
            },
            {
            indice: 3,
            status: 'error',
            proveedor: { nombre: 'Proveedor 3' },
            error: 'Falta número de contacto'
            },
            {
            indice: 8,
            status: 'error',
            proveedor: { nombre: 'Proveedor 8' },
            error: 'País no válido'
            }
        ]
        };

        proveedoresService.importarProveedoresMasivamente.mockReturnValue(of(respuestaConErrores));

        const mockSwalFire = jest.fn();
        Swal.fire = mockSwalFire;

        component.importarProveedoresMasivamente('https://storage.example.com/data.csv');
        tick();
        expect(component.subiendoExcel).toBe(false);
        expect(component.progresoSubidaExcel).toBe(100);
        expect(component.showMessage).toHaveBeenCalledWith('txt_proveedores_importados_resumen', 'success');
        expect(Swal.fire).toHaveBeenCalled();
    }));

    // Prueba para manejar errores de validación (400) al importar proveedores
    it('debería manejar errores de validación (400) al importar proveedores', fakeAsync(() => {
        const error = {
        status: 400,
        error: {
            detalles: {
            csv: 'El formato de alguna fila no es correcto'
            }
        }
        };

        proveedoresService.importarProveedoresMasivamente.mockReturnValue(throwError(() => error));

        component.importarProveedoresMasivamente('https://storage.example.com/data.csv');
        tick();

        expect(component.subiendoExcel).toBe(false);
        expect(component.showMessage).toHaveBeenCalledWith('El formato de alguna fila no es correcto', 'error');
    }));

    // Prueba para manejar errores por archivo muy grande (413) al importar proveedores
    it('debería manejar errores por archivo muy grande (413) al importar proveedores', fakeAsync(() => {
        const error = { status: 413 };

        proveedoresService.importarProveedoresMasivamente.mockReturnValue(throwError(() => error));

        component.importarProveedoresMasivamente('https://storage.example.com/data.csv');
        tick();

        expect(component.subiendoExcel).toBe(false);
        expect(component.showMessage).toHaveBeenCalledWith('msg_archivo_muy_grande', 'error');
    }));

    // Prueba para manejar errores de permisos (403) al importar proveedores
    it('debería manejar errores de permisos (403) al importar proveedores', fakeAsync(() => {
        const error = { status: 403 };

        proveedoresService.importarProveedoresMasivamente.mockReturnValue(throwError(() => error));
        component.importarProveedoresMasivamente('https://storage.example.com/data.csv');
        tick();

        expect(component.subiendoExcel).toBe(false);
        expect(component.showMessage).toHaveBeenCalledWith('msg_no_tiene_permisos', 'error');
    }));

    // Prueba para manejar errores de conexión (status 0) al importar proveedores
    it('debería manejar errores de conexión (status 0) al importar proveedores', fakeAsync(() => {
        const error = { status: 0 };

        proveedoresService.importarProveedoresMasivamente.mockReturnValue(throwError(() => error));

        component.importarProveedoresMasivamente('https://storage.example.com/data.csv');
        tick();

        expect(component.subiendoExcel).toBe(false);
        expect(component.showMessage).toHaveBeenCalledWith('msg_error_conexion', 'error');
    }));

    // Prueba para manejar errores con mensaje personalizado del servidor
    it('debería manejar errores con mensaje personalizado del servidor al importar proveedores', fakeAsync(() => {
        const error = {
        error: {
            message: 'Error personalizado del servidor'
        }
        };

        proveedoresService.importarProveedoresMasivamente.mockReturnValue(throwError(() => error));

        component.importarProveedoresMasivamente('https://storage.example.com/data.csv');
        tick();

        expect(component.subiendoExcel).toBe(false);
        expect(component.showMessage).toHaveBeenCalledWith('Error personalizado del servidor', 'error');
    }));

    // Prueba para manejar errores desconocidos
    it('debería manejar errores desconocidos al importar proveedores', fakeAsync(() => {
        const error = {};

        proveedoresService.importarProveedoresMasivamente.mockReturnValue(throwError(() => error));
        component.importarProveedoresMasivamente('https://storage.example.com/data.csv');
        tick();

        expect(component.subiendoExcel).toBe(false);
        expect(component.showMessage).toHaveBeenCalledWith('txt_error_desconocido', 'error');
    }));

  });

});
