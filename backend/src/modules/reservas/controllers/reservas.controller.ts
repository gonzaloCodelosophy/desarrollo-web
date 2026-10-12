import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { ReservasService } from "../services/reservas.service.js";
import { CreateReservaDto } from "../dtos/input/create-reserva.dto.js";
import { ListReservasQueryDto } from "../dtos/input/list-reservas-query.dto.js";
import { ReservaDTO } from "../dtos/output/reserva.dto.js";
import { AuthGuard } from "../../auth/guards/auth.guard.js";
import { RolesGuard } from "../../auth/guards/roles.guard.js";
import { Roles } from "../../auth/decorators/roles.decorator.js";
import { RolUsuarioEnum } from "../../auth/enums/rol-usuario.enum.js";
import type { JwtPayload } from "../../auth/interfaces/jwt-payload.interface.js";

@ApiTags('reservas')
@Controller('reservas')
export class ReservasController {

    constructor(private readonly service: ReservasService) { }

    @ApiOperation({ summary: 'Reserva un turno (pacientes para sí mismos, administradores para cualquier paciente)' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(RolUsuarioEnum.PACIENTE, RolUsuarioEnum.ADMINISTRADOR)
    @Post()
    async crearReserva(@Body() dto: CreateReservaDto, @Req() request: Request): Promise<{ id: number }> {

        return await this.service.crearReserva(dto, this.currentUser(request));
    }

    @ApiOperation({ summary: 'Lista turnos: propios para médico/paciente, todos (con filtros) para administrador' })
    @ApiBearerAuth()
    @ApiOkResponse({ type: ReservaDTO, isArray: true })
    @UseGuards(AuthGuard)
    @Get()
    async listarReservas(@Query() query: ListReservasQueryDto, @Req() request: Request): Promise<ReservaDTO[]> {

        return await this.service.listarReservas(query, this.currentUser(request));
    }

    @ApiOperation({ summary: 'Cancela un turno (paciente hasta el día anterior, administrador hasta el inicio)' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(RolUsuarioEnum.PACIENTE, RolUsuarioEnum.ADMINISTRADOR)
    @Patch(':id/cancelar')
    async cancelarReserva(@Param('id') id: number, @Req() request: Request): Promise<void> {

        await this.service.cancelarReserva(id, this.currentUser(request));
    }

    @ApiOperation({ summary: 'Marca un turno propio como atendido (solo médicos)' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(RolUsuarioEnum.MEDICO)
    @Patch(':id/atender')
    async marcarAtendido(@Param('id') id: number, @Req() request: Request): Promise<void> {

        await this.service.marcarAtendido(id, this.currentUser(request));
    }

    @ApiOperation({ summary: 'Marca un turno propio como ausente (solo médicos)' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(RolUsuarioEnum.MEDICO)
    @Patch(':id/ausente')
    async marcarAusente(@Param('id') id: number, @Req() request: Request): Promise<void> {

        await this.service.marcarAusente(id, this.currentUser(request));
    }

    private currentUser(request: Request): JwtPayload {
        return (request as any)['usuario'] as JwtPayload;
    }

}
