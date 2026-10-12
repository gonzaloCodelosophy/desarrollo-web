import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { MedicosService } from "../services/medicos.service.js";
import { MedicoDTO } from "../dtos/output/medico.dto.js";
import { UpdateValorConsultaDto } from "../dtos/input/update-valor-consulta.dto.js";
import { AuthGuard } from "../../auth/guards/auth.guard.js";
import { RolesGuard } from "../../auth/guards/roles.guard.js";
import { Roles } from "../../auth/decorators/roles.decorator.js";
import { RolUsuarioEnum } from "../../auth/enums/rol-usuario.enum.js";

@ApiTags('medicos')
@Controller('medicos')
export class MedicosController {

    constructor(private readonly service: MedicosService) { }

    @ApiOperation({ summary: 'Lista los médicos activos de la clínica' })
    @ApiBearerAuth()
    @ApiOkResponse({ type: MedicoDTO, isArray: true })
    @UseGuards(AuthGuard)
    @Get()
    async obtenerMedicos(): Promise<MedicoDTO[]> {

        return await this.service.obtenerMedicos();
    }

    @ApiOperation({ summary: 'Modifica el valor de la consulta de un médico (solo administradores)' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(RolUsuarioEnum.ADMINISTRADOR)
    @Patch(':id/valor-consulta')
    async actualizarValorConsulta(@Param('id') id: number, @Body() dto: UpdateValorConsultaDto): Promise<void> {

        await this.service.actualizarValorConsulta(id, dto);
    }

}
