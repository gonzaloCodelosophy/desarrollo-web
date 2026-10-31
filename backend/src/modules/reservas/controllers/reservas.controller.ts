import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { ReservasService } from "../services/reservas.service.js";
import { CreateReservaDto } from "../dtos/input/create-reserva.dto.js";
import { CreateReservaResponseDto } from "../dtos/output/create-reserva-response.dto.js";
import { ListReservasQueryDto } from "../dtos/input/list-reservas-query.dto.js";
import { DisponibilidadQueryDto } from "../dtos/input/disponibilidad-query.dto.js";
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

   @ApiOperation({ summary: 'Reserva un turno' })
   @ApiBearerAuth()
   @ApiCreatedResponse({ type: CreateReservaResponseDto })
   @UseGuards(AuthGuard, RolesGuard)
   @Roles(RolUsuarioEnum.PACIENTE, RolUsuarioEnum.ADMINISTRADOR)
   @Post()
   async crearReserva(@Body() dto: CreateReservaDto, @Req() request: Request): Promise<CreateReservaResponseDto> {

      return await this.service.crearReserva(dto, this.currentUser(request));
   }

   @ApiOperation({ summary: 'Lista los turnos' })
   @ApiBearerAuth()
   @ApiOkResponse({ type: ReservaDTO, isArray: true })
   @UseGuards(AuthGuard)
   @Get()
   async listarReservas(@Query() query: ListReservasQueryDto, @Req() request: Request): Promise<ReservaDTO[]> {

      return await this.service.listarReservas(query, this.currentUser(request));
   }

    @ApiOperation({ summary: "Horarios ocupados de un médico en una fecha" })
    @ApiBearerAuth()
    @ApiOkResponse({ type: String, isArray: true })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(RolUsuarioEnum.PACIENTE, RolUsuarioEnum.ADMINISTRADOR)
    @Get("disponibilidad")
    async disponibilidad(@Query() query: DisponibilidadQueryDto): Promise<string[]> {
        const idMedico = Number(query.idMedico);
        return this.service.horariosOcupados(query.fecha, idMedico);
    }

   @ApiOperation({ summary: 'Cancela un turno' })
   @ApiBearerAuth()
   @UseGuards(AuthGuard, RolesGuard)
   @Roles(RolUsuarioEnum.PACIENTE, RolUsuarioEnum.ADMINISTRADOR)
   @Patch(':id/cancelar')
   async cancelarReserva(@Param('id', ParseIntPipe) id: number, @Req() request: Request): Promise<void> {

      await this.service.cancelarReserva(id, this.currentUser(request));
   }

   @ApiOperation({ summary: 'Marca el turno como atendido' })
   @ApiBearerAuth()
   @UseGuards(AuthGuard, RolesGuard)
   @Roles(RolUsuarioEnum.MEDICO)
   @Patch(':id/atender')
   async marcarAtendido(@Param('id', ParseIntPipe) id: number, @Req() request: Request): Promise<void> {

      await this.service.marcarAtendido(id, this.currentUser(request));
   }

   @ApiOperation({ summary: 'Marca el turno como ausente' })
   @ApiBearerAuth()
   @UseGuards(AuthGuard, RolesGuard)
   @Roles(RolUsuarioEnum.MEDICO)
   @Patch(':id/ausente')
   async marcarAusente(@Param('id', ParseIntPipe) id: number, @Req() request: Request): Promise<void> {

      await this.service.marcarAusente(id, this.currentUser(request));
   }

   private currentUser(request: Request): JwtPayload {
      return (request as any)['usuario'] as JwtPayload;
   }

}

