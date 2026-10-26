export type EstadoReserva = 'ACTIVO' | 'ATENDIDO' | 'AUSENTE' | 'CANCELADO';

export interface Reserva {
  id: number;
  fechaHora: string;
  estado: EstadoReserva;
  valorConsulta: number;
  medico: {
    id: number;
    nombres: string;
    apellidos: string;
  };
  paciente: {
    id: number;
    nombres: string;
    apellidos: string;
  };
}
