import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reserva } from "./entities/reserva.entity.js";
import { ReservasService } from "./services/reservas.service.js";
import { ReservasController } from "./controllers/reservas.controller.js";
import { AuthModule } from "../auth/auth.module.js";
import { MedicosModule } from "../medicos/medicos.module.js";

@Module({
   imports: [TypeOrmModule.forFeature([Reserva]), AuthModule, MedicosModule],
   controllers: [ReservasController],
   providers: [ReservasService],
   exports: [],
})
export class ReservasModule {

}
