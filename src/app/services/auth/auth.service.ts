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

      // Guardar sesión
      this.setSession(res.accessToken, res.role, res.userId, email);
      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      return false;
    }
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
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}
