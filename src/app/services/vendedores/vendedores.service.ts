import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interfaces para mejorar el tipado
interface Vendedor {
    id: string;
    nombre: string;
}

interface Producto {
    id: string;
    nombre: string;
}

interface Zona {
    id: string;
    nombre: string;
}

@Injectable({
    providedIn: 'root',
})
export class VendedoresService {
    // Datos de respaldo
    private readonly productosFallback: Producto[] = [
        { id: 'P001', nombre: 'Laptop Pro X1' },
        { id: 'P002', nombre: 'Smartphone Galaxy S22' },
        { id: 'P003', nombre: 'Tablet iPad Air' },
        { id: 'P004', nombre: 'Monitor 27" 4K' },
        { id: 'P005', nombre: 'Teclado Mecánico RGB' },
        { id: 'P006', nombre: 'Mouse Ergonómico' },
    ];

    private readonly zonasFallback: Zona[] = [
        { id: 'Z001', nombre: 'Norte' },
        { id: 'Z002', nombre: 'Sur' },
        { id: 'Z003', nombre: 'Este' },
        { id: 'Z004', nombre: 'Oeste' },
        { id: 'Z005', nombre: 'Centro' },
    ];

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
            Authorization: `Bearer ${this.getToken()}`,
        });
    }

    /**
     * Obtiene la lista de vendedores
     */
    getVendedores(): Observable<any[]> {
        return this.http.get<any>(environment.listaVendedoresApiUrl, { headers: this.getHeaders() }).pipe(
            map((response) => {
                if (response && response.vendedores && Array.isArray(response.vendedores)) {
                    return response.vendedores;
                } else if (response && Array.isArray(response)) {
                    return response;
                } else {
                    console.warn('Estructura de respuesta de vendedores inesperada:', response);
                    return [];
                }
            }),
            catchError((error) => {
                console.error('Error al obtener vendedores', error);
                return of([]);
            }),
        );
    }

    /**
     * Obtiene la lista de productos
     */
    getProductos(): Observable<any[]> {
        return this.http.get<any>(environment.listaProductosApiUrl, { headers: this.getHeaders() }).pipe(
            map((response) => {
                console.log('Respuesta completa del API de productos:', response);

                if (response && response.products && Array.isArray(response.products)) {
                    console.log('Usando productos del API:', response.products);
                    return response.products;
                }
                else if (response && response.productos && Array.isArray(response.productos)) {
                    console.log('Usando productos del API (estructura en español):', response.productos);
                    return response.productos;
                }
                else if (response && Array.isArray(response)) {
                    console.log('Usando productos del API (array directo):', response);
                    return response;
                } else {
                    console.warn('Estructura de respuesta de productos inesperada, usando fallback:', response);
                    return this.productosFallback;
                }
            }),
            catchError((error) => {
                console.error('Error al obtener productos, usando fallback', error);
                return of(this.productosFallback);
            }),
        );
    }

    /**
     * Obtiene la lista de zonas
     */
    getZonas(): Observable<any[]> {
        return this.http.get<any>(environment.listaZonasApiUrl, { headers: this.getHeaders() }).pipe(
            map((response) => {
                if (response && response.zonas && Array.isArray(response.zonas)) {
                    return response.zonas;
                } else if (response && Array.isArray(response)) {
                    return response;
                } else {
                    console.warn('Estructura de respuesta de zonas inesperada, usando fallback:', response);
                    return this.zonasFallback;
                }
            }),
            catchError((error) => {
                console.error('Error al obtener zonas, usando fallback', error);
                return of(this.zonasFallback);
            }),
        );
    }

    /**
     * Obtiene la tabla de clientes con ventas
     */
    getClientesVentas(): Observable<any[]> {
        return this.http.get<any>(environment.clientesVentasApiUrl, { headers: this.getHeaders() }).pipe(
            map((response) => {
                if (response && response.clientes && Array.isArray(response.clientes)) {
                    return response.clientes.map((cliente: any) => ({
                        ...cliente,
                        vendedor_id: cliente.vendedor_id || this.asignarVendedorAleatorio(),
                        productos: cliente.productos || this.generarProductosAleatorios(),
                    }));
                } else if (response && Array.isArray(response)) {
                    return response.map((cliente: any) => ({
                        ...cliente,
                        vendedor_id: cliente.vendedor_id || this.asignarVendedorAleatorio(),
                        productos: cliente.productos || this.generarProductosAleatorios(),
                    }));
                } else {
                    console.warn('Estructura de respuesta de clientes inesperada:', response);
                    return [];
                }
            }),
            catchError((error) => {
                console.error('Error al obtener clientes con ventas', error);
                return of([]);
            }),
        );
    }

    /**
     * Obtiene el histórico de ventas
     */
    getHistoricoVentas(): Observable<any> {
        return this.http.get<any>(environment.historicoVentasApiUrl, { headers: this.getHeaders() }).pipe(
            map((response) => {
                if (
                    response &&
                    response.historico_ventas &&
                    response.historico_ventas.datos_mensuales &&
                    Object.values(response.historico_ventas.datos_mensuales).every((v: any) => v === 0)
                ) {
                    return response.historico_ventas_fallback;
                } else if (response && response.historico_ventas) {
                    return response.historico_ventas;
                } else if (response && response.historico_ventas_fallback) {
                    return response.historico_ventas_fallback;
                } else {
                    console.warn('Estructura de respuesta de histórico inesperada:', response);
                    return {
                        datos_mensuales: this.generarDatosMensualesAleatorios(),
                        total: this.calcularTotalFromMensuales(this.generarDatosMensualesAleatorios()),
                    };
                }
            }),
            catchError((error) => {
                console.error('Error al obtener histórico de ventas', error);
                const datosMensuales = this.generarDatosMensualesAleatorios();
                return of({
                    datos_mensuales: datosMensuales,
                    total: this.calcularTotalFromMensuales(datosMensuales),
                });
            }),
        );
    }

    /**
     * Obtiene planes y metas
     */
    getPlanesMetas(): Observable<any> {
        return this.http.get<any>(environment.planesMetaApiUrl, { headers: this.getHeaders() }).pipe(
            map((response) => {
                if (response && (response.metas || response.planes)) {
                    return response;
                } else {
                    console.warn('Estructura de respuesta de planes/metas inesperada:', response);
                    return {
                        metas: this.generarMetasAleatorias(),
                        planes: this.generarPlanesAleatorios(),
                    };
                }
            }),
            catchError((error) => {
                console.error('Error al obtener planes y metas', error);
                return of({
                    metas: this.generarMetasAleatorias(),
                    planes: this.generarPlanesAleatorios(),
                });
            }),
        );
    }

    /**
     * Asigna un ID de vendedor aleatorio para simular relaciones
     * @returns ID de vendedor aleatorio
     */
    private asignarVendedorAleatorio(): string {
        const ids = ['1', '2', '3', '4', '5'];
        return ids[Math.floor(Math.random() * ids.length)];
    }

    /**
     * Genera una lista aleatoria de IDs de productos para simular relaciones
     * @returns Lista de productos aleatorios
     */
    private generarProductosAleatorios(): string[] {
        const productos = this.productosFallback.map((p) => p.id);
        const cantidad = Math.floor(Math.random() * 3) + 1; // 1-3 productos por cliente
        const resultado: string[] = [];

        for (let i = 0; i < cantidad; i++) {
            const idx = Math.floor(Math.random() * productos.length);
            if (!resultado.includes(productos[idx])) {
                resultado.push(productos[idx]);
            }
        }

        return resultado;
    }

    /**
     * Genera datos mensuales aleatorios para el histórico de ventas
     * @returns Objeto con datos mensuales
     */
    private generarDatosMensualesAleatorios(): any {
        const meses = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        const datos: any = {};

        meses.forEach((mes) => {
            datos[mes] = Math.floor(Math.random() * 20000) + 5000; // 5000-25000
        });

        return datos;
    }

    /**
     * Calcula el total a partir de los datos mensuales
     * @param datos Datos mensuales
     * @returns Total calculado
     */
    private calcularTotalFromMensuales(datos: any): number {
        return Object.values(datos).reduce((a: number, b: unknown) => a + Number(b), 0);
    }

    /**
     * Genera una lista de metas aleatorias para simular datos
     * @returns Lista de metas
     */
    private generarMetasAleatorias(): any[] {
        const metas = [
            { meta: 'Actualizar Server Logs', tiempo: 'Next: Now' },
            { meta: 'Send Mail to HR and Admin', tiempo: '2 min ago' },
        ];

        return metas;
    }

    /**
     * Genera una lista de planes aleatorios para simular datos
     * @returns Lista de planes
     */
    private generarPlanesAleatorios(): any[] {
        const planes = [
            { plan: 'Backup Files EOD', tiempo: '14:00' },
            { plan: 'Collect documents from Sara', tiempo: '16:00' },
        ];

        return planes;
    }
}
