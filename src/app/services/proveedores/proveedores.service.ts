import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {
  private apiUrl = `${environment.proveedoresApiUrl}/proveedores`;

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
   * Registra un nuevo proveedor en el sistema
   * @param proveedor Datos del proveedor a registrar
   */
  registrarProveedor(proveedor: any): Observable<any> {
    // Mapeo de nombres del formulario a los nombres de la API
    const proveedorData = {
      nombre: proveedor.nombre,
      email: proveedor.email,
      numero_contacto: proveedor.numeroContacto,
      pais: proveedor.pais,
      caracteristicas: proveedor.caracteristicas,
      condiciones_comerciales_tributarias: proveedor.condiciones
    };

    return this.http.post(this.apiUrl, proveedorData, { headers: this.getHeaders() });
  }

  /**
   * Obtiene todos los proveedores registrados
   */
  obtenerProveedores(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }
}