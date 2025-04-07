import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IconPlusComponent } from 'src/app/shared/icon/icon-plus';
import { ModalComponent } from '../../../components/modal/modal.component';


@Component({
  standalone: true,
  selector: 'app-proveedores-productos',
  templateUrl: './importar-productos.html',
  imports: [
    CommonModule,
    TranslateModule,
    IconPlusComponent,
    ModalComponent
  ],
})
export class ImportarProductos {}
