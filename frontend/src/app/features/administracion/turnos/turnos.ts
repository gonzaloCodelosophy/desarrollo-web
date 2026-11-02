import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { ReservasService } from '../../../core/services/reservas.service';
import { MedicosService } from '../../../core/services/medicos.service';
import type { EstadoReserva, Reserva } from '../../../core/models/reserva.model';
import type { Medico } from '../../../core/models/medico.model';

type FiltroPestana = 'TODOS' | EstadoReserva;

@Component({
  selector: 'app-turnos-admin',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    MessageModule,
    DialogModule,
  ],
  templateUrl: './turnos.html',
  styleUrl: './turnos.css',
})
export class TurnosComponent implements OnInit {
  private readonly reservasService = inject(ReservasService);
  private readonly medicosService = inject(MedicosService);

  readonly reservas = signal<Reserva[]>([]);
  readonly medicos = signal<Medico[]>([]);
  readonly cargando = signal(false);
  readonly cancelandoId = signal<number | null>(null);

  readonly filtroFecha = signal<string>('');
  readonly filtroIdMedico = signal<string>('');

  readonly pestanaActiva = signal<FiltroPestana>('TODOS');
  readonly busqueda = signal<string>('');

  readonly reservaACancelar = signal<Reserva | null>(null);

  readonly mensajeExito = signal<string | null>(null);
  readonly mensajeError = signal<string | null>(null);

  readonly reservasFiltradas = computed(() => {
    const estado = this.pestanaActiva();
    const termino = this.busqueda().trim().toLowerCase();

    return this.reservas().filter((r) => {
      const cumpleEstado = estado === 'TODOS' ? true : r.estado === estado;
      if (!cumpleEstado) return false;

      if (!termino) return true;
      const nombrePaciente = `${r.paciente.nombres} ${r.paciente.apellidos}`.toLowerCase();
      const nombreMedico = `${r.medico.nombres} ${r.medico.apellidos}`.toLowerCase();
      const dniPaciente = (r.paciente.documento ?? '').toLowerCase();
      const idStr = String(r.id);

      return (
        nombrePaciente.includes(termino) ||
        nombreMedico.includes(termino) ||
        idStr.includes(termino) ||
        dniPaciente.includes(termino)
      );
    });
  });

  readonly resumen = computed(() => {
    const lista = this.reservas();
    return {
      total: lista.length,
      activos: lista.filter((r) => r.estado === 'ACTIVO').length,
      atendidos: lista.filter((r) => r.estado === 'ATENDIDO').length,
      ausentes: lista.filter((r) => r.estado === 'AUSENTE').length,
      cancelados: lista.filter((r) => r.estado === 'CANCELADO').length,
    };
  });

  ngOnInit(): void {
    this.cargarMedicos();
    this.cargarReservas();
  }

  cargarMedicos(): void {
    this.medicosService.obtenerMedicos().subscribe({
      next: (data) => this.medicos.set(data),
      error: () => {
      },
    });
  }

  cargarReservas(): void {
    this.cargando.set(true);
    this.mensajeError.set(null);

    const fecha = this.filtroFecha().trim();
    const idMedico = this.filtroIdMedico().trim();

    this.reservasService
      .listarReservas({
        fecha: fecha || undefined,
        idMedico: idMedico || undefined,
      })
      .subscribe({
        next: (data) => {
          this.reservas.set(data);
          this.cargando.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.cargando.set(false);
          if (err.status === 400) {
            this.mensajeError.set(
              'Los filtros ingresados no son válidos. Revisá la fecha o el médico seleccionado.',
            );
          } else {
            this.mensajeError.set('No se pudieron cargar los turnos. Intentá nuevamente.');
          }
        },
      });
  }

  onFechaChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroFecha.set(input.value);
    this.cargarReservas();
  }

  onMedicoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroIdMedico.set(select.value);
    this.cargarReservas();
  }

  onEstadoSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pestanaActiva.set(select.value as FiltroPestana);
  }

  onBusquedaChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.busqueda.set(input.value);
  }

  seleccionarPestana(pestana: FiltroPestana): void {
    this.pestanaActiva.set(pestana);
  }

  limpiarFiltros(): void {
    const habiaFiltrosApi = this.filtroFecha() !== '' || this.filtroIdMedico() !== '';
    this.filtroFecha.set('');
    this.filtroIdMedico.set('');
    this.pestanaActiva.set('TODOS');
    this.busqueda.set('');

    if (habiaFiltrosApi) {
      this.cargarReservas();
    }
  }

  puedeCancelar(reserva: Reserva): boolean {
    if (reserva.estado !== 'ACTIVO') return false;
    const inicioTurno = new Date(reserva.fechaHora).getTime();
    return inicioTurno > Date.now();
  }

  motivoNoCancelable(reserva: Reserva): string {
    if (reserva.estado !== 'ACTIVO') {
      return `El turno ya está ${reserva.estado.toLowerCase()}.`;
    }
    const inicioTurno = new Date(reserva.fechaHora).getTime();
    if (inicioTurno <= Date.now()) {
      return 'El horario del turno ya inició o finalizó.';
    }
    return '';
  }

  solicitarCancelacion(reserva: Reserva): void {
    if (!this.puedeCancelar(reserva)) return;
    this.mensajeExito.set(null);
    this.mensajeError.set(null);
    this.reservaACancelar.set(reserva);
  }

  cerrarModalCancelacion(): void {
    if (this.cancelandoId() !== null) return;
    this.reservaACancelar.set(null);
  }

  confirmarCancelacion(): void {
    const reserva = this.reservaACancelar();
    if (!reserva || this.cancelandoId() !== null) return;

    this.cancelandoId.set(reserva.id);
    this.mensajeExito.set(null);
    this.mensajeError.set(null);

    this.reservasService.cancelarReserva(reserva.id).subscribe({
      next: () => {
        this.cancelandoId.set(null);
        this.reservaACancelar.set(null);
        this.reservas.update((lista) =>
          lista.map((r) => (r.id === reserva.id ? { ...r, estado: 'CANCELADO' } : r)),
        );
        this.mensajeExito.set(
          `El turno #${reserva.id} de ${reserva.paciente.nombres} ${reserva.paciente.apellidos} fue cancelado correctamente.`,
        );
      },
      error: (err: HttpErrorResponse) => {
        this.cancelandoId.set(null);
        this.reservaACancelar.set(null);
        if (err.status === 400 || err.status === 409) {
          this.mensajeError.set(
            err.error?.message ||
              'No se puede cancelar este turno porque ya inició o su estado cambió.',
          );
        } else if (err.status === 403) {
          this.mensajeError.set('No tenés permisos para cancelar este turno.');
        } else {
          this.mensajeError.set('Ocurrió un error al intentar cancelar el turno.');
        }
        this.cargarReservas();
      },
    });
  }

  obtenerClaseBadge(estado: EstadoReserva): string {
    switch (estado) {
      case 'ACTIVO':
        return 'badge badge-pending';
      case 'ATENDIDO':
        return 'badge badge-attended';
      case 'AUSENTE':
        return 'badge badge-absent';
      case 'CANCELADO':
        return 'badge badge-cancelled';
    }
  }

  obtenerSeverityTag(estado: EstadoReserva): 'info' | 'success' | 'danger' | 'secondary' {
    switch (estado) {
      case 'ACTIVO':
        return 'info';
      case 'ATENDIDO':
        return 'success';
      case 'AUSENTE':
        return 'danger';
      case 'CANCELADO':
        return 'secondary';
    }
  }

  obtenerTextoEstado(estado: EstadoReserva): string {
    switch (estado) {
      case 'ACTIVO':
        return 'Pendiente (Activo)';
      case 'ATENDIDO':
        return 'Atendido';
      case 'AUSENTE':
        return 'Ausente';
      case 'CANCELADO':
        return 'Cancelado';
    }
  }

  obtenerIniciales(nombres: string, apellidos: string): string {
    const n = nombres.charAt(0).toUpperCase();
    const a = apellidos.charAt(0).toUpperCase();
    return `${n}${a}`;
  }
}
