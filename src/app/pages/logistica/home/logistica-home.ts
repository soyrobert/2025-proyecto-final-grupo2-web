import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface Product {
  codigo: string;
  nombre: string;
  precioUnitario: number;
  fechaVencimiento: string;
  cantidad: number;
  estado: string;
  ubicacion: string;
}

@Component({
  standalone: true,
  selector: 'app-logistica-home',
  templateUrl: './logistica-home.html',
  imports: [CommonModule, FormsModule, TranslateModule],
})
export class LogisticaHome implements OnInit {
  searchCode = '';
  searchName = '';
  searchStatus = '';
  
  constructor(private translate: TranslateService) {}
  
  statusOptions = ['txt_todos', 'txt_disponible', 'txt_sin_stock', 'txt_suspended', 'txt_approved'];
  
  products: Product[] = [
    {
      codigo: '1001',
      nombre: 'It is a long established',
      precioUnitario: 30000.00,
      fechaVencimiento: '20/02/2025',
      cantidad: 102,
      estado: 'txt_disponible',
      ubicacion: 'Bodega 1'
    },
    {
      codigo: '1002',
      nombre: 'Where can I get some',
      precioUnitario: 4500.00,
      fechaVencimiento: '15/05/2025',
      cantidad: 68,
      estado: 'txt_sin_stock',
      ubicacion: 'Bodega 2'
    },
    {
      codigo: '1003',
      nombre: 'All the Lorem ipsum generators',
      precioUnitario: 24000.00,
      fechaVencimiento: '12/09/2025',
      cantidad: 56,
      estado: 'txt_suspended',
      ubicacion: 'Bodega 2'
    },
    {
      codigo: '1004',
      nombre: 'The standard chunk',
      precioUnitario: 120000.00,
      fechaVencimiento: '04/11/2025',
      cantidad: 203,
      estado: 'txt_suspended',
      ubicacion: 'Bodega 4'
    },
    {
      codigo: '1005',
      nombre: 'All the Lorem Ipsum',
      precioUnitario: 3000.00,
      fechaVencimiento: '18/10/2025',
      cantidad: 45,
      estado: 'txt_approved',
      ubicacion: 'Bodega 2'
    },
    {
      codigo: '1006',
      nombre: 'All the Lorem Ipsum',
      precioUnitario: 3000.00,
      fechaVencimiento: '18/10/2025',
      cantidad: 45,
      estado: 'txt_approved',
      ubicacion: 'Bodega 3'
    },
    {
      codigo: '1007',
      nombre: 'All the Lorem Ipsum',
      precioUnitario: 3000.00,
      fechaVencimiento: '18/10/2025',
      cantidad: 45,
      estado: 'txt_approved',
      ubicacion: 'Bodega 2'
    },
    {
      codigo: '1008',
      nombre: 'All the Lorem Ipsum',
      precioUnitario: 3000.00,
      fechaVencimiento: '18/10/2025',
      cantidad: 45,
      estado: 'txt_approved',
      ubicacion: 'Bodega 4'
    },
    {
      codigo: '1009',
      nombre: 'All the Lorem Ipsum',
      precioUnitario: 3000.00,
      fechaVencimiento: '18/10/2025',
      cantidad: 45,
      estado: 'txt_approved',
      ubicacion: 'Bodega 4'
    },
    {
      codigo: '1010',
      nombre: 'All the Lorem Ipsum',
      precioUnitario: 3000.00,
      fechaVencimiento: '18/10/2025',
      cantidad: 45,
      estado: 'txt_approved',
      ubicacion: 'Bodega 2'
    }
  ];

  filteredProducts: Product[] = [];

  ngOnInit(): void {
    this.filteredProducts = [...this.products];
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      return (
        (this.searchCode === '' || product.codigo.toLowerCase().includes(this.searchCode.toLowerCase())) &&
        (this.searchName === '' || product.nombre.toLowerCase().includes(this.searchName.toLowerCase())) &&
        (this.searchStatus === '' || this.searchStatus === 'txt_todos' || product.estado === this.searchStatus)
      );
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Disponible':
      case 'txt_disponible':
        return 'bg-primary';
      case 'Sin stock':
      case 'txt_sin_stock':
        return 'bg-danger';
      case 'Suspended':
      case 'txt_suspended':
        return 'bg-warning';
      case 'Approved':
      case 'txt_approved':
        return 'bg-success';
      default:
        return 'bg-primary';
    }
  }

  formatCurrency(value: number): string {
    return '$' + value.toLocaleString('es-CO');
  }
}