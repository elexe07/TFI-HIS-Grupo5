-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "admision";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "enfermeria";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "facturacion";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "hce";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "iam";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "recursos";

-- CreateEnum
CREATE TYPE "admision"."TipoDocumento" AS ENUM ('DNI', 'PASAPORTE', 'OTRO');

-- CreateEnum
CREATE TYPE "admision"."Sexo" AS ENUM ('F', 'M', 'X');

-- CreateEnum
CREATE TYPE "admision"."EstadoTurno" AS ENUM ('RESERVADO', 'CANCELADO', 'ATENDIDO');

-- CreateEnum
CREATE TYPE "admision"."NivelTriaje" AS ENUM ('ROJO', 'NARANJA', 'AMARILLO', 'VERDE', 'AZUL');

-- CreateEnum
CREATE TYPE "admision"."EstadoTriaje" AS ENUM ('EN_ESPERA', 'ATENDIDO');

-- CreateEnum
CREATE TYPE "hce"."SeveridadAlergia" AS ENUM ('LEVE', 'MODERADA', 'GRAVE');

-- CreateEnum
CREATE TYPE "hce"."EstadoPrescripcion" AS ENUM ('ACTIVA', 'SUSPENDIDA', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "hce"."TipoEstudio" AS ENUM ('LABORATORIO', 'IMAGEN', 'OTRO');

-- CreateEnum
CREATE TYPE "enfermeria"."EstadoIndicacion" AS ENUM ('PENDIENTE', 'EJECUTADA', 'OMITIDA');

-- CreateEnum
CREATE TYPE "recursos"."EstadoCama" AS ENUM ('LIBRE', 'OCUPADA', 'EN_LIMPIEZA', 'BLOQUEADA');

-- CreateEnum
CREATE TYPE "recursos"."EstadoInternacion" AS ENUM ('ACTIVA', 'ALTA');

-- CreateEnum
CREATE TYPE "facturacion"."ConceptoCargo" AS ENUM ('CONSULTA', 'MEDICACION', 'DIA_CAMA');

-- CreateEnum
CREATE TYPE "facturacion"."TipoCuenta" AS ENUM ('CONSULTA', 'INTERNACION');

-- CreateEnum
CREATE TYPE "facturacion"."EstadoCuenta" AS ENUM ('ABIERTA', 'CERRADA');

-- CreateTable
CREATE TABLE "iam"."usuarios" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol_id" UUID NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam"."roles" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam"."permisos" (
    "id" UUID NOT NULL,
    "codigo" TEXT NOT NULL,

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam"."roles_permisos" (
    "rol_id" UUID NOT NULL,
    "permiso_id" UUID NOT NULL,

    CONSTRAINT "roles_permisos_pkey" PRIMARY KEY ("rol_id","permiso_id")
);

-- CreateTable
CREATE TABLE "admision"."pacientes" (
    "id" UUID NOT NULL,
    "usuario_id" UUID,
    "tipo_documento" "admision"."TipoDocumento" NOT NULL,
    "numero_documento" VARCHAR(20) NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "fecha_nacimiento" DATE NOT NULL,
    "sexo" "admision"."Sexo" NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "obra_social_codigo" TEXT,
    "numero_afiliado" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admision"."medicos" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "matricula" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "especialidad" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admision"."agendas" (
    "id" UUID NOT NULL,
    "medico_id" UUID NOT NULL,
    "dia_semana" SMALLINT NOT NULL,
    "hora_inicio" TIME NOT NULL,
    "hora_fin" TIME NOT NULL,
    "duracion_turno_min" SMALLINT NOT NULL,

    CONSTRAINT "agendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admision"."turnos" (
    "id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "medico_id" UUID NOT NULL,
    "inicio" TIMESTAMPTZ NOT NULL,
    "fin" TIMESTAMPTZ NOT NULL,
    "estado" "admision"."EstadoTurno" NOT NULL DEFAULT 'RESERVADO',
    "motivo_consulta" TEXT,
    "creado_por" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admision"."triajes" (
    "id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "nivel" "admision"."NivelTriaje" NOT NULL,
    "motivo" TEXT NOT NULL,
    "estado" "admision"."EstadoTriaje" NOT NULL DEFAULT 'EN_ESPERA',
    "llegada_en" TIMESTAMPTZ NOT NULL,
    "registrado_por" UUID NOT NULL,

    CONSTRAINT "triajes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hce"."historias_clinicas" (
    "id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "origen_evento_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historias_clinicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hce"."evoluciones" (
    "id" UUID NOT NULL,
    "historia_id" UUID NOT NULL,
    "turno_id" UUID,
    "internacion_id" UUID,
    "medico_id" UUID NOT NULL,
    "motivo" TEXT NOT NULL,
    "diagnostico" TEXT NOT NULL,
    "tratamiento" TEXT,
    "registrado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evoluciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hce"."alergias" (
    "id" UUID NOT NULL,
    "historia_id" UUID NOT NULL,
    "sustancia" TEXT NOT NULL,
    "severidad" "hce"."SeveridadAlergia" NOT NULL,
    "registrado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registrado_por" UUID NOT NULL,

    CONSTRAINT "alergias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hce"."antecedentes_familiares" (
    "id" UUID NOT NULL,
    "historia_id" UUID NOT NULL,
    "parentesco" TEXT NOT NULL,
    "condicion" TEXT NOT NULL,
    "registrado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registrado_por" UUID NOT NULL,

    CONSTRAINT "antecedentes_familiares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hce"."prescripciones" (
    "id" UUID NOT NULL,
    "historia_id" UUID NOT NULL,
    "evolucion_id" UUID,
    "medico_id" UUID NOT NULL,
    "medicamento" TEXT NOT NULL,
    "dosis" TEXT NOT NULL,
    "frecuencia_horas" SMALLINT NOT NULL,
    "duracion_dias" SMALLINT NOT NULL,
    "estado" "hce"."EstadoPrescripcion" NOT NULL DEFAULT 'ACTIVA',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "prescripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hce"."estudios" (
    "id" UUID NOT NULL,
    "historia_id" UUID NOT NULL,
    "tipo" "hce"."TipoEstudio" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "resultado" TEXT,
    "fecha" DATE NOT NULL,
    "registrado_por" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estudios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enfermeria"."indicaciones" (
    "id" UUID NOT NULL,
    "internacion_id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "prescripcion_id" UUID NOT NULL,
    "descripcion" TEXT NOT NULL,
    "programada_para" TIMESTAMPTZ NOT NULL,
    "estado" "enfermeria"."EstadoIndicacion" NOT NULL DEFAULT 'PENDIENTE',
    "motivo_omision" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "indicaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enfermeria"."signos_vitales" (
    "id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "internacion_id" UUID,
    "temperatura" DECIMAL(4,1),
    "presion_sistolica" SMALLINT,
    "presion_diastolica" SMALLINT,
    "frecuencia_cardiaca" SMALLINT,
    "saturacion_o2" SMALLINT,
    "registrado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registrado_por" UUID NOT NULL,

    CONSTRAINT "signos_vitales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enfermeria"."administraciones_medicacion" (
    "id" UUID NOT NULL,
    "indicacion_id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "medicamento" TEXT NOT NULL,
    "administrada_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "administrada_por" UUID NOT NULL,

    CONSTRAINT "administraciones_medicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enfermeria"."notas_enfermeria" (
    "id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "internacion_id" UUID,
    "texto" TEXT NOT NULL,
    "registrado_en" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registrado_por" UUID NOT NULL,

    CONSTRAINT "notas_enfermeria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recursos"."habitaciones" (
    "id" UUID NOT NULL,
    "sector" TEXT NOT NULL,
    "numero" TEXT NOT NULL,

    CONSTRAINT "habitaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recursos"."camas" (
    "id" UUID NOT NULL,
    "habitacion_id" UUID NOT NULL,
    "codigo" TEXT NOT NULL,
    "estado" "recursos"."EstadoCama" NOT NULL DEFAULT 'LIBRE',
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "camas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recursos"."internaciones" (
    "id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "cama_id" UUID NOT NULL,
    "medico_id" UUID NOT NULL,
    "motivo" TEXT NOT NULL,
    "estado" "recursos"."EstadoInternacion" NOT NULL DEFAULT 'ACTIVA',
    "ingreso_en" TIMESTAMPTZ NOT NULL,
    "egreso_en" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "internaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recursos"."insumos" (
    "id" UUID NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "medicamento_asociado" TEXT,
    "stock_actual" INTEGER NOT NULL,
    "stock_minimo" INTEGER NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturacion"."obras_sociales" (
    "id" UUID NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "porcentaje_cobertura" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "obras_sociales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturacion"."tarifas" (
    "id" UUID NOT NULL,
    "concepto" "facturacion"."ConceptoCargo" NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "tarifas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturacion"."cuentas" (
    "id" UUID NOT NULL,
    "paciente_id" UUID NOT NULL,
    "tipo" "facturacion"."TipoCuenta" NOT NULL,
    "referencia_id" UUID NOT NULL,
    "cobertura_validada" BOOLEAN NOT NULL DEFAULT false,
    "porcentaje_cobertura" DECIMAL(5,2),
    "estado" "facturacion"."EstadoCuenta" NOT NULL DEFAULT 'ABIERTA',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "cuentas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturacion"."cargos" (
    "id" UUID NOT NULL,
    "cuenta_id" UUID NOT NULL,
    "concepto" "facturacion"."ConceptoCargo" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "monto_unitario" DECIMAL(12,2) NOT NULL,
    "monto_total" DECIMAL(12,2) NOT NULL,
    "origen_evento_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cargos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "iam"."usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "iam"."roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_codigo_key" ON "iam"."permisos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_usuario_id_key" ON "admision"."pacientes"("usuario_id");

-- CreateIndex
CREATE INDEX "pacientes_apellido_idx" ON "admision"."pacientes"("apellido");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_tipo_documento_numero_documento_key" ON "admision"."pacientes"("tipo_documento", "numero_documento");

-- CreateIndex
CREATE UNIQUE INDEX "medicos_usuario_id_key" ON "admision"."medicos"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "medicos_matricula_key" ON "admision"."medicos"("matricula");

-- CreateIndex
CREATE INDEX "agendas_medico_id_idx" ON "admision"."agendas"("medico_id");

-- CreateIndex
CREATE INDEX "turnos_medico_id_inicio_idx" ON "admision"."turnos"("medico_id", "inicio");

-- CreateIndex
CREATE INDEX "turnos_paciente_id_inicio_idx" ON "admision"."turnos"("paciente_id", "inicio");

-- CreateIndex
CREATE INDEX "triajes_estado_nivel_llegada_en_idx" ON "admision"."triajes"("estado", "nivel", "llegada_en");

-- CreateIndex
CREATE UNIQUE INDEX "historias_clinicas_paciente_id_key" ON "hce"."historias_clinicas"("paciente_id");

-- CreateIndex
CREATE UNIQUE INDEX "historias_clinicas_origen_evento_id_key" ON "hce"."historias_clinicas"("origen_evento_id");

-- CreateIndex
CREATE INDEX "evoluciones_historia_id_registrado_en_idx" ON "hce"."evoluciones"("historia_id", "registrado_en" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "alergias_historia_id_sustancia_key" ON "hce"."alergias"("historia_id", "sustancia");

-- CreateIndex
CREATE INDEX "antecedentes_familiares_historia_id_idx" ON "hce"."antecedentes_familiares"("historia_id");

-- CreateIndex
CREATE INDEX "prescripciones_historia_id_estado_idx" ON "hce"."prescripciones"("historia_id", "estado");

-- CreateIndex
CREATE INDEX "estudios_historia_id_idx" ON "hce"."estudios"("historia_id");

-- CreateIndex
CREATE INDEX "indicaciones_internacion_id_programada_para_idx" ON "enfermeria"."indicaciones"("internacion_id", "programada_para");

-- CreateIndex
CREATE UNIQUE INDEX "indicaciones_prescripcion_id_programada_para_key" ON "enfermeria"."indicaciones"("prescripcion_id", "programada_para");

-- CreateIndex
CREATE INDEX "signos_vitales_paciente_id_registrado_en_idx" ON "enfermeria"."signos_vitales"("paciente_id", "registrado_en" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "administraciones_medicacion_indicacion_id_key" ON "enfermeria"."administraciones_medicacion"("indicacion_id");

-- CreateIndex
CREATE INDEX "administraciones_medicacion_paciente_id_idx" ON "enfermeria"."administraciones_medicacion"("paciente_id");

-- CreateIndex
CREATE INDEX "notas_enfermeria_paciente_id_registrado_en_idx" ON "enfermeria"."notas_enfermeria"("paciente_id", "registrado_en" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "habitaciones_sector_numero_key" ON "recursos"."habitaciones"("sector", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "camas_codigo_key" ON "recursos"."camas"("codigo");

-- CreateIndex
CREATE INDEX "camas_estado_idx" ON "recursos"."camas"("estado");

-- CreateIndex
CREATE INDEX "internaciones_paciente_id_idx" ON "recursos"."internaciones"("paciente_id");

-- CreateIndex
CREATE INDEX "internaciones_cama_id_idx" ON "recursos"."internaciones"("cama_id");

-- CreateIndex
CREATE UNIQUE INDEX "insumos_codigo_key" ON "recursos"."insumos"("codigo");

-- CreateIndex
CREATE INDEX "insumos_medicamento_asociado_idx" ON "recursos"."insumos"("medicamento_asociado");

-- CreateIndex
CREATE UNIQUE INDEX "obras_sociales_codigo_key" ON "facturacion"."obras_sociales"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "tarifas_concepto_key" ON "facturacion"."tarifas"("concepto");

-- CreateIndex
CREATE INDEX "cuentas_paciente_id_idx" ON "facturacion"."cuentas"("paciente_id");

-- CreateIndex
CREATE UNIQUE INDEX "cuentas_tipo_referencia_id_key" ON "facturacion"."cuentas"("tipo", "referencia_id");

-- CreateIndex
CREATE UNIQUE INDEX "cargos_origen_evento_id_key" ON "facturacion"."cargos"("origen_evento_id");

-- CreateIndex
CREATE INDEX "cargos_cuenta_id_idx" ON "facturacion"."cargos"("cuenta_id");

-- CreateIndex
CREATE INDEX "cargos_concepto_created_at_idx" ON "facturacion"."cargos"("concepto", "created_at");

-- AddForeignKey
ALTER TABLE "iam"."usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "iam"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."roles_permisos" ADD CONSTRAINT "roles_permisos_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "iam"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."roles_permisos" ADD CONSTRAINT "roles_permisos_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "iam"."permisos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admision"."agendas" ADD CONSTRAINT "agendas_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "admision"."medicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admision"."turnos" ADD CONSTRAINT "turnos_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "admision"."pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admision"."turnos" ADD CONSTRAINT "turnos_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "admision"."medicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admision"."triajes" ADD CONSTRAINT "triajes_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "admision"."pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hce"."evoluciones" ADD CONSTRAINT "evoluciones_historia_id_fkey" FOREIGN KEY ("historia_id") REFERENCES "hce"."historias_clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hce"."alergias" ADD CONSTRAINT "alergias_historia_id_fkey" FOREIGN KEY ("historia_id") REFERENCES "hce"."historias_clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hce"."antecedentes_familiares" ADD CONSTRAINT "antecedentes_familiares_historia_id_fkey" FOREIGN KEY ("historia_id") REFERENCES "hce"."historias_clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hce"."prescripciones" ADD CONSTRAINT "prescripciones_historia_id_fkey" FOREIGN KEY ("historia_id") REFERENCES "hce"."historias_clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hce"."prescripciones" ADD CONSTRAINT "prescripciones_evolucion_id_fkey" FOREIGN KEY ("evolucion_id") REFERENCES "hce"."evoluciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hce"."estudios" ADD CONSTRAINT "estudios_historia_id_fkey" FOREIGN KEY ("historia_id") REFERENCES "hce"."historias_clinicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enfermeria"."administraciones_medicacion" ADD CONSTRAINT "administraciones_medicacion_indicacion_id_fkey" FOREIGN KEY ("indicacion_id") REFERENCES "enfermeria"."indicaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recursos"."camas" ADD CONSTRAINT "camas_habitacion_id_fkey" FOREIGN KEY ("habitacion_id") REFERENCES "recursos"."habitaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recursos"."internaciones" ADD CONSTRAINT "internaciones_cama_id_fkey" FOREIGN KEY ("cama_id") REFERENCES "recursos"."camas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturacion"."cargos" ADD CONSTRAINT "cargos_cuenta_id_fkey" FOREIGN KEY ("cuenta_id") REFERENCES "facturacion"."cuentas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- ============================================================================
-- Restricciones que Prisma no declara (MODELO-DE-DATOS.md §5). Mantener a mano.
-- ============================================================================

-- Un médico no tiene dos turnos reservados a la misma hora
CREATE UNIQUE INDEX "turnos_medico_inicio_reservado_uq"
  ON "admision"."turnos" ("medico_id", "inicio") WHERE "estado" = 'RESERVADO';

-- Un paciente tiene una sola internación activa; una cama tiene una sola internación activa
CREATE UNIQUE INDEX "internaciones_paciente_activa_uq"
  ON "recursos"."internaciones" ("paciente_id") WHERE "estado" = 'ACTIVA';
CREATE UNIQUE INDEX "internaciones_cama_activa_uq"
  ON "recursos"."internaciones" ("cama_id") WHERE "estado" = 'ACTIVA';

-- Rangos básicos
ALTER TABLE "admision"."agendas" ADD CONSTRAINT "agendas_horas" CHECK ("hora_fin" > "hora_inicio");
ALTER TABLE "admision"."turnos" ADD CONSTRAINT "turnos_rango" CHECK ("fin" > "inicio");
ALTER TABLE "recursos"."insumos" ADD CONSTRAINT "insumos_stock_no_negativo" CHECK ("stock_actual" >= 0);
ALTER TABLE "facturacion"."cargos" ADD CONSTRAINT "cargos_cantidad_positiva" CHECK ("cantidad" > 0);
ALTER TABLE "enfermeria"."signos_vitales"
  ADD CONSTRAINT "sv_temperatura" CHECK ("temperatura" IS NULL OR "temperatura" BETWEEN 30 AND 45),
  ADD CONSTRAINT "sv_spo2" CHECK ("saturacion_o2" IS NULL OR "saturacion_o2" BETWEEN 50 AND 100);
