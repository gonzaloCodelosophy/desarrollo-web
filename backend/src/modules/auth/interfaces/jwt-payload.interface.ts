import { RolUsuarioEnum } from "../enums/rol-usuario.enum.js";

export interface JwtPayload {
    sub: number
    documento: string
    rol: RolUsuarioEnum
    idMedico?: number
}
