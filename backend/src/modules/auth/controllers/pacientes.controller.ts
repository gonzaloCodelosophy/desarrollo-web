import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { UsuariosService } from "../services/usuarios.service.js";
import { AuthGuard } from "../guards/auth.guard.js";
import { RolesGuard } from "../guards/roles.guard.js";
import { Roles } from "../decorators/roles.decorator.js";
import { RolUsuarioEnum } from "../enums/rol-usuario.enum.js";
import { PacienteResumenDTO } from "../../reservas/dtos/output/paciente-resumen.dto.js";

@ApiTags("pacientes")
@Controller("pacientes")
export class PacientesController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @ApiOperation({
    summary: "Lista los pacientes activos de la clínica (solo administradores)",
  })
  @ApiBearerAuth()
  @ApiOkResponse({ type: PacienteResumenDTO, isArray: true })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RolUsuarioEnum.ADMINISTRADOR)
  @Get()
  async obtenerPacientesActivos(): Promise<PacienteResumenDTO[]> {
    return await this.usuariosService.obtenerPacientesActivos();
  }
}
