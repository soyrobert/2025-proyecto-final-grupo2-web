import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  async login(email: string, password: string): Promise<boolean> {
    try {
      // Encriptar la contraseña usando la clave del ConfigService
      const encryptedPassword = this.encryptPassword(password);
      
      const res: any = await this.http
        .post(`${this.API_URL}/auth/login`, { 
          email, 
          password: encryptedPassword,
          isEncrypted: true // Flag para que el backend sepa que está encriptada
        })
        .toPromise();

      // Guardar sesión
      this.setSession(res.accessToken, res.role, res.userId, email);
      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      return false;
    }
  }

  // Método para encriptar la contraseña
  private encryptPassword(password: string): string {
    const encryptionKey = this.configService.getEncryptionKey();
    return CryptoJS.AES.encrypt(password, encryptionKey).toString();
  }

  setSession(token: string, role: string, userId: number, email: string): void {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userId', userId.toString());
    localStorage.setItem('userEmail', email);
  }

  getRole(): string | null {
    return localStorage.getItem('userRole');
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}