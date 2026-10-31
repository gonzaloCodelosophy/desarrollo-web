import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDTO } from '../dtos/input/login.dto.js';
import { LoginResponseDTO } from '../dtos/output/login-response.dto.js';
import { AuthService } from '../services/auth.service.js';

@ApiTags('auth')
@Controller('/auth')
export class LoginController {

    constructor(private service: AuthService){}

    @ApiOperation({ summary: 'Login con documento y clave' })
    @Post()
    async iniciarSesion(@Body() dto: LoginDTO): Promise<LoginResponseDTO> {
        return this.service.login(dto);
    }

}
