import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ReservasService } from '../../../core/services/reservas.service';
import type { EstadoReserva, Reserva } from '../../../core/models/reserva.model';

type FiltroTurnos = 'proximos' | 'pasados' | 'cancelados';

@Component({
  selector: 'app-paciente-turnos',
  imports: [RouterLink, MessageModule, ButtonModule, DialogModule],
  templateUrl: './paciente-turnos.html',
  styleUrl: './paciente-turnos.css',
})
export class PacienteTurnosComponent implements OnInit {
  private readonly zonaHoraria = 'America/Argentina/Buenos_Aires';
  private readonly reservasService = inject(ReservasService);

  readonly turnos = signal<Reserva[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal<string | null>(null);
  readonly mensajeExito = signal<string | null>(null);
  readonly errorCancelacion = signal<string | null>(null);
  readonly filtro = signal<FiltroTurnos>('proximos');
  readonly turnoAConfirmar = signal<Reserva | null>(null);
  readonly cancelando = signal(false);

  readonly turnosFiltrados = computed(() => {
    const filtro = this.filtro();
    const ahora = Date.now();
    const coincidencias = this.turnos().filter((turno) => {
      if (filtro === 'cancelados') return turno.estado === 'CANCELADO';
      if (turno.estado === 'CANCELADO') return false;
      const esFuturo = new Date(turno.fechaHora).getTime() >= ahora;
      return filtro === 'proximos'
        ? turno.estado === 'ACTIVO' && esFuturo
        : turno.estado !== 'ACTIVO' || !esFuturo;
    });

    return coincidencias.sort((a, b) => {
      const diferencia = new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime();
      return filtro === 'pasados' ? -diferencia : diferencia;
    });
  });

  readonly cantidades = computed(() => {
    const ahora = Date.now();
    const todos = this.turnos();
    return {
      proximos: todos.filter(
        (turno) => turno.estado === 'ACTIVO' && new Date(turno.fechaHora).getTime() >= ahora,
      ).length,
      pasados: todos.filter((turno) => {
        if (turno.estado === 'CANCELADO') return false;
        return turno.estado !== 'ACTIVO' || new Date(turno.fechaHora).getTime() < ahora;
      }).length,
      cancelados: todos.filter((turno) => turno.estado === 'CANCELADO').length,
    };
  });

  ngOnInit(): void {
    this.cargarTurnos();
  }

  seleccionarFiltro(filtro: FiltroTurnos): void {
    this.filtro.set(filtro);
    this.mensajeExito.set(null);
    this.errorCarga.set(null);
  }

  cargarTurnos(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.reservasService.listarMisTurnos().subscribe({
      next: (turnos) => {
        this.turnos.set(turnos);
        this.cargando.set(false);
      },
      error: () => {
        this.errorCarga.set('No pudimos cargar tus turnos. Revisá la conexión e intentá nuevamente.');
        this.cargando.set(false);
      },
    });
  }

  puedeCancelar(turno: Reserva): boolean {
    if (turno.estado !== 'ACTIVO') return false;
    return this.fechaCalendario(turno.fechaHora) > this.fechaCalendario(new Date());
  }

  solicitarCancelacion(turno: Reserva): void {
    if (!this.puedeCancelar(turno) || this.cancelando()) return;
    this.errorCancelacion.set(null);
    this.turnoAConfirmar.set(turno);
  }

  cerrarConfirmacion(): void {
    if (this.cancelando()) return;
    this.turnoAConfirmar.set(null);
    this.errorCancelacion.set(null);
  }

  confirmarCancelacion(): void {
    const turno = this.turnoAConfirmar();
    if (!turno || !this.puedeCancelar(turno) || this.cancelando()) return;

    this.cancelando.set(true);
    this.errorCancelacion.set(null);
    this.reservasService.cancelarTurno(turno.id).subscribe({
      next: () => {
        this.turnos.update((turnos) =>
          turnos.map((actual) =>
            actual.id === turno.id ? { ...actual, estado: 'CANCELADO' } : actual,
          ),
        );
        this.turnoAConfirmar.set(null);
        this.mensajeExito.set('El turno se canceló correctamente.');
        this.cancelando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorCancelacion.set(this.mensajeErrorCancelacion(error));
        this.cancelando.set(false);
      },
    });
  }

  etiquetaEstado(estado: EstadoReserva): string {
    const etiquetas: Record<EstadoReserva, string> = {
      ACTIVO: 'Confirmado',
      ATENDIDO: 'Atendido',
      AUSENTE: 'Ausente',
      CANCELADO: 'Cancelado',
    };
    return etiquetas[estado];
  }

  claseEstado(estado: EstadoReserva): string {
    const clases: Record<EstadoReserva, string> = {
      ACTIVO: 'badge-active',
      ATENDIDO: 'badge-attended',
      AUSENTE: 'badge-absent',
      CANCELADO: 'badge-cancelled',
    };
    return clases[estado];
  }

  diaSemana(fechaHora: string): string {
    return this.formatearFecha(fechaHora, { weekday: 'short' })
      .replace('.', '')
      .toLocaleUpperCase('es-AR');
  }

  diaMes(fechaHora: string): string {
    return this.formatearFecha(fechaHora, { day: '2-digit' });
  }

  mes(fechaHora: string): string {
    return this.formatearFecha(fechaHora, { month: 'short' })
      .replace('.', '')
      .toLocaleUpperCase('es-AR');
  }

  hora(fechaHora: string): string {
    return this.formatearFecha(fechaHora, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  }

  horaFin(fechaHora: string): string {
    const fin = new Date(fechaHora).getTime() + 60 * 60 * 1000;
    return this.hora(new Date(fin).toISOString());
  }

  private formatearFecha(fechaHora: string | Date, opciones: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat('es-AR', {
      ...opciones,
      timeZone: this.zonaHoraria,
    }).format(new Date(fechaHora));
  }

  private fechaCalendario(fechaHora: string | Date): string {
    const partes = new Intl.DateTimeFormat('en-CA', {
      timeZone: this.zonaHoraria,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date(fechaHora));
    const valores = Object.fromEntries(partes.map(({ type, value }) => [type, value]));
    return `${valores['year']}-${valores['month']}-${valores['day']}`;
  }

  precio(valor: number): string {
    return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(valor);
  }

  nombreMedico(turno: Reserva): string {
    return turno.medico.nombres + ' ' + turno.medico.apellidos;
  }

  private mensajeErrorCancelacion(error: HttpErrorResponse): string {
    const mensaje = error.error?.message;
    if (typeof mensaje === 'string') return mensaje;
    if (Array.isArray(mensaje)) return mensaje.join(' ');
    if (error.status === 0) return 'No se pudo conectar con el servidor. Intentá nuevamente.';
    return 'No se pudo cancelar el turno. Actualizá la lista e intentá nuevamente.';
  }
}
