import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Camion {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  capacidad_carga_toneladas: number;
  volumen_carga_metros_cubicos: number;
  estado_enrutamiento: string;
}

export interface RespuestaCamiones {
  camiones: Camion[];
  total: number;
}

export interface RespuestaAsignarRuta {
  mensajes: string[];
}

@Injectable({
  providedIn: 'root'
})
export class LogisticaService {
  private apiUrlObtener = `${environment.obtenerRutasApiUrl}`;
  private apiUrlAsignar = `${environment.asignarRutasApiUrl}`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de camiones disponibles para la fecha especificada
   * @param fecha Fecha para filtrar los camiones (formato: YYYY-MM-DD)
   * @returns Observable con la respuesta del servidor
   */
  obtenerCamiones(fecha: string): Observable<RespuestaCamiones> {
    let params = new HttpParams().set('fecha', fecha);
    return this.http.get<RespuestaCamiones>(
      `${this.apiUrlObtener}`,
      { params }
    );
  }

  /**
   * Asigna una ruta a un camión para una fecha específica
   * @param fecha Fecha para la asignación (formato: YYYY-MM-DD)
   * @returns Observable con la respuesta del servidor
   */
  asignarRuta(fecha: string): Observable<RespuestaAsignarRuta> {
    const body = { fecha };
    return this.http.post<RespuestaAsignarRuta>(
      `${this.apiUrlAsignar}`,
      body
    );
  }
}
