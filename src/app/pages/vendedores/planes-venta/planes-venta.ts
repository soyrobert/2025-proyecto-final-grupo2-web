import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../components/modal/modal.component';

interface Vendedor {
  id: number;
  nombre: string;
  avatar?: string;
  metas: { [key: string]: number };
}

interface CeldaEditada {
  valor: number;
  esValida: boolean;
  modificada: boolean;
}

interface VendedorEditado {
  id: number;
  metasEditadas: { [key: string]: CeldaEditada };
  metasOriginales: { [key: string]: number };
}

@Component({
  standalone: true,
  selector: 'app-planes-venta',
  templateUrl: './planes-venta.html',
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, ModalComponent],
})
export class PlanesVenta implements OnInit {
  @ViewChild('modalMetas') modalMetas!: ModalComponent;

  // Vendedores con datos mock
  vendedores: Vendedor[] = [];
  vendedorSeleccionado: Vendedor | null = null;

  // Formulario para editar metas
  formularioMetas!: FormGroup;
  guardando: boolean = false;

  vendedoresEditados: VendedorEditado[] = [];
  guardandoCambios: boolean = false;

  mesesMostrados: string[] = [];

  nombresMeses: { [key: string]: string } = {
    '1': 'ene',
    '2': 'feb',
    '3': 'mar',
    '4': 'abr',
    '5': 'may',
    '6': 'jun',
    '7': 'jul',
    '8': 'ago',
    '9': 'sep',
    '10': 'oct',
    '11': 'nov',
    '12': 'dic'
  };

  constructor(private fb: FormBuilder) {
    this.inicializarMeses();
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    this.cargarDatosMock();
  }

  inicializarMeses(): void {
    const fechaActual = new Date();
    let mesActual = fechaActual.getMonth() + 1;
    let anioActual = fechaActual.getFullYear();

    for (let i = 0; i < 8; i++) {
      const mesKey = `${this.nombresMeses[mesActual]}/${anioActual}`;
      this.mesesMostrados.push(mesKey);

      mesActual++;
      if (mesActual > 12) {
        mesActual = 1;
        anioActual++;
      }
    }
  }

  inicializarFormulario(): void {
    const grupoControles: { [key: string]: any } = {};

    this.mesesMostrados.forEach(mes => {
      grupoControles[mes] = [0, [Validators.required, Validators.min(0)]];
    });

    this.formularioMetas = this.fb.group(grupoControles);
  }

  cargarDatosMock(): void {
    this.vendedores = [
      {
        id: 1,
        nombre: 'Robert Castro',
        avatar: '/assets/images/profile-16.jpeg',
        metas: this.generarMetasAleatorias()
      },
      {
        id: 2,
        nombre: 'Carlos Rodríguez',
        metas: this.generarMetasAleatorias()
      },
      {
        id: 3,
        nombre: 'María González',
        avatar: '/assets/images/profile-34.jpeg',
        metas: this.generarMetasAleatorias()
      },
      {
        id: 4,
        nombre: 'Jorge Pérez',
        metas: this.generarMetasAleatorias()
      },
      {
        id: 5,
        nombre: 'Laura Martínez',
        avatar: '/assets/images/user-profile.jpeg',
        metas: this.generarMetasAleatorias()
      }
    ];
  }

  generarMetasAleatorias(): { [key: string]: number } {
    const metas: { [key: string]: number } = {};

    this.mesesMostrados.forEach(mes => {
      const valorAleatorio = Math.floor(Math.random() * 16) + 5; // Entre 5 y 20
      metas[mes] = valorAleatorio * 1000;
    });

    return metas;
  }

  obtenerMetaPorMes(vendedor: Vendedor, mes: string): number {
    return vendedor.metas[mes] || 0;
  }

  abrirModalEditarMetas(vendedor: Vendedor): void {
    // Si el vendedor está en modo edición en línea, desactivarlo
    if (this.esVendedorEditado(vendedor.id)) {
      // Guardar los cambios actuales en la edición en línea
      this.guardarCambiosDeVendedor(vendedor.id);
    }

    this.vendedorSeleccionado = vendedor;

    // Establecer los valores actuales en el formulario
    const valoresFormulario: { [key: string]: number } = {};

    this.mesesMostrados.forEach(mes => {
      valoresFormulario[mes] = this.obtenerMetaPorMes(vendedor, mes);
    });

    this.formularioMetas.patchValue(valoresFormulario);

    this.modalMetas.open();
  }

  obtenerControlesMetas(): { key: string, label: string }[] {
    return this.mesesMostrados.map(mes => ({
      key: mes,
      label: mes.toUpperCase()
    }));
  }

  guardarMetas(): void {
    if (this.formularioMetas.valid && this.vendedorSeleccionado) {
      this.guardando = true;

      setTimeout(() => {
        this.mesesMostrados.forEach(mes => {
          const nuevoValor = this.formularioMetas.get(mes)?.value;
          if (nuevoValor !== undefined) {
            this.vendedorSeleccionado!.metas[mes] = nuevoValor;
          }
        });

        const indiceVendedorEditado = this.vendedoresEditados.findIndex(v => v.id === this.vendedorSeleccionado?.id);
        if (indiceVendedorEditado !== -1) {
          this.vendedoresEditados.splice(indiceVendedorEditado, 1);
        }

        this.guardando = false;
        this.modalMetas.close();

        console.log('Metas actualizadas con éxito:', this.vendedorSeleccionado);
      }, 1000);
    }
  }

  // ========== Métodos para edición en línea ==========

  onInputFocus(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      inputElement.select();
    }
  }

  habilitarEdicionEnLinea(vendedor: Vendedor): void {
    // Verificar si el vendedor ya está en edición
    if (this.esVendedorEditado(vendedor.id)) {
      return;
    }

    // Crear un objeto VendedorEditado para controlar la edición
    const vendedorEditado: VendedorEditado = {
      id: vendedor.id,
      metasEditadas: {},
      metasOriginales: { ...vendedor.metas }
    };

    this.mesesMostrados.forEach(mes => {
      const valorOriginal = this.obtenerMetaPorMes(vendedor, mes);
      vendedorEditado.metasEditadas[mes] = {
        valor: valorOriginal,
        esValida: true,
        modificada: false
      };
    });

    this.vendedoresEditados.push(vendedorEditado);
  }

  esVendedorEditado(vendedorId: number): boolean {
    return this.vendedoresEditados.some(v => v.id === vendedorId);
  }

  obtenerVendedorEditado(vendedorId: number): VendedorEditado | undefined {
    return this.vendedoresEditados.find(v => v.id === vendedorId);
  }

  obtenerValorEditado(vendedorId: number, mes: string): number {
    const vendedorEditado = this.obtenerVendedorEditado(vendedorId);
    if (vendedorEditado && vendedorEditado.metasEditadas[mes]) {
      return vendedorEditado.metasEditadas[mes].valor;
    }

    const vendedor = this.vendedores.find(v => v.id === vendedorId);
    return vendedor ? this.obtenerMetaPorMes(vendedor, mes) : 0;
  }

  actualizarValorEditado(vendedorId: number, mes: string, event: Event): void {
    const vendedorEditado = this.obtenerVendedorEditado(vendedorId);
    if (!vendedorEditado) return;

    const valorInput = (event.target as HTMLInputElement).value;
    const nuevoValor = valorInput === '' ? 0 : parseInt(valorInput, 10);

    const esValido = !isNaN(nuevoValor) && nuevoValor >= 0;

    const esModificado = nuevoValor !== vendedorEditado.metasOriginales[mes];

    vendedorEditado.metasEditadas[mes] = {
      valor: nuevoValor,
      esValida: esValido,
      modificada: esModificado
    };
  }

  esCeldaInvalida(vendedorId: number, mes: string): boolean {
    const vendedorEditado = this.obtenerVendedorEditado(vendedorId);
    if (!vendedorEditado || !vendedorEditado.metasEditadas[mes]) return false;

    return !vendedorEditado.metasEditadas[mes].esValida;
  }

  esCeldaModificada(vendedorId: number, mes: string): boolean {
    const vendedorEditado = this.obtenerVendedorEditado(vendedorId);
    if (!vendedorEditado || !vendedorEditado.metasEditadas[mes]) return false;

    return vendedorEditado.metasEditadas[mes].modificada;
  }

  hayVendedoresEditados(): boolean {
    return this.vendedoresEditados.length > 0;
  }

  contarVendedoresEditados(): number {
    return this.vendedoresEditados.filter(v =>
      Object.values(v.metasEditadas).some(meta => meta.modificada)
    ).length;
  }

  guardarCambiosDeVendedor(vendedorId: number): void {
    const vendedorEditado = this.obtenerVendedorEditado(vendedorId);
    if (!vendedorEditado) return;

    // Verificar si todas las celdas son válidas
    const todasValidas = Object.values(vendedorEditado.metasEditadas)
      .every(meta => meta.esValida);

    if (!todasValidas) return; // No guardar si hay valores inválidos

    const vendedor = this.vendedores.find(v => v.id === vendedorId);
    if (!vendedor) return;

    this.mesesMostrados.forEach(mes => {
      if (vendedorEditado.metasEditadas[mes] && vendedorEditado.metasEditadas[mes].modificada) {
        vendedor.metas[mes] = vendedorEditado.metasEditadas[mes].valor;
      }
    });

    const indice = this.vendedoresEditados.findIndex(v => v.id === vendedorId);
    if (indice !== -1) {
      this.vendedoresEditados.splice(indice, 1);
    }
  }

  guardarCambiosEnLinea(): void {
    if (!this.hayVendedoresEditados()) return;

    const todasValidas = this.vendedoresEditados.every(v =>
      Object.values(v.metasEditadas).every(meta => meta.esValida)
    );

    if (!todasValidas) {
      console.error('Hay valores inválidos, no se pueden guardar los cambios');
      return;
    }

    this.guardandoCambios = true;

    setTimeout(() => {
      [...this.vendedoresEditados].forEach(vendedorEditado => {
        this.guardarCambiosDeVendedor(vendedorEditado.id);
      });

      this.guardandoCambios = false;

      console.log('Cambios guardados correctamente');
    }, 1000);
  }

  cancelarCambiosEnLinea(): void {
    this.vendedoresEditados = [];
  }
}
