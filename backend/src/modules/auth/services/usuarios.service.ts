import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Usuario } from "../entities/usuario.entity.js";
import { EstadoUsuarioEnum } from "../enums/estado-usuario.enum.js";
import { RolUsuarioEnum } from "../enums/rol-usuario.enum.js";
import { Medico } from "../../medicos/entities/medico.entity.js";
import { PacienteResumenDTO } from "../../reservas/dtos/output/paciente-resumen.dto.js";

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario) private readonly repository: Repository<Usuario>,
    @InjectRepository(Medico)
    private readonly medicosRepository: Repository<Medico>,
  ) {}

  async buscarUsuarioActivoPorDocumento(
    documento: string,
  ): Promise<Usuario | null> {
    return await this.repository.findOne({
      where: { documento, estado: EstadoUsuarioEnum.ACTIVO },
    });
  }

  async buscarIdMedicoPorIdUsuario(
    idUsuario: number,
  ): Promise<number | undefined> {
    const medico = await this.medicosRepository.findOne({
      where: { idUsuario },
    });
    return medico?.id;
  }

  async obtenerPacientesActivos(): Promise<PacienteResumenDTO[]> {
    const pacientes = await this.repository.find({
      where: {
        rol: RolUsuarioEnum.PACIENTE,
        estado: EstadoUsuarioEnum.ACTIVO,
      },
      order: {
        apellidos: "ASC",
        nombres: "ASC",
      },
    });

    return pacientes.map((p) => ({
      id: p.id,
      documento: p.documento,
      nombres: p.nombres,
      apellidos: p.apellidos,
    }));
  }
}
