import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Vendedor {
  id: number;
  nombre: string;
  email: string;
  avatar?: string;
  metas: { [key: string]: number };
}

export interface VendedorRequest {
  id: number;
  metas: { [key: string]: number };
}

export interface VendedoresResponse {
  vendedores: Vendedor[];
}

export interface VendedoresPlanesRequest {
  vendedores: VendedorRequest[];
}

export interface ApiResponse {
  mensaje: string;
  datos?: any;
}

@Injectable({
  providedIn: 'root'
})
export class VendedoresPlanesVentaService {
  private apiUrl = `${environment.ventasApiUrl}`;

  // Nombres de los meses para generar datos mock
  private nombresMeses: { [key: string]: string } = {
    '1': 'ene',
    '2': 'feb',
    '3': 'mar',
    '4': 'abr',
    '5': 'may',
    '6': 'jun',
    '7': 'jul',
    '8': 'ago',
    '9': 'sep',
    '10': 'oct',
    '11': 'nov',
    '12': 'dic'
  };

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista de vendedores con sus planes de venta (usando datos mock por ahora)
   */
  obtenerVendedoresConPlanes(): Observable<Vendedor[]> {
    return of(this.generarDatosMock());
  }

  /**
   * Actualiza los planes de venta de un vendedor específico
   * @param vendedor Datos del vendedor con sus nuevas metas
   */
  actualizarPlanesVendedor(vendedor: VendedorRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(this.apiUrl, vendedor).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza los planes de venta de múltiples vendedores
   * @param vendedores Lista de vendedores con sus nuevas metas
   */
  actualizarPlanesMultiplesVendedores(vendedores: VendedorRequest[]): Observable<ApiResponse> {
    const request: VendedoresPlanesRequest = {
      vendedores: vendedores
    };

    return this.http.put<ApiResponse>(this.apiUrl, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Genera datos mock para desarrollo mientras no esté disponible el endpoint de consulta
   */
  private generarDatosMock(): Vendedor[] {
    const mesesMostrados: string[] = [];
    const fechaActual = new Date();
    let mesActual = fechaActual.getMonth() + 1;
    let anioActual = fechaActual.getFullYear();

    for (let i = 0; i < 8; i++) {
      const mesKey = `${this.nombresMeses[mesActual]}/${anioActual}`;
      mesesMostrados.push(mesKey);

      mesActual++;
      if (mesActual > 12) {
        mesActual = 1;
        anioActual++;
      }
    }

    return [
      {
        id: 1,
        nombre: 'Robert Castro',
        email: 'robert.castro@example.com',
        metas: this.generarMetasAleatorias(mesesMostrados)
      },
      {
        id: 2,
        nombre: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@example.com',
        metas: this.generarMetasAleatorias(mesesMostrados)
      },
      {
        id: 3,
        nombre: 'María González',
        email: 'maria.gonzalez@example.com',
        metas: this.generarMetasAleatorias(mesesMostrados)
      },
      {
        id: 4,
        nombre: 'Jorge Pérez',
        email: 'jorge.perez@example.com',
        metas: this.generarMetasAleatorias(mesesMostrados)
      },
      {
        id: 5,
        nombre: 'Laura Martínez',
        email: 'laura.martinez@example.com',
        metas: this.generarMetasAleatorias(mesesMostrados)
      }
    ];
  }

  /**
   * Genera metas aleatorias para los meses indicados
   */
  private generarMetasAleatorias(meses: string[]): { [key: string]: number } {
    const metas: { [key: string]: number } = {};

    meses.forEach(mes => {
      const valorAleatorio = Math.floor(Math.random() * 16) + 5; // Entre 5 y 20
      metas[mes] = valorAleatorio * 1000;
    });

    return metas;
  }

  /**
   * Maneja errores de la API
   * @param error Error HTTP
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ha ocurrido un error en la comunicación con el servidor';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.error && error.error.mensaje) {
        errorMessage = error.error.mensaje;
      } else if (error.status) {
        switch (error.status) {
          case 401:
            errorMessage = 'No está autorizado para realizar esta operación';
            break;
          case 403:
            errorMessage = 'No tiene permisos suficientes para acceder a este recurso';
            break;
          case 404:
            errorMessage = 'No se encontraron datos para esta consulta';
            break;
          case 500:
            errorMessage = 'Error interno del servidor';
            break;
        }
      }
    }

    console.error('Error en VendedoresPlanesVentaService:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
