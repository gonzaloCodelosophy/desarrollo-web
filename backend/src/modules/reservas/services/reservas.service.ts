import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { Reserva } from "../entities/reserva.entity.js";
import { EstadoReservaEnum } from "../enums/estado-reserva.enum.js";
import { CreateReservaDto } from "../dtos/input/create-reserva.dto.js";
import { CreateReservaResponseDto } from "../dtos/output/create-reserva-response.dto.js";
import { ListReservasQueryDto } from "../dtos/input/list-reservas-query.dto.js";
import { ReservaDTO } from "../dtos/output/reserva.dto.js";
import { MedicosService } from "../../medicos/services/medicos.service.js";
import { RolUsuarioEnum } from "../../auth/enums/rol-usuario.enum.js";
import type { JwtPayload } from "../../auth/interfaces/jwt-payload.interface.js";

@Injectable()
export class ReservasService {

   constructor(
      @InjectRepository(Reserva) private readonly repository: Repository<Reserva>,
      private readonly medicosService: MedicosService) { }

   async crearReserva(dto: CreateReservaDto, currentUser: JwtPayload): Promise<CreateReservaResponseDto> {

      const idPaciente = this.resolverIdPaciente(dto, currentUser);
      const fechaHora = new Date(dto.fechaHora);

      this.validarSlotHorario(fechaHora);
      this.validarAnticipacion(fechaHora);

      const medico = await this.medicosService.buscarPorIdOrFail(dto.idMedico);

      const conflicto = await this.repository.exists({
         where: {
            idMedico: dto.idMedico,
            fechaHora,
            estado: Not(EstadoReservaEnum.CANCELADO),
         },
      });

      if (conflicto) {
         throw new ConflictException('El médico ya tiene un turno reservado en ese horario');
      }

      const reserva = this.repository.create({
         idMedico: dto.idMedico,
         idPaciente,
         fechaHora,
         estado: EstadoReservaEnum.ACTIVO,
         valorConsulta: medico.valorConsulta,
      });

      try {
         await this.repository.save(reserva);
      } catch (error: any) {
         if (error?.code === '23505') {
            throw new ConflictException('El médico ya tiene un turno reservado en ese horario');
         }
         throw error;
      }

      return { id: reserva.id };
   }

   async listarReservas(query: ListReservasQueryDto, currentUser: JwtPayload): Promise<ReservaDTO[]> {

      const where: Record<string, unknown> = {};

      if (currentUser.rol === RolUsuarioEnum.PACIENTE) {
         where.idPaciente = currentUser.sub;
      } else if (currentUser.rol === RolUsuarioEnum.MEDICO) {
         if (!query.fecha) {
            throw new BadRequestException('Se debe indicar la fecha para listar los turnos');
         }
         where.idMedico = currentUser.idMedico;
      } else if (query.idMedico) {
         where.idMedico = Number(query.idMedico);
      }

      const reservas = await this.buscarConFiltros(where, query.fecha);

      return reservas.map((reserva) => this.aDTO(reserva));
   }

   async cancelarReserva(id: number, currentUser: JwtPayload): Promise<void> {

      const reserva = await this.buscarPorIdOrFail(id);

      if (reserva.estado !== EstadoReservaEnum.ACTIVO) {
         throw new ConflictException('El turno no está activo');
      }

      const ahora = new Date();

      if (currentUser.rol === RolUsuarioEnum.PACIENTE) {
         if (reserva.idPaciente !== currentUser.sub) {
            throw new ForbiddenException('El turno no pertenece al paciente');
         }
         if (this.inicioDelDia(ahora) >= this.inicioDelDia(reserva.fechaHora)) {
            throw new ForbiddenException('Solo se puede cancelar hasta el día anterior a la consulta');
         }
      } else if (currentUser.rol === RolUsuarioEnum.ADMINISTRADOR) {
         if (ahora >= reserva.fechaHora) {
            throw new ForbiddenException('Solo se puede cancelar hasta el momento en que inicia la consulta');
         }
      } else {
         throw new ForbiddenException('No tiene permisos para cancelar turnos');
      }

      reserva.estado = EstadoReservaEnum.CANCELADO;
      await this.repository.save(reserva);
   }

   async marcarAtendido(id: number, currentUser: JwtPayload): Promise<void> {
      await this.cambiarEstadoComoMedico(id, currentUser, EstadoReservaEnum.ATENDIDO);
   }

   async marcarAusente(id: number, currentUser: JwtPayload): Promise<void> {
      await this.cambiarEstadoComoMedico(id, currentUser, EstadoReservaEnum.AUSENTE);
   }

   private async cambiarEstadoComoMedico(id: number, currentUser: JwtPayload, estado: EstadoReservaEnum): Promise<void> {

      const reserva = await this.buscarPorIdOrFail(id);

      if (reserva.idMedico !== currentUser.idMedico) {
         throw new ForbiddenException('El turno no pertenece al médico');
      }

      if (reserva.estado !== EstadoReservaEnum.ACTIVO) {
         throw new ConflictException('El turno no está activo');
      }

      reserva.estado = estado;
      await this.repository.save(reserva);
   }

   private resolverIdPaciente(dto: CreateReservaDto, currentUser: JwtPayload): number {

      if (currentUser.rol === RolUsuarioEnum.PACIENTE) {
         return currentUser.sub;
      }

      if (!dto.idPaciente) {
         throw new BadRequestException('Se debe indicar el paciente para el turno');
      }

      return dto.idPaciente;
   }

   private validarSlotHorario(fechaHora: Date): void {

      if (fechaHora.getMinutes() !== 0 || fechaHora.getSeconds() !== 0 || fechaHora.getMilliseconds() !== 0) {
         throw new BadRequestException('El turno debe iniciar en punto');
      }

      const hora = fechaHora.getHours();

      /* chicos: la hora de apertura es 8 y cierra a las 16, o sea que el ultimo turno es a las 15 */
      if(hora < 8 || hora >= 16){
         throw new BadRequestException('El horario de atención es de 8hs a 16hs');
      }
   }

   /*  chicos: se puede reservar hasta 30 dias adelante, contando hasta el final de ese dia
      samuel encontro un tema con esto, cuando canela a veces a veces queda el turno como tomado en vez 
      de liberarlo 
   */
   private validarAnticipacion(fechaHora: Date): void {

      const ahora = new Date();

      if (fechaHora < ahora) {
         throw new BadRequestException('No se puede reservar un turno en el pasado');
      }

      const limite = new Date(ahora);
      limite.setDate(limite.getDate() + 30);
      limite.setHours(23, 59, 59, 999);

      if(fechaHora > limite){
         throw new BadRequestException('Las reservas se pueden realizar con un máximo de 30 días de anticipación');
      }
   }

   private inicioDelDia(fecha: Date): Date {
      return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
   }

   private async buscarConFiltros(where: Record<string, unknown>, fecha?: string): Promise<Reserva[]> {

      const qb = this.repository.createQueryBuilder('reserva')
         .leftJoinAndSelect('reserva.medico', 'medico')
         .leftJoinAndSelect('medico.usuario', 'medicoUsuario')
         .leftJoinAndSelect('reserva.paciente', 'paciente')
         .orderBy('reserva.fechaHora', 'ASC');

      if (where.idPaciente) {
         qb.andWhere('reserva.idPaciente = :idPaciente', { idPaciente: where.idPaciente });
      }

      if (where.idMedico) {
         qb.andWhere('reserva.idMedico = :idMedico', { idMedico: where.idMedico });
      }

      if(fecha){
         const desde = new Date(`${fecha}T00:00:00`);
         const hasta = new Date(`${fecha}T23:59:59.999`);
         qb.andWhere('reserva.fechaHora BETWEEN :desde AND :hasta', { desde, hasta });
      }

      return qb.getMany();
   }

   private async buscarPorIdOrFail(id: number): Promise<Reserva> {

      const reserva = await this.repository.findOne({
         where: { id },
         relations: { medico: { usuario: true }, paciente: true },
      });

      if (!reserva) {
         throw new NotFoundException('El turno indicado no existe');
      }

      return reserva;
   }

   private aDTO(reserva: Reserva): ReservaDTO {

      return {
         id: reserva.id,
         fechaHora: reserva.fechaHora,
         estado: reserva.estado,
         valorConsulta: reserva.valorConsulta,
         medico: {
            id: reserva.medico.id,
            nombres: reserva.medico.usuario.nombres,
            apellidos: reserva.medico.usuario.apellidos,
         },
         paciente: {
            id: reserva.paciente.id,
            nombres: reserva.paciente.nombres,
            apellidos: reserva.paciente.apellidos,
            documento: reserva.paciente.documento,
         },
      };
   }

}
