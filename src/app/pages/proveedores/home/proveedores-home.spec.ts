import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProveedoresHome } from './proveedores-home';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProveedoresService } from '../../../services/proveedores/proveedores.service';
import { Observable, of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { Component, Input } from '@angular/core';

// Mock para Sweetalert2
jest.mock('sweetalert2', () => ({
  mixin: jest.fn().mockReturnValue({
    fire: jest.fn().mockResolvedValue({}),
  }),
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
      'txt_error_desconocido': 'Ha ocurrido un error desconocido'
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
  
  beforeEach(async () => {

    proveedoresService = {
      registrarProveedor: jest.fn()
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
        { provide: TranslateService, useValue: translateService }
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
});