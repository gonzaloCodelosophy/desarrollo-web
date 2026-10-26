import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MedicosService } from '../../../core/services/medicos.service';
import { ReservasService } from '../../../core/services/reservas.service';
import { PacientesService } from '../../../core/services/pacientes.service';
import type { Medico } from '../../../core/models/medico.model';
import type { Paciente } from '../../../core/models/paciente.model';
import type { Reserva } from '../../../core/models/reserva.model';

const HORARIOS_DISPONIBLES: readonly string[] = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
];

@Component({
  selector: 'app-reservar-admin',
  imports: [ReactiveFormsModule, DecimalPipe, DatePipe, RouterLink],
  templateUrl: './reservar.html',
})
export class ReservarComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly medicosService = inject(MedicosService);
  private readonly reservasService = inject(ReservasService);
  private readonly pacientesService = inject(PacientesService);
  private readonly router = inject(Router);

  readonly horariosBase = HORARIOS_DISPONIBLES;

  readonly pacientes = signal<Paciente[]>([]);
  readonly medicos = signal<Medico[]>([]);
  readonly reservasDelDia = signal<Reserva[]>([]);

  readonly busquedaPaciente = signal<string>('');
  readonly cargandoDatos = signal<boolean>(false);
  readonly cargandoHorarios = signal<boolean>(false);
  readonly enviando = signal<boolean>(false);

  readonly mensajeExito = signal<string | null>(null);
  readonly mensajeError = signal<string | null>(null);

  readonly fechaMinima = this.formatearFechaLocal(new Date());
  readonly fechaMaxima = this.calcularFechaMaxima(30);

  readonly form = this.fb.nonNullable.group({
    idPaciente: [0, [Validators.required, Validators.min(1)]],
    idMedico: [0, [Validators.required, Validators.min(1)]],
    fecha: [this.fechaMinima, [Validators.required]],
    hora: ['', [Validators.required]],
  });

  readonly idPacienteSeleccionado = signal<number>(0);
  readonly idMedicoSeleccionado = signal<number>(0);
  readonly fechaSeleccionada = signal<string>(this.fechaMinima);
  readonly horaSeleccionada = signal<string>('');

  readonly pacientesFiltrados = computed(() => {
    const termino = this.busquedaPaciente().trim().toLowerCase();
    const lista = this.pacientes();
    if (!termino) return lista;

    return lista.filter(
      (p) =>
        p.nombres.toLowerCase().includes(termino) ||
        p.apellidos.toLowerCase().includes(termino) ||
        p.documento.toLowerCase().includes(termino),
    );
  });

  readonly pacienteActual = computed(
    () => this.pacientes().find((p) => p.id === this.idPacienteSeleccionado()) ?? null,
  );

  readonly medicoActual = computed(
    () => this.medicos().find((m) => m.id === this.idMedicoSeleccionado()) ?? null,
  );

  readonly horariosOcupados = computed(() => {
    const ocupados = new Set<string>();
    for (const r of this.reservasDelDia()) {
      if (r.estado !== 'CANCELADO') {
        const fechaObj = new Date(r.fechaHora);
        const hh = String(fechaObj.getHours()).padStart(2, '0');
        const mm = String(fechaObj.getMinutes()).padStart(2, '0');
        ocupados.add(`${hh}:${mm}`);
      }
    }
    return ocupados;
  });

  ngOnInit(): void {
    this.cargarCatalogosIniciales();
  }

  cargarCatalogosIniciales(): void {
    this.cargandoDatos.set(true);
    this.mensajeError.set(null);

    this.pacientesService.obtenerPacientesActivos().subscribe({
      next: (listaPacientes) => {
        this.pacientes.set(listaPacientes);
      },
    });

    this.medicosService.obtenerMedicos().subscribe({
      next: (listaMedicos) => {
        this.medicos.set(listaMedicos);
        this.cargandoDatos.set(false);
      },
      error: () => {
        this.cargandoDatos.set(false);
        this.mensajeError.set('No se pudieron cargar los médicos disponibles.');
      },
    });
  }

  onBusquedaPaciente(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.busquedaPaciente.set(input.value);
  }

  seleccionarPaciente(idPaciente: number): void {
    this.idPacienteSeleccionado.set(idPaciente);
    this.form.controls.idPaciente.setValue(idPaciente);
    this.form.controls.idPaciente.markAsTouched();
    this.mensajeError.set(null);
  }

  onPacienteSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const id = Number(select.value);
    this.seleccionarPaciente(id);
  }

  onMedicoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const id = Number(select.value);
    this.idMedicoSeleccionado.set(id);
    this.form.controls.idMedico.setValue(id);
    this.limpiarHoraSeleccionada();
    this.consultarDisponibilidad();
  }

  onFechaChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const nuevaFecha = input.value;
    this.fechaSeleccionada.set(nuevaFecha);
    this.form.controls.fecha.setValue(nuevaFecha);
    this.limpiarHoraSeleccionada();
    this.consultarDisponibilidad();
  }

  seleccionarHora(hora: string): void {
    if (this.estaHorarioDeshabilitado(hora)) return;
    this.horaSeleccionada.set(hora);
    this.form.controls.hora.setValue(hora);
    this.form.controls.hora.markAsTouched();
    this.mensajeError.set(null);
  }

  private limpiarHoraSeleccionada(): void {
    this.horaSeleccionada.set('');
    this.form.controls.hora.setValue('');
  }

  consultarDisponibilidad(): void {
    const idMedico = this.idMedicoSeleccionado();
    const fecha = this.fechaSeleccionada();

    if (!idMedico || !fecha || !this.esFechaEnRangoValido(fecha)) {
      this.reservasDelDia.set([]);
      return;
    }

    this.cargandoHorarios.set(true);
    this.reservasService.listarReservas({ fecha, idMedico }).subscribe({
      next: (reservas) => {
        this.reservasDelDia.set(reservas);
        this.cargandoHorarios.set(false);
      },
      error: () => {
        this.reservasDelDia.set([]);
        this.cargandoHorarios.set(false);
      },
    });
  }

  esFechaEnRangoValido(fecha: string): boolean {
    if (!fecha) return false;
    return fecha >= this.fechaMinima && fecha <= this.fechaMaxima;
  }

  estaHorarioDeshabilitado(hora: string): boolean {
    if (this.horariosOcupados().has(hora)) {
      return true;
    }

    const fecha = this.fechaSeleccionada();
    if (fecha === this.fechaMinima) {
      const [hh, mm] = hora.split(':').map(Number);
      const fechaHoraSlot = new Date();
      fechaHoraSlot.setHours(hh, mm, 0, 0);
      if (fechaHoraSlot.getTime() <= Date.now()) {
        return true;
      }
    }

    return false;
  }

  motivoHorarioNoDisponible(hora: string): string {
    if (this.horariosOcupados().has(hora)) {
      return 'Ocupado';
    }
    if (this.fechaSeleccionada() === this.fechaMinima && this.estaHorarioDeshabilitado(hora)) {
      return 'Finalizado';
    }
    return 'Disponible';
  }

  confirmarReserva(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.enviando()) return;

    const { idPaciente, idMedico, fecha, hora } = this.form.getRawValue();

    if (!this.esFechaEnRangoValido(fecha)) {
      this.mensajeError.set(
        'La fecha seleccionada debe estar entre hoy y un máximo de 30 días de anticipación.',
      );
      return;
    }

    if (this.estaHorarioDeshabilitado(hora)) {
      this.mensajeError.set('El horario seleccionado ya no está disponible.');
      return;
    }

    const [anio, mes, dia] = fecha.split('-').map(Number);
    const [hh, mm] = hora.split(':').map(Number);
    const fechaLocal = new Date(anio, mes - 1, dia, hh, mm, 0, 0);

    this.enviando.set(true);
    this.mensajeExito.set(null);
    this.mensajeError.set(null);

    this.reservasService
      .crearReserva({
        idMedico: Number(idMedico),
        idPaciente: Number(idPaciente),
        fechaHora: fechaLocal.toISOString(),
      })
      .subscribe({
        next: (res) => {
          this.enviando.set(false);
          const pac = this.pacienteActual();
          const med = this.medicoActual();
          this.mensajeExito.set(
            `¡Turno #${res.id} reservado con éxito para ${pac?.nombres} ${pac?.apellidos} con Dr/a. ${med?.nombres} ${med?.apellidos} (${hora} hs)!`,
          );
          this.limpiarHoraSeleccionada();
          this.consultarDisponibilidad();
        },
        error: (err: HttpErrorResponse) => {
          this.enviando.set(false);
          if (err.status === 409) {
            this.mensajeError.set(
              err.error?.message ||
                'Ese horario acaba de ser ocupado por otra reserva. Seleccioná otro horario.',
            );
            this.consultarDisponibilidad();
          } else if (err.status === 400) {
            const detalle = Array.isArray(err.error?.message)
              ? err.error.message.join(' ')
              : err.error?.message;
            this.mensajeError.set(
              detalle ||
                'Los datos de la reserva son inválidos. Verificá paciente, médico, fecha (máx. 30 días) y horario (08:00 a 15:00).',
            );
          } else {
            this.mensajeError.set('No se pudo registrar la reserva. Intentá nuevamente.');
          }
        },
      });
  }

  irAListadoTurnos(): void {
    this.router.navigate(['/administracion/turnos']);
  }

  private formatearFechaLocal(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  private calcularFechaMaxima(dias: number): string {
    const limite = new Date();
    limite.setDate(limite.getDate() + dias);
    return this.formatearFechaLocal(limite);
  }
}
