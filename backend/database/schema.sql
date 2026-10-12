-- ============================================================================
-- Sistema de Turnos - Clínica Médica
-- Script de creación de base de datos (DDL + datos de demo)
--
-- Uso:
--   psql -h localhost -U <usuario> -d clinica_turnos -f database/schema.sql
--   (o, con el docker-compose incluido en este proyecto)
--   docker compose exec -T postgres psql -U daw -d clinica_turnos < database/schema.sql
--
-- Es idempotente: puede ejecutarse varias veces sobre la misma base,
-- recreando el esquema desde cero cada vez (DROP ... IF EXISTS al inicio).
-- ============================================================================

DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS medicos;
DROP TABLE IF EXISTS usuarios;

DROP TYPE IF EXISTS estados_reservas;
DROP TYPE IF EXISTS roles_usuarios;
DROP TYPE IF EXISTS estados_usuarios;

-- ============================================================================
-- Enums
-- ============================================================================

CREATE TYPE estados_usuarios AS ENUM ('ACTIVO', 'BAJA');
CREATE TYPE roles_usuarios AS ENUM ('MEDICO', 'PACIENTE', 'ADMINISTRADOR');
CREATE TYPE estados_reservas AS ENUM ('ACTIVO', 'ATENDIDO', 'AUSENTE', 'CANCELADO');

-- ============================================================================
-- Tablas
-- ============================================================================

CREATE TABLE usuarios (
    id          SERIAL PRIMARY KEY,
    documento   TEXT NOT NULL UNIQUE,
    apellidos   TEXT NOT NULL,
    nombres     TEXT NOT NULL,
    email       TEXT NOT NULL,
    clave       TEXT NOT NULL,
    estado      estados_usuarios NOT NULL,
    rol         roles_usuarios NOT NULL
);

CREATE TABLE medicos (
    id              SERIAL PRIMARY KEY,
    id_usuario      INT NOT NULL UNIQUE REFERENCES usuarios (id),
    matricula       INT NOT NULL,
    valor_consulta  INT NOT NULL
);

CREATE TABLE reservas (
    id              SERIAL PRIMARY KEY,
    id_medico       INT NOT NULL REFERENCES medicos (id),
    id_paciente     INT NOT NULL REFERENCES usuarios (id),
    fecha_hora      TIMESTAMP NOT NULL,
    estado          estados_reservas NOT NULL,
    valor_consulta  INT NOT NULL
);

-- Evita doble reserva del mismo médico en el mismo horario, salvo que la
-- reserva existente esté CANCELADO (permite volver a reservar ese slot).
-- Es la segunda barrera contra condiciones de carrera, además del chequeo
-- que hace ReservasService antes de insertar.
CREATE UNIQUE INDEX reservas_medico_horario_activo_idx
    ON reservas (id_medico, fecha_hora)
    WHERE estado <> 'CANCELADO';

-- ============================================================================
-- Datos de demo
--
-- La gestión de usuarios/roles es responsabilidad de otro equipo/etapa; estos
-- INSERTs solo existen para poder loguearse y probar el sistema (y grabar el
-- video de la entrega) sin depender de esa etapa.
--
-- Password de demo para TODOS los usuarios: Clinica123!
-- (hash bcrypt, cost 10, generado con la misma librería `bcrypt` del backend)
-- ============================================================================

-- Administrador
INSERT INTO usuarios (documento, apellidos, nombres, email, clave, estado, rol) VALUES
('10000001', 'Administrador', 'Sistema', 'admin@clinica.com', '$2b$10$JueOiHaeY6.WoVnsRP6pg.GSu4.1.JSarGNHzGms6yQB3iJgHQBaC', 'ACTIVO', 'ADMINISTRADOR');

-- Médicos (usuario + fila en medicos, con distinto valor_consulta)
INSERT INTO usuarios (documento, apellidos, nombres, email, clave, estado, rol) VALUES
('20000001', 'Gómez', 'Laura', 'laura.gomez@clinica.com', '$2b$10$JueOiHaeY6.WoVnsRP6pg.GSu4.1.JSarGNHzGms6yQB3iJgHQBaC', 'ACTIVO', 'MEDICO'),
('20000002', 'Pérez', 'Martín', 'martin.perez@clinica.com', '$2b$10$JueOiHaeY6.WoVnsRP6pg.GSu4.1.JSarGNHzGms6yQB3iJgHQBaC', 'ACTIVO', 'MEDICO'),
('20000003', 'Fernández', 'Ana', 'ana.fernandez@clinica.com', '$2b$10$JueOiHaeY6.WoVnsRP6pg.GSu4.1.JSarGNHzGms6yQB3iJgHQBaC', 'ACTIVO', 'MEDICO');

INSERT INTO medicos (id_usuario, matricula, valor_consulta)
SELECT id, 1001, 5000 FROM usuarios WHERE documento = '20000001'
UNION ALL
SELECT id, 1002, 6000 FROM usuarios WHERE documento = '20000002'
UNION ALL
SELECT id, 1003, 7000 FROM usuarios WHERE documento = '20000003';

-- Pacientes
INSERT INTO usuarios (documento, apellidos, nombres, email, clave, estado, rol) VALUES
('30000001', 'Rodríguez', 'Carlos', 'carlos.rodriguez@mail.com', '$2b$10$JueOiHaeY6.WoVnsRP6pg.GSu4.1.JSarGNHzGms6yQB3iJgHQBaC', 'ACTIVO', 'PACIENTE'),
('30000002', 'Díaz', 'Sofía', 'sofia.diaz@mail.com', '$2b$10$JueOiHaeY6.WoVnsRP6pg.GSu4.1.JSarGNHzGms6yQB3iJgHQBaC', 'ACTIVO', 'PACIENTE'),
('30000003', 'Torres', 'Juan', 'juan.torres@mail.com', '$2b$10$JueOiHaeY6.WoVnsRP6pg.GSu4.1.JSarGNHzGms6yQB3iJgHQBaC', 'ACTIVO', 'PACIENTE');
