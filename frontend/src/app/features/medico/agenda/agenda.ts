import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { ReservasService } from 'src/app/core/services/reservas.service';
import type { EstadoReserva, Reserva } from 'src/app/core/models/reserva.model';

registerLocaleData(localeEsAr);

@Component({
  selector: 'app-agenda',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './agenda.html',
  styleUrl: './agenda.css',
})
export class AgendaComponent {
  private readonly service = inject(ReservasService);
  private readonly destroyRef = inject(DestroyRef);
  private consulta?: Subscription;
  readonly fecha = signal(this.hoy());
  readonly reservas = signal<Reserva[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');
  readonly confirmacion = signal<{ reserva: Reserva; estado: 'ATENDIDO' | 'AUSENTE' } | null>(null);
  readonly resumen = computed(() => ({
    total: this.reservas().length,
    atendidos: this.reservas().filter(r => r.estado === 'ATENDIDO').length,
    ausentes: this.reservas().filter(r => r.estado === 'AUSENTE').length,
    pendientes: this.reservas().filter(r => r.estado === 'ACTIVO').length,
  }));

  constructor(){ this.cargar(); }

  hoy(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  esFutura(reserva: Reserva): boolean {
    const d = new Date(reserva.fechaHora);
    const dia = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return dia > this.hoy();
  }

  cambiarFecha(fecha: string): void {
    if(this.guardando()) return;
    this.fecha.set(fecha);
    this.exito.set('');
    this.cargar();
  }

  cargar(): void {
    this.consulta?.unsubscribe();
    this.confirmacion.set(null);
    this.reservas.set([]);
    this.error.set('');
    if(!this.fecha()) {
      this.cargando.set(false);
      this.error.set('Seleccioná una fecha para consultar tu agenda.');
      return;
    }
    this.cargando.set(true);
    this.consulta = this.service.listarReservas({ fecha: this.fecha() })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: reservas => {
          this.reservas.set([...reservas].sort((a, b) => Date.parse(a.fechaHora) - Date.parse(b.fechaHora)));
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
          this.error.set('No se pudo cargar la agenda. Intentá nuevamente.');
        },
      });
  }

  solicitar(reserva: Reserva, estado: 'ATENDIDO' | 'AUSENTE'): void {
    if(this.guardando() || reserva.estado !== 'ACTIVO') return;
    if(this.esFutura(reserva)) return;
    this.exito.set('');
    this.confirmacion.set({ reserva, estado });
  }

  confirmar(): void {
    const accion = this.confirmacion();
    if(!accion || this.guardando()) return;
    this.guardando.set(true);
    this.error.set('');
    const peticion = accion.estado === 'ATENDIDO'
      ? this.service.marcarAtendido(accion.reserva.id)
      : this.service.marcarAusente(accion.reserva.id);
    peticion.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.guardando.set(false);
        this.confirmacion.set(null);
        this.exito.set(`Turno marcado como ${this.textoEstado(accion.estado).toLowerCase()}.`);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.cargar();
        this.error.set(err.status === 409
          ? 'El turno ya cambió de estado. Revisá la agenda actualizada.'
          : err.status === 403
            ? 'No tenés permiso para modificar este turno.'
            : 'No se pudo actualizar el turno. Revisá su estado antes de intentar nuevamente.');
      },
    });
  }

  textoEstado(estado: EstadoReserva): string {
    return { ACTIVO: 'Pendiente', ATENDIDO: 'Atendido', AUSENTE: 'Ausente', CANCELADO: 'Cancelado' }[estado];
  }

  claseEstado(estado: EstadoReserva): string {
    return { ACTIVO: 'badge-pending', ATENDIDO: 'badge-attended', AUSENTE: 'badge-absent', CANCELADO: 'badge-cancelled' }[estado];
  }
}
