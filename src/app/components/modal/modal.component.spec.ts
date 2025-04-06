import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { Component, TemplateRef, ViewChild } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal #testModal title="Test Modal">
      <ng-template #headerTemplate>
        <div class="custom-header">Custom Header</div>
      </ng-template>
      
      <div class="modal-content">Modal Content</div>
      
      <ng-template #bodyTemplate>
        <div class="custom-body">Custom Body</div>
      </ng-template>
      
      <ng-template #footerTemplate>
        <button class="btn-cancel">Cancel</button>
        <button class="btn-save">Save</button>
      </ng-template>
    </app-modal>
  `
})
class TestHostComponent {
  @ViewChild('testModal') modal!: ModalComponent;
  @ViewChild('headerTemplate') headerTemplate!: TemplateRef<any>;
  @ViewChild('bodyTemplate') bodyTemplate!: TemplateRef<any>;
  @ViewChild('footerTemplate') footerTemplate!: TemplateRef<any>;
}

@Component({
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `<app-modal #simpleModal title="Simple Modal">Modal content without templates</app-modal>`
})
class SimpleTestComponent {
  @ViewChild('simpleModal') modal!: ModalComponent;
}

describe('ModalComponent', () => {
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;
  let modalComponent: ModalComponent;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        NoopAnimationsModule,
        TestHostComponent,
        SimpleTestComponent
      ]
    }).compileComponents();
    
    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
    
    modalComponent = hostComponent.modal;
    
    // Mock del document.body classList
    document.body.classList.add = jest.fn();
    document.body.classList.remove = jest.fn();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('debería crear el componente', () => {
    expect(modalComponent).toBeTruthy();
  });
  
  it('debería inicialmente no estar abierto', () => {
    expect(modalComponent.isOpen).toBeFalsy();
    const modalElement = hostFixture.debugElement.query(By.css('.modal-wrapper'));
    expect(modalElement).toBeFalsy();
  });
  
  it('debería abrir el modal al llamar a open()', () => {
    modalComponent.open();
    hostFixture.detectChanges();
    
    expect(modalComponent.isOpen).toBeTruthy();
    const modalElement = hostFixture.debugElement.query(By.css('.modal-wrapper'));
    expect(modalElement).toBeTruthy();
  });
  
  it('debería cerrar el modal al llamar a close()', () => {
    modalComponent.open();
    hostFixture.detectChanges();
    
    modalComponent.close();
    hostFixture.detectChanges();
    
    expect(modalComponent.isOpen).toBeFalsy();
    const modalElement = hostFixture.debugElement.query(By.css('.modal-wrapper'));
    expect(modalElement).toBeFalsy();
  });
  
  it('debería mostrar el título proporcionado', () => {
    modalComponent.open();
    hostFixture.detectChanges();
    
    const titleElement = hostFixture.debugElement.query(By.css('.modal-title'));
    expect(titleElement.nativeElement.textContent).toBe('Test Modal');
  });
  
  it('debería mostrar el contenido proyectado', () => {
    modalComponent.open();
    hostFixture.detectChanges();
    
    const contentElement = hostFixture.debugElement.query(By.css('.modal-content'));
    expect(contentElement.nativeElement.textContent).toBe('Modal Content');
  });
  
  it('debería mostrar las plantillas personalizadas cuando estén disponibles', () => {
    modalComponent.open();
    hostFixture.detectChanges();
    
    const customHeaderElement = hostFixture.debugElement.query(By.css('.custom-header'));
    const customBodyElement = hostFixture.debugElement.query(By.css('.custom-body'));
    const footerElement = hostFixture.debugElement.query(By.css('.modal-footer'));
    
    expect(customHeaderElement).toBeTruthy();
    expect(customHeaderElement.nativeElement.textContent).toBe('Custom Header');
    
    expect(customBodyElement).toBeTruthy();
    expect(customBodyElement.nativeElement.textContent).toBe('Custom Body');
    
    expect(footerElement).toBeTruthy();
    expect(footerElement.nativeElement.textContent).toContain('Cancel');
    expect(footerElement.nativeElement.textContent).toContain('Save');
  });
  
  it('debería cerrar el modal al hacer clic en el botón de cierre', () => {
    modalComponent.open();
    hostFixture.detectChanges();
    
    const closeButtonElement = hostFixture.debugElement.query(By.css('.modal-close'));
    closeButtonElement.triggerEventHandler('click', null);
    hostFixture.detectChanges();
    
    expect(modalComponent.isOpen).toBeFalsy();
    const modalElement = hostFixture.debugElement.query(By.css('.modal-wrapper'));
    expect(modalElement).toBeFalsy();
  });
  
  it('debería cerrar el modal al hacer clic en el fondo si closeOnBackdrop es true', () => {
    modalComponent.closeOnBackdrop = true;
    modalComponent.open();
    hostFixture.detectChanges();
    
    const backdropElement = hostFixture.debugElement.query(By.css('.modal-backdrop'));
    backdropElement.triggerEventHandler('click', null);
    hostFixture.detectChanges();
    
    expect(modalComponent.isOpen).toBeFalsy();
  });
  
  it('no debería cerrar el modal al hacer clic en el fondo si closeOnBackdrop es false', () => {
    modalComponent.closeOnBackdrop = false;
    modalComponent.open();
    hostFixture.detectChanges();
    
    const backdropElement = hostFixture.debugElement.query(By.css('.modal-backdrop'));
    backdropElement.triggerEventHandler('click', null);
    hostFixture.detectChanges();
    
    expect(modalComponent.isOpen).toBeTruthy();
  });
  
  it('debería emitir el evento closed cuando se cierre el modal', () => {
    const closedSpy = jest.spyOn(modalComponent.closed, 'emit');
    
    modalComponent.open();
    hostFixture.detectChanges();
    
    modalComponent.close();
    hostFixture.detectChanges();
    
    expect(closedSpy).toHaveBeenCalled();
  });
  
  it('debería agregar la clase overflow-hidden al body cuando se abre el modal', () => {
    modalComponent.open();
    hostFixture.detectChanges();
    
    expect(document.body.classList.add).toHaveBeenCalledWith('overflow-hidden');
  });
  
  it('debería quitar la clase overflow-hidden del body cuando se cierra el modal', () => {
    modalComponent.open();
    hostFixture.detectChanges();
    
    modalComponent.close();
    hostFixture.detectChanges();
    
    expect(document.body.classList.remove).toHaveBeenCalledWith('overflow-hidden');
  });
  
  it('debería tener el valor predeterminado true para closeOnBackdrop', () => {
    expect(modalComponent.closeOnBackdrop).toBe(true);
  });
  
  it('debería permitir establecer un título personalizado', () => {
    modalComponent.title = 'Custom Title';
    modalComponent.open();
    hostFixture.detectChanges();
    
    const titleElement = hostFixture.debugElement.query(By.css('.modal-title'));
    expect(titleElement.nativeElement.textContent).toBe('Custom Title');
  });
  
  it('debería manejar correctamente múltiples abrir/cerrar secuenciales', () => {
    // Abrir
    modalComponent.open();
    hostFixture.detectChanges();
    expect(modalComponent.isOpen).toBe(true);
    
    // Cerrar
    modalComponent.close();
    hostFixture.detectChanges();
    expect(modalComponent.isOpen).toBe(false);
    
    // Abrir de nuevo
    modalComponent.open();
    hostFixture.detectChanges();
    expect(modalComponent.isOpen).toBe(true);
    
    // Cerrar de nuevo
    modalComponent.close();
    hostFixture.detectChanges();
    expect(modalComponent.isOpen).toBe(false);
  });
  
  it('debería mostrar correctamente el modal sin plantillas personalizadas', () => {

    const simpleFixture = TestBed.createComponent(SimpleTestComponent);
    simpleFixture.detectChanges();
    
    const simpleModalComponent = simpleFixture.componentInstance.modal;
    simpleModalComponent.open();
    simpleFixture.detectChanges();
    
    const bodyContent = simpleFixture.debugElement.query(By.css('.modal-body'));
    expect(bodyContent.nativeElement.textContent).toContain('Modal content without templates');
    
    // No debería haber footer
    const footerElement = simpleFixture.debugElement.query(By.css('.modal-footer'));
    expect(footerElement).toBeFalsy();
  });
});