import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LogisticaService, Product, ProductsResponse } from '../../../services/logistica/logistica.service';
import { finalize } from 'rxjs/operators';

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

  // Estados disponibles para el filtro
  statusOptions = ['txt_todos', 'txt_en_stock', 'txt_agotado', 'txt_en_produccion'];

  // Variables de paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  // Variables de estado
  isLoading = false;
  hasError = false;
  errorMessage = '';

  products: Product[] = [];

  constructor(
    private translate: TranslateService,
    private logisticaService: LogisticaService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  /**
   * Carga los productos desde la API
   */
  loadProducts(): void {
    this.isLoading = true;
    this.hasError = false;

    let apiStatus = '';
    if (this.searchStatus && this.searchStatus !== 'txt_todos') {
      switch (this.searchStatus) {
        case 'txt_en_stock':
          apiStatus = 'en_stock';
          break;
        case 'txt_agotado':
          apiStatus = 'agotado';
          break;
        case 'txt_en_produccion':
          apiStatus = 'en_produccion';
          break;
      }
    }

    // Verificar si el código contiene letras
    const codeParam = this.isNumericCode(this.searchCode) ? this.searchCode : '';

    this.logisticaService.getProducts(
      this.currentPage,
      this.itemsPerPage,
      this.searchName,
      codeParam,
      apiStatus
    )
    .pipe(
      finalize(() => {
        this.isLoading = false;
      })
    )
    .subscribe({
      next: (response: ProductsResponse) => {
        this.products = response.products;
        this.totalItems = response.total;
        this.totalPages = response.total_pages;
      },
      error: (error) => {
        this.hasError = true;
        this.errorMessage = error.message || this.translate.instant('txt_error_cargar_productos');
      }
    });
  }

  /**
   * Verifica si el código contiene solo caracteres numéricos
   * @param code Código a verificar
   * @returns true si es numérico, false si contiene letras
   */
  isNumericCode(code: string): boolean {
    return /^\d*$/.test(code);
  }

  /**
   * Aplica los filtros y recarga los productos
   */
  applyFilters(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  /**
   * Limpia todos los filtros y recarga los productos
   */
  clearFilters(): void {
    this.searchCode = '';
    this.searchName = '';
    this.searchStatus = '';
    this.currentPage = 1;
    this.loadProducts();
  }

  /**
   * Maneja el evento de presionar Enter en los campos de filtro
   * @param event Evento del teclado
   */
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.applyFilters();
    }
  }

  /**
   * Cambia a la página especificada
   * @param page Número de página
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  /**
   * Obtiene la clase CSS según el estado del producto
   * @param status Estado del producto
   * @returns Clase CSS correspondiente
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'en_stock':
        return 'bg-success';
      case 'agotado':
        return 'bg-danger';
      case 'en_produccion':
        return 'bg-warning';
      default:
        return 'bg-primary';
    }
  }

  /**
   * Formatea un valor numérico como moneda
   * @param value Valor a formatear
   * @returns Valor formateado como moneda
   */
  formatCurrency(value: number): string {
    return '$' + value.toLocaleString('es-CO');
  }

  /**
   * Formatea una fecha ISO a formato DD/MM/YYYY
   * @param dateString Fecha en formato ISO
   * @returns Fecha formateada
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(`${dateString}T00:00:00`);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  /**
   * Calcula el número de página actual para los botones de paginación
   * @param index Índice del botón
   * @returns Número de página
  */
  getCurrentPageNumber(index: number): number {
    if (this.totalPages <= 5) {
      return index + 1;
    }

    // Si estamos en las primeras 3 páginas
    if (this.currentPage <= 3) {
      return index + 1;
    }

    // Si estamos en las últimas 3 páginas
    if (this.currentPage >= this.totalPages - 2) {
      return this.totalPages - 4 + index;
    }

    // Si estamos en medio, mostrar 2 páginas antes y 2 después
    return this.currentPage - 2 + index;
  }
}
