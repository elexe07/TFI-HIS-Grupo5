# C4 — Nivel 2: Contenedores

Las piezas desplegables del sistema y la tecnología de cada una.

```mermaid
flowchart TB
    subgraph Usuarios
        U[Recepcionista · Médico · Enfermero · Administrador · Paciente]
    end

    subgraph HIS
        WEB["Web SPA<br/>React 18 + Vite + TypeScript<br/>apps/web"]
        API["API<br/>NestJS 11 + TypeScript<br/>apps/api<br/>módulos: IAM · Admisión · HCE · Enfermería · Recursos · Facturación"]
        DB[("PostgreSQL 16<br/>un schema por módulo:<br/>iam · admision · hce · enfermeria · recursos · facturacion")]
    end

    OS[Obra social<br/>adaptador fake]

    U -->|HTTPS| WEB
    WEB -->|"JSON / REST (/api)"| API
    API -->|Prisma| DB
    API -.->|puerto ValidadorDeCobertura| OS
```

## Dentro de la API

Los seis módulos corren en el mismo proceso y se comunican solo por eventos en memoria (ADR-004) o por los contratos de su carpeta `public/`.

```mermaid
flowchart LR
    IAM[IAM]
    ADM[Admisión y Turnos]
    HCE[HCE]
    ENF[Enfermería]
    REC[Recursos y Camas]
    FAC[Facturación]
    BB[building-blocks<br/>Entity · AggregateRoot · EventBus · Clock · Prisma]

    ADM -- paciente-registrado --> HCE
    HCE -- prescripcion-creada --> ENF
    HCE -- evolucion-registrada --> FAC
    ENF -- medicacion-administrada --> REC
    ENF -- medicacion-administrada --> FAC
    REC -- paciente-internado / dado-de-alta --> FAC
    IAM -. guard de permisos .-> ADM & HCE & ENF & REC & FAC
    BB -.-> IAM & ADM & HCE & ENF & REC & FAC
```

## Nivel 3 (componentes)

La anatomía interna de cada módulo es siempre la misma y está documentada en `apps/api/src/modules/ejemplo/README.md`: `domain → application → infrastructure + api`, con `public/` como superficie hacia otros módulos. No se dibuja un diagrama por módulo (fuera de alcance, ROADMAP §10).
