import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { EstadoUsuarioEnum } from "../enums/estado-usuario.enum.js";
import { RolUsuarioEnum } from "../enums/rol-usuario.enum.js";

@Entity({ name: "usuarios" })
export class Usuario {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    documento: string

    @Column()
    apellidos: string

    @Column()
    nombres: string

    @Column()
    email: string

    @Column()
    clave: string

    @Column({ type: "enum", enum: EstadoUsuarioEnum, enumName: "estados_usuarios" })
    estado: EstadoUsuarioEnum

    @Column({ type: "enum", enum: RolUsuarioEnum, enumName: "roles_usuarios" })
    rol: RolUsuarioEnum

}
