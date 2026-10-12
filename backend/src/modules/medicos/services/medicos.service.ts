import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Medico } from "../entities/medico.entity.js";
import { UpdateValorConsultaDto } from "../dtos/input/update-valor-consulta.dto.js";
import { MedicoDTO } from "../dtos/output/medico.dto.js";
import { EstadoUsuarioEnum } from "../../auth/enums/estado-usuario.enum.js";

@Injectable()
export class MedicosService {

    constructor(@InjectRepository(Medico) private readonly repository: Repository<Medico>) { }

    async obtenerMedicos(): Promise<MedicoDTO[]> {

        const medicos: Medico[] = await this.repository.find({
            relations: { usuario: true },
            where: { usuario: { estado: EstadoUsuarioEnum.ACTIVO } },
            order: { id: 'ASC' },
        });

        return medicos.map((medico) => {
            const dto = new MedicoDTO();
            dto.id = medico.id;
            dto.nombres = medico.usuario.nombres;
            dto.apellidos = medico.usuario.apellidos;
            dto.matricula = medico.matricula;
            dto.valorConsulta = medico.valorConsulta;
            return dto;
        });
    }

    async actualizarValorConsulta(id: number, dto: UpdateValorConsultaDto): Promise<void> {

        const medico: Medico | null = await this.repository.findOne({ where: { id } });

        if (!medico) {
            throw new BadRequestException('El médico indicado no existe');
        }

        medico.valorConsulta = dto.valorConsulta;

        await this.repository.save(medico);
    }

    async buscarPorIdOrFail(id: number): Promise<Medico> {

        const medico: Medico | null = await this.repository.findOne({ where: { id } });

        if (!medico) {
            throw new BadRequestException('El médico indicado no existe');
        }

        return medico;
    }

}
