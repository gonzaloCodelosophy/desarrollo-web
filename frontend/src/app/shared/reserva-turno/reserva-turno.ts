import { Component, DestroyRef, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { HttpErrorResponse } from "@angular/common/http";
import { Subscription, forkJoin, of } from "rxjs";
import { AuthService } from "../../core/auth/auth.service";
import { MedicosService } from "../../core/services/medicos.service";
import { PacientesService } from "../../core/services/pacientes.service";
import { ReservasService } from "../../core/services/reservas.service";
import type { Medico } from "../../core/models/medico.model";
import type { Paciente } from "../../core/models/paciente.model";

@Component({
    selector: "app-reserva-turno",
    imports: [FormsModule, RouterLink],
    templateUrl: "./reserva-turno.html",
    styleUrl: "./reserva-turno.css",
})
export class ReservaTurnoComponent {
    private readonly sesion = inject(AuthService);
    private readonly medicosSrv = inject(MedicosService);
    private readonly pacientesSrv = inject(PacientesService);
    private readonly reservasSrv = inject(ReservasService);
    private readonly destroyRef = inject(DestroyRef);
    private consulta?: Subscription;
    readonly esAdministrador = computed(() => this.sesion.userRole() === "ADMINISTRADOR");
    readonly destino = computed(() => this.esAdministrador() ? "/administracion/turnos" : "/paciente/turnos");
    readonly medicos = signal<Medico[]>([]);
    readonly pacientes = signal<Paciente[]>([]);
    readonly medicoId = signal(0);
    readonly pacienteId = signal(0);
    readonly busqueda = signal("");
    readonly fecha = signal(this.fechaArgentina());
    readonly hora = signal("");
    readonly cargando = signal(false);
    readonly errorCatalogos = signal("");
    readonly cargandoHorarios = signal(false);
    readonly errorHorarios = signal("");
    readonly enviando = signal(false);
    readonly error = signal("");
    readonly exito = signal("");
    readonly horariosOcupados = signal<string[]>([]);
    readonly horarios = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
    readonly medico = computed(() => this.medicos().find(m => m.id === this.medicoId()));
    readonly paciente = computed(() => this.pacientes().find(p => p.id === this.pacienteId()));
    readonly pacientesFiltrados = computed(() => {
        const texto = this.busqueda().trim().toLocaleLowerCase("es");
        return this.pacientes().filter(p => `${p.nombres} ${p.apellidos} ${p.documento}`.toLocaleLowerCase("es").includes(texto));
    });
    readonly ocupados = computed(() => new Set(this.horariosOcupados()));

    constructor() {
        this.cargarCatalogos();
    }

    get fechaMinima(): string {
        return this.fechaArgentina();
    }
    get fechaMaxima(): string {
        const limite = new Date(`${this.fechaMinima}T12:00:00-03:00`);
        limite.setUTCDate(limite.getUTCDate() + 30);
        return this.fechaArgentina(limite);
    }

    private fechaArgentina(fecha = new Date()): string {
        const partes = new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit",
        }).formatToParts(fecha);
        const valores = Object.fromEntries(partes.map(p => [p.type, p.value]));
        return `${valores["year"]}-${valores["month"]}-${valores["day"]}`;
    }

    cargarCatalogos(): void {
        if (this.cargando() || this.enviando()) {
            return;
        }
        this.cargando.set(true);
        this.errorCatalogos.set("");
        forkJoin({
            medicos: this.medicosSrv.obtenerMedicos(),
            pacientes: this.esAdministrador() ? this.pacientesSrv.obtenerPacientesActivos() : of([] as Paciente[]),
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: ({ medicos, pacientes }) => {
                this.medicos.set(medicos);
                this.pacientes.set(pacientes);
                this.cargando.set(false);
            },
            error: () => {
                this.cargando.set(false);
                this.errorCatalogos.set("No pudimos cargar los datos necesarios para reservar. Intentá nuevamente.");
            },
        });
    }

    seleccionarMedico(id: number): void {
        if (this.enviando()) {
            return;
        }
        this.medicoId.set(id);
        this.cambiarSeleccion();
    }

    cambiarFecha(fecha: string): void {
        if (this.enviando()) {
            return;
        }
        this.fecha.set(fecha);
        this.cambiarSeleccion();
    }

    private cambiarSeleccion(): void {
        this.hora.set("");
        this.error.set("");
        this.exito.set("");
        this.consultarHorarios();
    }

    consultarHorarios(): void {
        this.consulta?.unsubscribe();
        this.horariosOcupados.set([]);
        this.errorHorarios.set("");
        this.cargandoHorarios.set(false);
        if (!this.medico() || !this.fechaValida()) {
            return;
        }
        this.cargandoHorarios.set(true);
        this.consulta = this.reservasSrv.consultarDisponibilidad(this.fecha(), this.medicoId())
            .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                next: horarios => {
                    this.horariosOcupados.set(horarios);
                    if (this.ocupados().has(this.hora())) {
                        this.hora.set("");
                    }
                    this.cargandoHorarios.set(false);
                },
                error: () => {
                    this.cargandoHorarios.set(false);
                    this.errorHorarios.set("No se pudo consultar la disponibilidad. Reintentá antes de reservar.");
                },
            });
    }

    fechaValida(): boolean {
        const fecha = this.fecha();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            return false;
        }
        const instante = new Date(`${fecha}T12:00:00-03:00`);
        return !isNaN(instante.getTime()) && this.fechaArgentina(instante) === fecha && fecha >= this.fechaMinima && fecha <= this.fechaMaxima;
    }

    horarioDeshabilitado(hora: string): boolean {
        return !this.medico() || !this.fechaValida() || this.cargandoHorarios() || !!this.errorHorarios()
            || this.ocupados().has(hora) || Date.parse(`${this.fecha()}T${hora}:00-03:00`) <= Date.now();
    }

    elegirHora(hora: string): void {
        if (!this.enviando() && !this.horarioDeshabilitado(hora)) {
            this.hora.set(hora); this.error.set(""); this.exito.set("");
        }
    }

    puedeReservar(): boolean {
        return !this.cargando() && !this.errorCatalogos() && !this.enviando() && !!this.medico()
            && (!this.esAdministrador() || !!this.paciente())
            && this.horarios.includes(this.hora()) && !this.horarioDeshabilitado(this.hora());
    }

    confirmar(): void {
        if (!this.puedeReservar()) {
            return;
        }
        const medico = this.medico()!;
        const fecha = this.fecha();
        const hora = this.hora();
        const paciente = this.paciente();
        this.enviando.set(true);
        this.error.set("");
        this.exito.set("");
        this.reservasSrv.crearReserva({
            idMedico: medico.id,
            fechaHora: new Date(`${fecha}T${hora}:00-03:00`).toISOString(),
            ...(this.esAdministrador() ? { idPaciente: paciente!.id } : {}),
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: respuesta => {
                this.enviando.set(false);
                if (!Number.isInteger(respuesta?.id) || respuesta.id <= 0) {
                    this.error.set("El servidor respondió sin un número de reserva válido. Revisá el listado antes de volver a reservar.");
                    this.hora.set("");
                    this.consultarHorarios();
                    return;
                }
                this.exito.set(`Reserva #${respuesta.id} confirmada${paciente ? ` para ${paciente.nombres} ${paciente.apellidos}` : ""} con ${medico.nombres} ${medico.apellidos}, el ${fecha.split("-").reverse().join("/")} a las ${hora}.`);
                this.hora.set("");
                this.consultarHorarios();
            },
            error: (error: HttpErrorResponse) => {
                this.enviando.set(false);
                if (error.status === 409) {
                    this.error.set("Ese horario acaba de ser ocupado. Elegí otro horario; conservamos el resto de tus datos.");
                    this.hora.set("");
                    this.consultarHorarios();
                } else if (error.status === 400) {
                    const detalle = error.error?.message;
                    this.error.set(Array.isArray(detalle) ? detalle.join(" ") : typeof detalle === "string" ? detalle : "Revisá la fecha, el horario y el médico seleccionados.");
                } else {
                    this.error.set("No pudimos confirmar la reserva. Revisá el listado de turnos antes de reintentar para evitar duplicados.");
                }
            },
        });
    }

    precio(valor: number): string {
        return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(valor);
    }
}
