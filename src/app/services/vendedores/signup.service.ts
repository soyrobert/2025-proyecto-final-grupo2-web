import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  country: string;
  city: string;
  address: string;
  acceptPolicy: boolean;
}

export interface SignupResponse {
  userId: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  private apiUrl = `${environment.apiBaseUrl}/signup`;

  constructor(private http: HttpClient) { }

  /**
   * Registra un nuevo usuario en el sistema
   * @param userData Datos del usuario a registrar
   * @returns Observable con la respuesta del servidor
   */
  registerUser(userData: SignupRequest): Observable<SignupResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<SignupResponse>(this.apiUrl, userData, { headers });
  }
}