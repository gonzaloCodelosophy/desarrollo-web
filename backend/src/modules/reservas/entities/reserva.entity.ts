import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { EstadoReservaEnum } from "../enums/estado-reserva.enum.js";
import type { Medico } from "../../medicos/entities/medico.entity.js";
import type { Usuario } from "../../auth/entities/usuario.entity.js";

@Entity({ name: "reservas" })
export class Reserva {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ name: "id_medico" })
    idMedico: number

    @ManyToOne("Medico")
    @JoinColumn({ name: "id_medico" })
    medico: Medico

    @Column({ name: "id_paciente" })
    idPaciente: number

    @ManyToOne("Usuario")
    @JoinColumn({ name: "id_paciente" })
    paciente: Usuario

    @Column({ name: "fecha_hora", type: "timestamp" })
    fechaHora: Date

    @Column({ type: "enum", enum: EstadoReservaEnum })
    estado: EstadoReservaEnum

    @Column({ name: "valor_consulta" })
    valorConsulta: number

}
