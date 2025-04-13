import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface SignedUrlResponse {
  signedUrl: string;
  publicUrl: string;
  fileName: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private apiUrl = environment.storageSignedUrlEndpoint;

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
   * Obtiene una URL firmada para subir un archivo
   */
  getSignedUrl(fileName: string, contentType: string): Observable<SignedUrlResponse> {
    return this.http.post<SignedUrlResponse>(
      this.apiUrl,
      { fileName, contentType },
      { headers: this.getHeaders() }
    );
  }

  /**
   * Sube un archivo a Cloud Storage usando una URL firmada
   */
  uploadFileWithSignedUrl(signedUrl: string, file: File): Observable<boolean> {
    return from(fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type
      },
      body: file
    })).pipe(
      map(response => {
        console.log('Respuesta de subida:', response);
        return response.ok;
      }),
      catchError(error => {
        console.error('Error al subir archivo:', error);
        return of(false);
      })
    );
  }

  /**
   * Proceso completo: obtiene URL firmada y sube el archivo
   * Retorna la URL pública del archivo subido
   */
  uploadFile(file: File): Observable<string> {
    console.log(`Iniciando subida de archivo: ${file.name}, tipo: ${file.type}, tamaño: ${file.size} bytes`);
    
    return this.getSignedUrl(file.name, file.type).pipe(
      switchMap(response => {
        console.log('URL firmada obtenida:', response.signedUrl.substring(0, 50) + '...');
        console.log('URL pública será:', response.publicUrl);
        
        return this.uploadFileWithSignedUrl(response.signedUrl, file).pipe(
          map(success => {
            if (success) {
              console.log('Archivo subido exitosamente a:', response.publicUrl);
              return response.publicUrl;
            }
            console.error('Falló la subida del archivo');
            throw new Error('Failed to upload file');
          })
        );
      }),
      catchError(error => {
        console.error('Error en el proceso de subida:', error);
        throw error;
      })
    );
  }
}