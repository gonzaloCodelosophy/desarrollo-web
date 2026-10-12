import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator.js";
import { RolUsuarioEnum } from "../enums/rol-usuario.enum.js";
import type { JwtPayload } from "../interfaces/jwt-payload.interface.js";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const rolesPermitidos = this.reflector.getAllAndOverride<RolUsuarioEnum[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!rolesPermitidos || rolesPermitidos.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const usuario: JwtPayload = request['usuario'];

        if (!usuario || !rolesPermitidos.includes(usuario.rol)) {
            throw new ForbiddenException('No tiene permisos para realizar esta acción');
        }

        return true;
    }
}
