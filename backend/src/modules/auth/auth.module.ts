import { Module } from "@nestjs/common";
import { LoginController } from "./controllers/login.controller.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Usuario } from "./entities/usuario.entity.js";
import { Medico } from "../medicos/entities/medico.entity.js";
import { UsuariosService } from "./services/usuarios.service.js";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./services/auth.service.js";
import { AuthGuard } from "./guards/auth.guard.js";
import { RolesGuard } from "./guards/roles.guard.js";

@Module({
    imports: [TypeOrmModule.forFeature([Usuario, Medico]),
    JwtModule.registerAsync({
        inject: [ConfigService],
        global: true,
        useFactory: (configService: ConfigService) => ({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN ?? '8h') as any },
        }),
    }),
    ],
    controllers: [LoginController],
    providers: [UsuariosService, AuthService, AuthGuard, RolesGuard],
    exports: [AuthGuard, RolesGuard, UsuariosService]
})
export class AuthModule {

}
