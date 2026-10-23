# Módulo `ejemplo` — plantilla de referencia

Este módulo no es parte del HIS. Existe para mostrar **cómo se escribe un módulo** con la
arquitectura del proyecto, de punta a punta y con tests. Copiá la estructura para tu módulo y
borrá este cuando los seis reales estén andando.

```
ejemplo/
├── domain/                         ← sin NestJS, sin Prisma
│   ├── nombre.ts                   objeto de valor con validación (y su .spec.ts)
│   ├── saludo.ts                   agregado: método estático `crear`, registra eventos (y su .spec.ts)
│   ├── saludo.repository.ts        PUERTO: interfaz + token Symbol
│   └── events/saludo-creado.ts     evento de dominio
├── application/                    ← casos de uso, hablan con puertos
│   ├── crear-saludo/               command + handler + handler.spec.ts (con repo en memoria)
│   ├── listar-saludos/             query + handler
│   └── event-handlers/             reacciona a eventos (propios o de otros módulos) con @OnEvent
├── infrastructure/                 ← adaptadores: acá va Prisma
│   └── saludo.repository.en-memoria.ts  (en un módulo real: saludo.repository.prisma.ts)
├── api/                            ← controllers + DTOs con class-validator
│   ├── dto/crear-saludo.dto.ts
│   └── saludos.controller.ts
├── public/                         ← lo ÚNICO que otros módulos pueden importar
│   └── index.ts                    nombres de eventos y clases de eventos
└── ejemplo.module.ts               enchufa todo: `{ provide: TOKEN, useClass: Impl }`
```

## Seguridad

Este módulo es `@Publico()` para que se pueda probar sin login. Un módulo real protege sus endpoints con
`@RequierePermiso(PERMISOS.X)` y lee el usuario con `@UsuarioActual()`, todo importado desde `modules/iam/public`
(ver README de `iam/`). El guard es global: lo que no tenga `@Publico()` exige token.

## Flujo de una request

```
POST /api/ejemplo/saludos { destinatario: "Ana" }
  → SaludosController.crear(dto)                       (api)
    → CrearSaludoHandler.ejecutar(command)             (application)
      → Nombre.crear('Ana')                            (domain: valida)
      → Saludo.crear(nombre, reloj.ahora())            (domain: registra SaludoCreado)
      → repo.guardar(saludo)                           (puerto → adaptador en memoria)
      → bus.publicar(saludo.extraerEventos())          (EventBus → @OnEvent en otros módulos)
    ← { id, mensaje }
```

## Orden de trabajo recomendado (TDD)

1. `domain/*.spec.ts` en rojo → implementar entidad/VO → verde → refactor.
2. `application/<caso>/<caso>.handler.spec.ts` con repo en memoria → handler.
3. Repositorio Prisma en `infrastructure/` + test de integración en `test/integration/`.
4. Controller + DTO. Probar en Swagger.
5. Si publica eventos, agregarlos a `public/` y a `docs/eventos.md`.

## Qué verifica `pnpm arch`

- `domain/` no importa `@nestjs/*`, `@prisma/*` ni otras capas del módulo.
- `application/` no importa `infrastructure/` ni `api/`.
- Nadie fuera del módulo importa algo que no esté en `public/`.
