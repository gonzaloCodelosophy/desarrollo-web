import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Medico } from "./entities/medico.entity.js";
import { MedicosService } from "./services/medicos.service.js";
import { MedicosController } from "./controllers/medicos.controller.js";
import { AuthModule } from "../auth/auth.module.js";

@Module({
    imports: [TypeOrmModule.forFeature([Medico]), AuthModule],
    controllers: [MedicosController],
    providers: [MedicosService],
    exports: [MedicosService],
})
export class MedicosModule {

}
