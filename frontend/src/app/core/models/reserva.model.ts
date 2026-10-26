export type EstadoReserva = 'ACTIVO' | 'ATENDIDO' | 'AUSENTE' | 'CANCELADO';

export interface MedicoResumen {
  id: number;
  nombres: string;
  apellidos: string;
}

export interface PacienteResumen {
  id: number;
  nombres: string;
  apellidos: string;
  documento?: string;
}

export interface Reserva {
  id: number;
  fechaHora: string;
  estado: EstadoReserva;
  valorConsulta: number;
  medico: MedicoResumen;
  paciente: PacienteResumen;
}

export interface CreateReservaRequest {
  idMedico: number;
  fechaHora: string;
  idPaciente?: number;
}

export interface CreateReservaResponse {
  id: number;
}

export interface FiltroReservas {
  fecha?: string;
  idMedico?: number | string;
}
