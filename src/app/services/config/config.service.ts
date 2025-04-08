import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

declare global {
  interface Window {
    APP_CONFIG?: {
      encryptionKey?: string;
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any = null;
  
  constructor(private http: HttpClient) {}
  
  /**
   * Inicializa la configuración del servicio
   * Esta función debe ser llamada en APP_INITIALIZER
   */
  async initialize(): Promise<void> {
    try {
      // Primero revisamos si hay configuración en window.APP_CONFIG
      if (window.APP_CONFIG && window.APP_CONFIG.encryptionKey) {
        this.config = { ...window.APP_CONFIG };
        return;
      }
      
      // Si estamos en desarrollo, intentamos cargar la clave de un endpoint
      // Este endpoint solo en ambiente de desarrollo
      try {
        const response = await firstValueFrom(
          this.http.get('/assets/config.json')
        );
        this.config = response;
      } catch (err) {
        this.config = {
          encryptionKey: this.generateDevelopmentKey()
        };
      }
    } catch (error) {
      console.error('Error inicializando configuración:', error);
      this.config = {
        encryptionKey: this.generateDevelopmentKey()
      };
    }
  }
  
  /**
   * Obtiene la clave de encriptación
   */
  getEncryptionKey(): string {
    return this.config?.encryptionKey || this.generateDevelopmentKey();
  }
  
  /**
   * Genera una clave para desarrollo basada en información de sesión
   */
  private generateDevelopmentKey(): string {
    const sessionId = localStorage.getItem('devSessionId') || 
                     `session-${new Date().getTime()}`;
    
    if (!localStorage.getItem('devSessionId')) {
      localStorage.setItem('devSessionId', sessionId);
    }
    
    return `dev-key-${sessionId}-ccpapp`;
  }
}