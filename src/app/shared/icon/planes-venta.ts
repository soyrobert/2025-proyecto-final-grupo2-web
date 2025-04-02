import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
@Component({
    imports: [CommonModule],
    standalone: true,
    selector: 'icon-planes-venta',
    template: `
        <ng-template #template>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H13C16.7712 2 18.6569 2 19.8284 3.17157C21 4.34315 21 6.22876 21 10V14C21 17.7712 21 19.6569 19.8284 20.8284C18.6569 22 16.7712 22 13 22H11C7.22876 22 5.34315 22 4.17157 20.8284C3 19.6569 3 17.7712 3 14V10Z" stroke="#506690" stroke-width="1.5"/>
            <path d="M8 12H16" stroke="#506690" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M8 8H16" stroke="#506690" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M8 16H13" stroke="#506690" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        </ng-template>
    `,
})
export class PlanesVentaComponent {
    @Input() fill: boolean = false;
    @Input() class: any = '';
    @ViewChild('template', { static: true }) template: any;
    constructor(private viewContainerRef: ViewContainerRef) {}
    ngOnInit() {
        this.viewContainerRef.createEmbeddedView(this.template);
        this.viewContainerRef.element.nativeElement.remove();
    }
}
