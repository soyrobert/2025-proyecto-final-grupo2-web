import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  async login(email: string, password: string): Promise<boolean> {
    try {
      const res: any = await this.http
        .post(`${this.API_URL}/auth/login`, { email, password })
        .toPromise();

      // Guardar el token
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('userRole', res.role);
      localStorage.setItem('userId', res.userId.toString());

      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      return false;
    }
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}
