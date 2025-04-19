import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProductImage {
  id: number;
  imagen_url: string;
}

export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  estado: string;
  fecha_vencimiento: string;
  proveedor: string;
  inventario_inicial: number;
  condiciones_almacenamiento: string;
  tiempo_entrega: string;
  imagenes_productos: ProductImage[];
}

export interface ProductsResponse {
  products: Product[];
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}

@Injectable({
  providedIn: 'root'
})
export class LogisticaService {
  private apiUrl = `${environment.busquedaProductosApiUrl}`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista de productos según los filtros proporcionados
   * @param page Número de página
   * @param limit Número de registros por página
   * @param name Filtro por nombre
   * @param code Filtro por código
   * @param status Filtro por estado
   * @returns Observable con la respuesta de productos
   */
  getProducts(page: number = 1, limit: number = 10, name?: string, code?: string, status?: string): Observable<ProductsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (name) params = params.set('name', name);
    if (code) params = params.set('code', code);
    if (status) params = params.set('status', status);

    return this.http.get<ProductsResponse>(`${this.apiUrl}/productos`, { params });
  }

  /**
   * Obtiene un producto por su ID
   * @param id ID del producto
   * @returns Observable con los datos del producto
   */
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/productos/${id}`);
  }
}