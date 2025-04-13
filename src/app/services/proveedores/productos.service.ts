import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private apiUrl = `${environment.productosApiUrl}/productos`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el token JWT del almacenamiento local
   */
  private getToken(): string {
    return localStorage.getItem('accessToken') || '';
  }

  /**
   * Configura los headers para las peticiones HTTP con el token de autenticación
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    });
  }

  /**
   * Registra un nuevo producto en el sistema
   * @param producto Datos del producto a registrar
   */
  registrarProducto(producto: any): Observable<any> {
    const productoData = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      tiempo_entrega: producto.tiempoEntrega,
      precio: parseFloat(producto.precioUnitario),
      condiciones_almacenamiento: producto.condicionesAlmacenamiento,
      fecha_vencimiento: producto.fechaVencimiento,
      estado: this.mapearEstado(producto.estado),
      inventario_inicial: parseInt(producto.inventarioInicial, 10),
      imagenes_productos: producto.imagenes ? [producto.imagenes] : [], 
      proveedor: producto.proveedor
    };

    return this.http.post(this.apiUrl, productoData, { headers: this.getHeaders() });
  }

  /**
   * Obtiene todos los productos registrados
   */
  obtenerProductos(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }

  /**
   * Obtiene un producto específico por su identificador
   * @param id Identificador del producto
   */
  obtenerProducto(id: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Mapea los estados del formulario a los estados de la API
   * @param estado Estado seleccionado en el formulario
   */
  private mapearEstado(estado: string): string {
    switch (estado) {
      case 'Activo':
        return 'en_stock';
      case 'Inactivo':
        return 'en_produccion';
      case 'Agotado':
        return 'agotado';
      default:
        return 'en_stock';
    }
  }
}