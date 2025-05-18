import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { VendedoresService } from '../../../services/vendedores/vendedores.service';
import * as XLSX from 'xlsx';
import Chart from 'chart.js/auto';
import Swal from 'sweetalert2';

interface Cliente {
    nombre: string;
    direccion: string;
    codigo: string;
    promedio_ventas: number;
    vendedor_id?: string;
    productos?: string[];
}

interface Meta {
    meta: string;
    tiempo: string;
}

interface Plan {
    plan: string;
    tiempo: string;
}

@Component({
    standalone: true,
    selector: 'app-vendedores-home',
    templateUrl: './vendedores-home.html',
    imports: [CommonModule, TranslateModule, FormsModule],
})
export class VendedoresHome implements OnInit, AfterViewInit {
    @ViewChild('historicoChart') private readonly chartRef!: ElementRef;
    private chart!: Chart;

    // Datos
    clientes: Cliente[] = [];
    clientesCompletos: Cliente[] = [];
    vendedores: any[] = [];
    productos: any[] = [];
    zonas: any[] = [];
    metas: Meta[] = [];
    planes: Plan[] = [];

    // Filtros
    vendedorSeleccionado: string = '';
    productoSeleccionado: string = '';
    zonaSeleccionada: string = '';

    // Datos de histórico
    historicoVentas: any = {};
    totalVentas: number = 0;

    // Estado de carga
    cargando = {
        clientes: false,
        vendedores: false,
        productos: false,
        zonas: false,
        historico: false,
        planesMetas: false,
    };

    constructor(
        private vendedoresService: VendedoresService,
        private translate: TranslateService,
    ) {}

    ngOnInit() {
        this.cargarDatos();
    }

    ngAfterViewInit() {
        // Esperamos que los datos se han cargado
        setTimeout(() => {
            if (this.historicoVentas?.datos_mensuales) {
                this.inicializarGrafico();
            }
        }, 1000);
    }

    cargarDatos() {
        this.cargarClientes();
        this.cargarVendedores();
        this.cargarProductos();
        this.cargarZonas();
        this.cargarHistoricoVentas();
        this.cargarPlanesMetas();
    }

    cargarClientes() {
        this.cargando.clientes = true;
        this.vendedoresService.getClientesVentas().subscribe({
            next: (data) => {
                this.clientesCompletos = data;
                this.clientes = [...data];
                this.cargando.clientes = false;
            },
            error: (error) => {
                console.error('Error al cargar clientes', error);
                this.cargando.clientes = false;
                this.showMessage(this.translate.instant('txt_error_cargar_clientes'), 'error');
            },
        });
    }

    cargarVendedores() {
        this.cargando.vendedores = true;
        this.vendedoresService.getVendedores().subscribe({
            next: (data) => {
                this.vendedores = data;
                this.cargando.vendedores = false;
            },
            error: (error) => {
                console.error('Error al cargar vendedores', error);
                this.cargando.vendedores = false;
                this.showMessage(this.translate.instant('txt_error_cargar_vendedores'), 'error');
            },
        });
    }

    cargarProductos() {
        this.cargando.productos = true;
        this.vendedoresService.getProductos().subscribe({
            next: (data) => {
                this.productos = data;
                this.cargando.productos = false;
            },
            error: (error) => {
                console.error('Error al cargar productos', error);
                this.cargando.productos = false;
                this.showMessage(this.translate.instant('txt_error_cargar_productos'), 'error');
            },
        });
    }

    cargarZonas() {
        this.cargando.zonas = true;
        this.vendedoresService.getZonas().subscribe({
            next: (data) => {
                this.zonas = data;
                this.cargando.zonas = false;
            },
            error: (error) => {
                console.error('Error al cargar zonas', error);
                this.cargando.zonas = false;
                this.showMessage(this.translate.instant('txt_error_cargar_zonas'), 'error');
            },
        });
    }

    cargarHistoricoVentas() {
        this.cargando.historico = true;
        this.vendedoresService.getHistoricoVentas().subscribe({
            next: (data) => {
                this.historicoVentas = data;
                this.totalVentas = data.total || 0;
                this.cargando.historico = false;

                if (this.chartRef && this.chartRef.nativeElement) {
                    this.inicializarGrafico();
                }
            },
            error: (error) => {
                console.error('Error al cargar histórico de ventas', error);
                this.cargando.historico = false;
                this.showMessage(this.translate.instant('txt_error_cargar_historico'), 'error');
            },
        });
    }

    cargarPlanesMetas() {
        this.cargando.planesMetas = true;
        this.vendedoresService.getPlanesMetas().subscribe({
            next: (data) => {
                // Tomamos solo los primeros 2 elementos como se muestra en la UI
                this.metas = data.metas?.slice(0, 2) || [];
                this.planes = data.planes?.slice(0, 2) || [];
                this.cargando.planesMetas = false;
            },
            error: (error) => {
                console.error('Error al cargar planes y metas', error);
                this.cargando.planesMetas = false;
                this.showMessage(this.translate.instant('txt_error_cargar_planes_metas'), 'error');
            },
        });
    }

    // Método para filtrar los datos
    filtrar() {
        this.clientes = this.clientesCompletos.filter((cliente) => {
            let cumpleFiltros = true;

            if (this.vendedorSeleccionado && cliente.vendedor_id) {
                cumpleFiltros = cumpleFiltros && cliente.vendedor_id === this.vendedorSeleccionado;
            }

            if (this.productoSeleccionado && cliente.productos) {
                cumpleFiltros = cumpleFiltros && cliente.productos.includes(this.productoSeleccionado);
            }

            if (this.zonaSeleccionada && cliente.direccion) {
                cumpleFiltros = cumpleFiltros && cliente.direccion.includes(this.zonaSeleccionada);
            }

            return cumpleFiltros;
        });

        this.showMessage(this.translate.instant('txt_filtros_aplicados'), 'success');
    }

    // Método para exportar a Excel
    exportar() {
        try {
            const datosExportar = this.clientes.map((cliente) => {
                const vendedor = this.vendedores.find((v) => v.id === cliente.vendedor_id);

                let productosTexto = '';
                if (cliente.productos && cliente.productos.length) {
                    const productosMapeados = cliente.productos.map((prodId: string) => {
                        const prod = this.productos.find((p) => p.id === prodId);
                        return prod ? prod.nombre : prodId;
                    });
                    productosTexto = productosMapeados.join(', ');
                }

                const zonaTexto = cliente.direccion.split(',').pop()?.trim() || '';

                return {
                    [this.translate.instant('txt_nombre')]: cliente.nombre,
                    [this.translate.instant('txt_direccion')]: cliente.direccion,
                    [this.translate.instant('txt_codigo')]: cliente.codigo,
                    [this.translate.instant('txt_promedio_ventas')]: cliente.promedio_ventas,
                    [this.translate.instant('txt_vendedor')]: vendedor ? vendedor.nombre : cliente.vendedor_id || '',
                    [this.translate.instant('txt_productos')]: productosTexto,
                    [this.translate.instant('txt_zona')]: zonaTexto,
                    [this.translate.instant('txt_fecha_reporte')]: new Date().toLocaleDateString(),
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(datosExportar);

            const columnWidths = [
                { wch: 20 }, // Nombre
                { wch: 30 }, // Dirección
                { wch: 10 }, // Código
                { wch: 15 }, // Promedio Ventas
                { wch: 20 }, // Vendedor
                { wch: 30 }, // Productos
                { wch: 15 }, // Zona
                { wch: 15 }, // Fecha
            ];
            worksheet['!cols'] = columnWidths;

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, this.translate.instant('txt_clientes'));

            if (this.historicoVentas?.datos_mensuales) {
                const meses = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
                const datosResumen = meses.map((mes) => ({
                    [this.translate.instant('txt_mes')]: this.translate.instant(`txt_${mes}`),
                    [this.translate.instant('txt_ventas')]: this.historicoVentas.datos_mensuales[mes] || 0,
                }));

                datosResumen.push({
                    [this.translate.instant('txt_mes')]: this.translate.instant('txt_total'),
                    [this.translate.instant('txt_ventas')]: this.totalVentas,
                });

                const worksheetResumen = XLSX.utils.json_to_sheet(datosResumen);
                XLSX.utils.book_append_sheet(workbook, worksheetResumen, this.translate.instant('txt_resumen_ventas'));
            }

            const fechaActual = new Date().toISOString().split('T')[0];
            XLSX.writeFile(workbook, `reporte_completo_${fechaActual}.xlsx`);

            this.showMessage(this.translate.instant('txt_exportacion_exitosa'), 'success');
        } catch (error) {
            console.error('Error al exportar datos', error);
            this.showMessage(this.translate.instant('txt_error_exportar'), 'error');
        }
    }

    // Inicializar el gráfico de histórico de ventas
    inicializarGrafico() {
        if (!this.historicoVentas?.datos_mensuales || !this.chartRef) {
            return;
        }

        if (this.chart) {
            this.chart.destroy();
        }

        const canvas = this.chartRef.nativeElement;
        const ctx = canvas.getContext('2d');

        const datos = this.historicoVentas.datos_mensuales;
        const meses = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

        const mesesTraducidos = meses.map((mes) => this.translate.instant(`txt_${mes}`));

        const valores = meses.map((mes) => datos[mes] || 0);

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: mesesTraducidos,
                datasets: [
                    {
                        label: this.translate.instant('txt_ventas'),
                        data: valores,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        tension: 0.4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
    }

    // Manejador para el cambio en los selectores
    onFiltroChange() {
        this.filtrar();
    }

    /**
     * Muestra un mensaje usando Sweetalert2
     * @param msg Mensaje a mostrar
     * @param type Tipo de mensaje: 'success', 'error', 'warning', 'info'
     */
    showMessage(msg = '', type: 'success' | 'error' | 'warning' | 'info' | 'question' = 'success') {
        const toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            customClass: {
                container: 'toast',
            },
        });

        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    }
}
