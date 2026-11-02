import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { MedicosService } from '../../../core/services/medicos.service';
import type { Medico } from '../../../core/models/medico.model';

@Component({
  selector: 'app-aranceles',
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TagModule,
    MessageModule,
  ],
  templateUrl: './aranceles.html',
})
export class ArancelesComponent implements OnInit {
  private readonly medicosService = inject(MedicosService);
  private readonly fb = inject(FormBuilder);

  readonly medicos = signal<Medico[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly busqueda = signal('');
  readonly medicoSeleccionado = signal<Medico | null>(null);

  readonly mensajeExito = signal<string | null>(null);
  readonly mensajeError = signal<string | null>(null);

  readonly medicosFiltrados = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    const lista = this.medicos();
    if (!termino) return lista;

    return lista.filter(
      (m) =>
        m.nombres.toLowerCase().includes(termino) ||
        m.apellidos.toLowerCase().includes(termino) ||
        String(m.matricula).includes(termino),
    );
  });

  readonly form = this.fb.nonNullable.group({
    valorConsulta: [0, [Validators.required, Validators.min(1), Validators.pattern(/^[1-9]\d*$/)]],
  });

  ngOnInit(): void {
    this.cargarMedicos();
  }

  cargarMedicos(): void {
    this.cargando.set(true);
    this.mensajeError.set(null);

    this.medicosService.obtenerMedicos().subscribe({
      next: (data) => {
        this.medicos.set(data);
        this.cargando.set(false);

        const actual = this.medicoSeleccionado();
        if (actual) {
          const actualizado = data.find((m) => m.id === actual.id) ?? null;
          this.medicoSeleccionado.set(actualizado);
        } else if (data.length > 0) {
          this.seleccionarMedico(data[0]);
        }
      },
      error: () => {
        this.cargando.set(false);
        this.mensajeError.set('No se pudo cargar el listado de médicos. Intentá nuevamente.');
      },
    });
  }

  onBusquedaChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.busqueda.set(input.value);
  }

  seleccionarMedico(medico: Medico): void {
    this.medicoSeleccionado.set(medico);
    this.mensajeExito.set(null);
    this.mensajeError.set(null);
    this.form.reset({ valorConsulta: medico.valorConsulta });
  }

  cancelarEdicion(): void {
    const actual = this.medicoSeleccionado();
    if (actual) {
      this.form.reset({ valorConsulta: actual.valorConsulta });
    }
    this.mensajeExito.set(null);
    this.mensajeError.set(null);
  }

  guardarCambios(): void {
    this.form.markAllAsTouched();
    const medico = this.medicoSeleccionado();
    if (this.form.invalid || !medico || this.guardando()) return;

    const nuevoValor = Number(this.form.controls.valorConsulta.value);

    this.guardando.set(true);
    this.mensajeExito.set(null);
    this.mensajeError.set(null);

    this.medicosService
      .actualizarValorConsulta(medico.id, { valorConsulta: nuevoValor })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.medicos.update((lista) =>
            lista.map((m) => (m.id === medico.id ? { ...m, valorConsulta: nuevoValor } : m)),
          );
          this.medicoSeleccionado.set({ ...medico, valorConsulta: nuevoValor });
          this.mensajeExito.set(
            `Se actualizó el arancel de ${medico.nombres} ${medico.apellidos} correctamente.`,
          );
        },
        error: (err: HttpErrorResponse) => {
          this.guardando.set(false);
          if (err.status === 400) {
            this.mensajeError.set(
              'El valor ingresado es inválido. Debe ser un número entero mayor a 0.',
            );
          } else if (err.status === 403) {
            this.mensajeError.set('No tenés permisos para modificar el valor de la consulta.');
          } else {
            this.mensajeError.set('No se pudo actualizar el valor de la consulta.');
          }
        },
      });
  }

  obtenerIniciales(medico: Medico): string {
    const n = medico.nombres.charAt(0).toUpperCase();
    const a = medico.apellidos.charAt(0).toUpperCase();
    return `${n}${a}`;
  }
}
