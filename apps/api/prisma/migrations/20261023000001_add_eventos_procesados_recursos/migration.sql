-- Migración: add_eventos_procesados_recursos
-- Tabla para garantizar idempotencia en el consumo de eventos del módulo Recursos.
-- Cada eventoId procesado se guarda aquí para no descontar stock dos veces.

CREATE TABLE IF NOT EXISTS "recursos"."eventos_procesados" (
    "id"              UUID        NOT NULL,
    "origen_evento_id" UUID        NOT NULL,
    "procesado_en"    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "eventos_procesados_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "eventos_procesados_origen_evento_id_key"
    ON "recursos"."eventos_procesados"("origen_evento_id");
