import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { LoginDTO } from "../dtos/input/login.dto.js";
import { LoginResponseDTO } from "../dtos/output/login-response.dto.js";
import { UsuariosService } from "./usuarios.service.js";
import { RolUsuarioEnum } from "../enums/rol-usuario.enum.js";
import type { JwtPayload } from "../interfaces/jwt-payload.interface.js";

@Injectable()
export class AuthService {

    constructor(private readonly usuariosService: UsuariosService,
        private jwtService: JwtService) { }

    async login(dto: LoginDTO): Promise<LoginResponseDTO> {

        const usuario = await this.usuariosService.buscarUsuarioActivoPorDocumento(dto.documento);

        if (!usuario) {
            throw new UnauthorizedException("Credenciales inválidas");
        }

        if (!bcrypt.compareSync(dto.clave, usuario.clave)) {
            throw new UnauthorizedException("Credenciales inválidas");
        }

        const payload: JwtPayload = {
            sub: usuario.id,
            documento: usuario.documento,
            rol: usuario.rol,
        };

        if (usuario.rol === RolUsuarioEnum.MEDICO) {
            payload.idMedico = await this.usuariosService.buscarIdMedicoPorIdUsuario(usuario.id);
        }

        return {
            accessToken: this.jwtService.sign(payload),
            usuario: {
                id: usuario.id,
                documento: usuario.documento,
                nombres: usuario.nombres,
                apellidos: usuario.apellidos,
                rol: usuario.rol,
            },
        };
    }
}
