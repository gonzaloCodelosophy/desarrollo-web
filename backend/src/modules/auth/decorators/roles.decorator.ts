import { SetMetadata } from "@nestjs/common";
import { RolUsuarioEnum } from "../enums/rol-usuario.enum.js";

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolUsuarioEnum[]) => SetMetadata(ROLES_KEY, roles);
