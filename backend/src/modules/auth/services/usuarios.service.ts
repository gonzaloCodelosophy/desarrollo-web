import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Usuario } from "../entities/usuario.entity.js";
import { EstadoUsuarioEnum } from "../enums/estado-usuario.enum.js";
import { Medico } from "../../medicos/entities/medico.entity.js";

@Injectable()
export class UsuariosService {

    constructor(
        @InjectRepository(Usuario) private readonly repository: Repository<Usuario>,
        @InjectRepository(Medico) private readonly medicosRepository: Repository<Medico>) {

    }

    async buscarUsuarioActivoPorDocumento(documento: string): Promise<Usuario | null> {

        return await this.repository.findOne({ where: { documento, estado: EstadoUsuarioEnum.ACTIVO } })
    }

    async buscarIdMedicoPorIdUsuario(idUsuario: number): Promise<number | undefined> {

        const medico = await this.medicosRepository.findOne({ where: { idUsuario } });
        return medico?.id;
    }

}
