export type RolUsuario = 'PACIENTE' | 'MEDICO' | 'ADMINISTRADOR';
export type EstadoUsuario = 'ACTIVO' | 'BAJA';

export interface UsuarioSesion {
  id: number;
  documento: string;
  nombres: string;
  apellidos: string;
  rol: RolUsuario;
}
