import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly API_URL = 'https://api.com/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Promise<boolean> {
    const credentials = { email, password };
  
    return firstValueFrom(
      this.http.post<{ token: string }>(`${this.API_URL}/login`, credentials)
    )
      .then((response) => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        this.router.navigate(['/']);
        return true;
      })
      .catch((error) => {
        console.error('Login error:', error);
        return false;
      });
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
