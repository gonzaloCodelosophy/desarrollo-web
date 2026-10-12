import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { LoginDTO } from "../dtos/input/login.dto.js";
import { LoginResponseDTO } from "../dtos/output/login-response.dto.js";
import { AuthService } from "../services/auth.service.js";

@ApiTags('auth')
@Controller("/auth")
export class LoginController {

    constructor(private readonly service: AuthService) { }

    @ApiOperation({ summary: 'Inicia sesión con documento y clave, solo para usuarios activos' })
    @Post()
    async login(@Body() dto: LoginDTO): Promise<LoginResponseDTO> {
        return await this.service.login(dto);
    }

}
