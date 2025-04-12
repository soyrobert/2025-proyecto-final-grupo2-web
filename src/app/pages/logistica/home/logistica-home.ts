import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
})
export class LogisticaHome implements OnInit {
  searchCode = '';
  searchName = '';
  searchStatus = '';
  
  statusOptions = ['Todos', 'Disponible', 'Sin stock', 'Suspended', 'Approved'];
  
  products: Product[] = [
    {
      codigo: '1001',
      nombre: 'It is a long established',
      precioUnitario: 30000.00,
      fechaVencimiento: '20/02/2025',
      cantidad: 102,
      estado: 'Disponible',
      ubicacion: 'Bodega 1'
    },
    {
      codigo: '1002',
      nombre: 'Where can I get some',
      precioUnitario: 4500.00,
      fechaVencimiento: '15/05/2025',
      cantidad: 68,
      estado: 'Sin stock',
      ubicacion: 'Bodega 2'
    },
    {
      codigo: '1003',
      nombre: 'All the Lorem ipsum generators',
      precioUnitario: 24000.00,
      fechaVencimiento: '12/09/2025',
      cantidad: 56,
      estado: 'Suspended',
      ubicacion: 'Bodega 2'
    },
    {
      codigo: '1004',
      nombre: 'The standard chunk',
      precioUnitario: 120000.00,
      fechaVencimiento: '04/11/2025',
      cantidad: 203,
      estado: 'Suspended',
      ubicacion: 'Bodega 4'
    },
    {
      codigo: '1005',
      nombre: 'All the Lorem Ipsum',
      precioUnitario: 3000.00,
      fechaVencimiento: '18/10/2025',
      cantidad: 45,
      estado: 'Approved',
      ubicacion: 'Bodega 2'
    },
    {
      codigo: '1006',
      nombre: 'All the Lorem Ipsum',
      precioUnitario: 3000.00,
      fechaVencimiento: '18/10/2025',
      cantidad: 45,
      estado: 'Approved',
      ubicacion: 'Bodega 3'
    },
    {
      codigo: '1007',
      nombre: 'All the Lorem Ipsum',
      precioUnitario: 3000.00,
      fechaVencimiento: '18/10/2025',
      cantidad: 45,
      estado: 'Approved',
      ubicacion: 'Bodega 2'
    },
    {
      codigo: '1008',
      nombre: 'All the Lorem Ipsum',
      precioUnitario: 3000.00,
      fechaVencimiento: '18/10/2025',
      cantidad: 45,
      estado: 'Approved',
      ubicacion: 'Bodega 4'
    },
    {
      codigo: '1009',
      nombre: 'All the Lorem Ipsum',
      precioUnitario: 3000.00,
      fechaVencimiento: '18/10/2025',
      cantidad: 45,
      estado: 'Approved',
      ubicacion: 'Bodega 4'
    },
    {
      codigo: '1010',
      nombre: 'All the Lorem Ipsum',
      precioUnitario: 3000.00,
      fechaVencimiento: '18/10/2025',
      cantidad: 45,
      estado: 'Approved',
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
        (this.searchStatus === '' || this.searchStatus === 'Todos' || product.estado === this.searchStatus)
      );
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Disponible':
        return 'bg-primary';
      case 'Sin stock':
        return 'bg-danger';
      case 'Suspended':
        return 'bg-warning';
      case 'Approved':
        return 'bg-success';
      default:
        return 'bg-primary';
    }
  }

  formatCurrency(value: number): string {
    return '$' + value.toLocaleString('es-CO');
  }
}