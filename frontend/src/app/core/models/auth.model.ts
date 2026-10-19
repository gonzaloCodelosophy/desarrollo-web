import type { UsuarioSesion } from './usuario.model';

export interface LoginRequest {
  documento: string;
  clave: string;
}

export interface LoginResponse {
  accessToken: string;
  usuario: UsuarioSesion;
}
