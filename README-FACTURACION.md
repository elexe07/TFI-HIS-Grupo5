# 🏥 Módulo de Facturación y Administración Hospitalaria (HIS)

### Documentación Técnica y de Funcionamiento — Backend (NestJS) y Frontend (Vue 3)

**Cátedra:** Programación IV (TSP - UTN) · **Responsable:** Ezequiel · **Fase:** 7 (Cierre / Integrador de Eventos)

---

## 📌 1. Visión General y Propósito del Módulo

El módulo de **Facturación y Administración** es el núcleo económico y de back-office del Hospital Information System (HIS). Su función principal es **centralizar los consumos y prestaciones sanitarias generadas en el hospital, imputar cargos automáticos, validar coberturas con financiadores de salud (Obras Sociales / Prepagas) y generar reportes financieros y de ocupación en tiempo real**.

A diferencia de los módulos asistenciales (como Admisión o Enfermería), Facturación tiene una naturaleza predominantemente **reactiva (Event-Driven)**:

- **No depende de que un administrativo cree manualmente los cargos:** cuando un médico atiende una consulta en Guardia/HCE, cuando un enfermero suministra medicación o cuando se le da el alta a una internación, el módulo escucha esos sucesos en segundo plano y genera las cuentas y cargos correspondientes.
- **Provee una interfaz administrativa en el Frontend (Vue 3):** permite a los auditores y administradores consultar el estado de las cuentas de pacientes, cerrar cuentas pendientes, validar carnets de cobertura médica y analizar reportes contables y de ocupación hospitalaria.

---

## 📋 2. Matriz de Casos de Uso (ROADMAP §6)

| ID         | Caso de Uso                           | Tipo / Disparador                                                         | Regla de Negocio Principal                                                                                                                                  |
| :--------- | :------------------------------------ | :------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **FAC-01** | **Cargo por Consulta Médica**         | Evento: `hce.evolucion-registrada`                                        | Idempotente (`origen_evento_id` único). Busca o crea la cuenta de tipo `CONSULTA` del paciente y aplica la tarifa vigente de consulta.                      |
| **FAC-02** | **Cargo por Medicación / Insumos**    | Evento: `enfermeria.medicacion-administrada`                              | Idempotente. Imputa el costo unitario de la medicación administrada sobre la cuenta activa de tipo `INTERNACION`.                                           |
| **FAC-03** | **Ciclo de Cuenta de Internación**    | Eventos: `recursos.paciente-internado` y `recursos.paciente-dado-de-alta` | Abre la cuenta al ingresar. Al dar el alta, calcula: `días = egreso − ingreso` (mínimo 1 día), imputa el cargo `DIA_CAMA × días` y cierra la cuenta.        |
| **FAC-04** | **Validación de Cobertura Médica**    | HTTP POST `/api/cobertura/validar`                                        | Valida credenciales contra la obra social (vía adapter simulado/fake). Retorna porcentaje de cobertura y permite imputar el descuento a una cuenta abierta. |
| **FAC-05** | **Consulta de Cuentas y Detalle**     | HTTP GET `/api/cuentas` y `/api/cuentas/:id`                              | Calcula en tiempo real: `Total Bruto = Σ(cargos)`, `Descuento = Bruto × % Cobertura` y `Total a Pagar = Bruto − Descuento`.                                 |
| **FAC-06** | **Reporte Financiero por Período**    | HTTP GET `/api/reportes/facturacion?desde=&hasta=`                        | Agrupa los cargos emitidos por concepto (`CONSULTA`, `MEDICACION`, `DIA_CAMA`) y por obra social en un intervalo temporal.                                  |
| **FAC-07** | **Reporte de Ocupación Hospitalaria** | HTTP GET `/api/reportes/ocupacion`                                        | Consulta el contrato público del módulo de Recursos para informar el total de camas ocupadas, libres, en limpieza y porcentaje de ocupación.                |

---

## ⚙️ 3. Funcionamiento del Backend (NestJS 11 + Prisma ORM + TypeScript)

Siguiendo el **Diagrama de Flujo de NestJS** y los principios de la cátedra de Programación IV:

```
[ Cliente Web / Postman ]               [ EventBus (@nestjs/event-emitter) ]
           │                                             │
           ▼                                             ▼
┌───────────────────────┐                     ┌───────────────────────────────┐
│   HTTP Controllers    │                     │   @OnEvent Event Handlers     │
│ (api/*.controller.ts) │                     │ (application/event-handlers/) │
│  - Rutas y DTOs       │                     │  - hce.evolucion-registrada   │
│  - PermisosGuard      │                     │  - enfermeria.medicacion      │
└──────────┬────────────┘                     └──────────────┬────────────────┘
           │                                                 │
           ▼                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Capa de Aplicación (Use Cases)                        │
│                (application/*/*.handler.ts - CasoDeUso<Cmd, Res>)           │
│  - Orquesta reglas de negocio y transacciones                               │
│  - Garantiza idempotencia verificando `origenEventoId`                      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Capa de Dominio (Domain)                           │
│  - Agregado: Cuenta (Estado: ABIERTA, CERRADA)                              │
│  - Entidades: Cargo (montoTotal = cantidad * montoUnitario), Tarifa, OS     │
│  - Puertos (Interfaces): CuentaRepository, TarifaRepository, ObraSocialRepo │
│  - Puerto Externo: ValidadorDeCobertura                                     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Capa de Infraestructura (Adapters)                     │
│  - Prisma Repositories (PrismaClient) -> PostgreSQL (schema "facturacion")   │
│  - ValidadorDeCoberturaFake (Simulación de obras sociales con reglas de test)│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.1. Estructura de Directorios del Backend

```
apps/api/src/modules/facturacion/
├── domain/                     # Núcleo puro de negocio (sin dependencias de NestJS ni Prisma)
│   ├── cuenta.ts               # Agregado raíz Cuenta: abrir, cerrar, agregarCargo, aplicarCobertura
│   ├── cargo.ts                # Entidad Cargo: concepto, cantidad, montos, origenEventoId
│   ├── tarifa.ts               # Tarifa vigente por concepto
│   ├── obra-social.ts          # Obra social y porcentaje de descuento
│   ├── enums.ts                # ConceptoCargo, TipoCuenta, EstadoCuenta
│   ├── errores.ts              # CuentaYaCerrada, CargoDuplicado, TarifaNoEncontrada
│   └── ports/                  # Interfaces de repositorios y servicios externos
│       ├── cuenta.repository.ts
│       ├── tarifa.repository.ts
│       ├── obra-social.repository.ts
│       ├── reporte-facturacion.repository.ts
│       ├── consultor-de-ocupacion.ts
│       └── validador-de-cobertura.ts
├── application/                # Casos de uso del sistema
│   ├── consultar-cuenta/       # Query: detalle de una cuenta con totales calculados
│   ├── cerrar-cuenta/          # Command: cierre manual de cuenta abierta
│   ├── listar-cuentas-paciente/# Query: cuentas asociadas a un paciente
│   ├── validar-cobertura/      # Command: chequeo con obra social + aplicación a cuenta
│   ├── reportes/               # Handlers de Reporte de Facturación y Ocupación
│   └── event-handlers/         # Consumidores asíncronos de eventos del Monolito
│       ├── aplicar-cargo-consulta.handler.ts    (@OnEvent('hce.evolucion-registrada'))
│       ├── aplicar-cargo-medicacion.handler.ts  (@OnEvent('enfermeria.medicacion-administrada'))
│       ├── abrir-cuenta-internacion.handler.ts  (@OnEvent('recursos.paciente-internado'))
│       └── cerrar-cuenta-internacion.handler.ts (@OnEvent('recursos.paciente-dado-de-alta'))
├── infrastructure/             # Adaptadores que implementan los puertos
│   ├── repositories/           # Implementaciones con Prisma ORM (schema: facturacion)
│   │   ├── cuenta.repository.prisma.ts
│   │   ├── tarifa.repository.prisma.ts
│   │   ├── obra-social.repository.prisma.ts
│   │   └── reporte-facturacion.repository.prisma.ts
│   └── adapters/
│       ├── validador-de-cobertura.fake.ts       # Simulación de API externa de OS
│       └── consultor-de-ocupacion.fake.ts       # Consulta de camas en Recursos
├── api/                        # Adaptadores de entrada HTTP
│   ├── cuentas.controller.ts   # GET /api/cuentas, GET /api/cuentas/:id, PATCH /api/cuentas/:id/cerrar
│   ├── cobertura.controller.ts # POST /api/cobertura/validar
│   ├── reportes.controller.ts  # GET /api/reportes/facturacion, GET /api/reportes/ocupacion
│   ├── obras-sociales.controller.ts # Catálogo de Obras Sociales y Tarifas
│   └── dto/                    # Validadores de entrada con class-validator
├── public/                     # Contrato público del módulo expuesto a otros módulos
└── facturacion.module.ts       # Configuración de inyección de dependencias de NestJS
```

### 3.2. Idempotencia y Concurrencia (Concepto Clave de Programación IV)

En sistemas de reservas y facturación concurrentes, procesar el mismo evento dos veces o permitir carreras de datos causaría cobros dobles ilegítimos. Facturación implementa dos barreras de seguridad:

1. **Barrera de Aplicación:** Cada evento de dominio tiene un `eventoId` único. Antes de agregar un cargo, el handler invoca `cuenta.tieneCargoConOrigenEvento(eventoId)` o `cuentaRepo.existeCargoConOrigenEvento(eventoId)`. Si ya fue procesado, se descarta silenciosamente con log de depuración.
2. **Barrera de Base de Datos:** La columna `cargos.origen_evento_id` tiene una restricción `UNIQUE` en PostgreSQL, y la tabla `cuentas` posee `UNIQUE(tipo, referencia_id)`. Cualquier colisión concurrente a nivel base de datos es rechazada por el motor SQL.

---

## 💻 4. Funcionamiento del Frontend (Vue 3 + Pinia + Vue Router 4)

El frontend de Facturación reside en `apps/web/src/modules/facturacion` y está construido íntegramente con **Vue 3 Composition API** (`<script setup>`), **Pinia** para la reactividad global y **Vue Router** con control de acceso basado en roles (RBAC).

### 4.1. Arquitectura del Módulo Web

```
apps/web/src/modules/facturacion/
├── facturacion.routes.ts       # Rutas: /facturacion, /cuenta/:id, /cobertura, /reportes
├── facturacion.types.ts        # Modelos TypeScript sincronizados con los DTOs de NestJS
├── facturacion.api.ts          # Métodos HTTP contra la API mediante Axios centralizado
├── facturacion.store.ts        # Store de Pinia: State, Getters computados y Acciones
└── views/                      # Vistas de usuario (UI)
    ├── FacturacionLayout.vue   # Shell del módulo con barra de navegación por solapas
    ├── CuentasView.vue         # Lista general de cuentas con filtros y búsqueda
    ├── CuentaDetalleView.vue   # Detalle de una cuenta, desglose de cargos y cierre
    ├── CoberturaView.vue       # Formulario interactivo para validar credenciales de OS
    └── ReportesView.vue        # Dashboard de facturación y ocupación hospitalaria
```

### 4.2. Flujo de Datos y Reactividad en Vue 3

Siguiendo las pautas de **Vue Mastery / Apunte de Vue.js**:

1. **Vista (`views/*.vue`):** Presentación pura. Se vincula al estado mediante `v-model`, `v-for`, `v-if`. Al interactuar (ej. hacer clic en "Validar Cobertura" o "Cerrar Cuenta"), dispara métodos que invocan acciones del store.
2. **Store de Pinia (`facturacion.store.ts`):**
   - **State (`ref`):** Mantiene `cuentas`, `cuentaSeleccionada`, `obrasSociales`, `tarifas`, `reportes`, estados de `cargando: boolean` y `error: string | null`.
   - **Getters (`computed`):** Provee datos derivados reactivos: `cuentasAbiertas`, `cuentasCerradas`, `totalFacturado` y `tarifasPorConcepto`.
   - **Actions:** Métodos asíncronos (`async/await`) que gestionan la llamada a la API, alternan `cargando.value = true`, actualizan el estado reactivo con los datos devueltos y capturan errores para informar al usuario.
3. **Capa HTTP (`facturacion.api.ts`):** Encapsula llamadas a `shared/http/client.ts`. Este cliente Axios inyecta automáticamente el token JWT en la cabecera `Authorization: Bearer <token>` y transforma los errores 400/401/403/404 en excepciones legibles.

### 4.3. Vistas y Experiencia de Usuario (UI)

#### A. Gestión de Cuentas (`CuentasView.vue` y `CuentaDetalleView.vue`)

- **Filtros rápidos:** Filtra cuentas por estado (`TODAS`, `ABIERTA`, `CERRADA`) y tipo (`CONSULTA`, `INTERNACION`).
- **Búsqueda por Paciente:** Permite ingresar un UUID de paciente para auditar su historial completo de consumos.
- **Detalle de Cuenta:**
  - Muestra datos del paciente, tipo de atención y estado de la cuenta.
  - Tabla de cargos detallando concepto (`CONSULTA`, `MEDICACION`, `DIA_CAMA`), descripción, cantidad, precio unitario y subtotal.
  - Bloque de liquidación: muestra **Total Bruto**, porcentaje de descuento por Obra Social, **Descuento Aplicado** y **Saldo Neto a Pagar**.
  - Acción: Botón **"Cerrar Cuenta"** para asentar el fin de los consumos administrativos.

#### B. Validador de Cobertura (`CoberturaView.vue`)

- Formulario con selector de Obra Social (`OSDE`, `SWISS_MEDICAL`, `PAMI`, `PARTICULAR`), campo para el ID del Paciente y Número de Carnet/Afiliado.
- Opción de ingresar el ID de una cuenta abierta para impactar la cobertura automáticamente si resulta aprobada.
- **Feedback visual instantáneo:** Badges verdes/rojos indicando si la afiliación está habilitada, el porcentaje cubierto o el motivo de rechazo devuelto por la entidad.

#### C. Reportes Gerenciales (`ReportesView.vue`)

- **Reporte de Facturación:** Selector de fechas `desde` y `hasta`. Muestra tarjetas métricas (`Total Facturado`, `Total Consultas`, `Total Medicación`, `Total Días Cama`) y un desglose tabular por concepto y financiador.
- **Reporte de Ocupación:** Gráfica o métricas en tiempo real con total de camas del hospital, camas ocupadas, libres, en limpieza y el porcentaje de ocupación global.

---

## 🔄 5. Recorrido Integral de los Flujos (End-to-End Traces)

### 🏥 Escenario 1: Atención en Guardia y Cargo Automático de Consulta (Event-Driven)

1. **Médico en HCE:** En `HistoriaClinicaView.vue`, el médico atiende al paciente que ingresó por guardia y guarda una evolución clínica.
2. **Publicación del Evento:** El módulo HCE persiste la evolución y emite el evento:
   ```json
   {
     "eventoId": "d3b07384-...",
     "pacienteId": "pac-123",
     "medicoId": "med-456",
     "fecha": "2026-11-19T10:00:00Z"
   }
   ```
3. **Recepción en Facturación:** `AplicarCargoConsultaHandler` escucha el evento (`@OnEvent('hce.evolucion-registrada')`).
4. **Ejecución del Handler:**
   - Verifica idempotencia: consulta si existe un cargo con `origenEventoId = "d3b07384-..."`.
   - Si no existe cuenta abierta para esa consulta, crea una nueva `Cuenta` de tipo `CONSULTA`.
   - Consulta el `TarifaRepository` para obtener el valor oficial de la consulta (ej. $15.000).
   - Instancia el `Cargo` y lo añade a la cuenta (`cuenta.agregarCargo(...)`).
   - Persiste los cambios en PostgreSQL mediante `CuentaRepositoryPrisma`.
5. **Impacto en Frontend:** Cuando el personal administrativo abre `CuentasView.vue` en el Front, la cuenta de la consulta ya aparece listada y con su saldo calculado.

---

### 💳 Escenario 2: Validación y Aplicación de Cobertura (Interactivo)

1. El usuario navega a `/facturacion/cobertura` en el Frontend.
2. Completa los datos: Paciente `pac-123`, Obra Social `OSDE`, Afiliado `123456789`, Cuenta `cta-789` y presiona **"Validar"**.
3. **Front:** `facturacionStore.validarCobertura(data)` llama a `POST /api/cobertura/validar`.
4. **Back:** `CoberturaController` valida el DTO (`ValidarCoberturaDto` con `class-validator`) y delega en `ValidarCoberturaHandler`.
5. **Dominio & Adaptador:** `ValidadorDeCoberturaFake` verifica el código `OSDE` y número de carnet:
   - Determina cobertura aprobada con un **80% de descuento**.
   - Como se especificó `cuentaId`, recupera la cuenta, ejecuta `cuenta.aplicarCobertura(80)` y la guarda.
6. **Respuesta & UI:** El backend devuelve `{ aprobada: true, porcentajeCobertura: 80, cuentaActualizada: true }`. El frontend muestra una alerta de éxito y actualiza el saldo de la cuenta de forma reactiva.

---

## 🔒 6. Seguridad y Permisos (RBAC)

El acceso a las funcionalidades y endpoints está protegido en ambos extremos:

| Permiso             | Propósito                                               | Roles con Acceso                           |
| :------------------ | :------------------------------------------------------ | :----------------------------------------- |
| `facturacion:leer`  | Consultar listado de cuentas y detalles de facturación  | `ADMINISTRADOR`, `RECEPCIONISTA`           |
| `cobertura:validar` | Ejecutar validaciones de credenciales de obras sociales | `ADMINISTRADOR`, `RECEPCIONISTA`, `MEDICO` |
| `reportes:leer`     | Ver reportes financieros globales y ocupación de camas  | `ADMINISTRADOR`                            |

- **En Backend:** Los controladores están decorados con `@RequierePermiso(PERMISOS.FACTURACION_LEER)` y validados por el `PermisosGuard` con tokens JWT firmados.
- **En Frontend:** `facturacion.routes.ts` define `meta: { permisos: ['facturacion:leer'] }`. El router guard global (`router.beforeEach`) intercepta la navegación y redirige al Dashboard o Login si el usuario no cuenta con el permiso requerido.

---

## 🧪 7. Guía de Comandos para Pruebas y Verificación

Desde la raíz del monorepo (`codigo/TFI-HIS-Grupo5`), ejecutar:

```powershell
# 1. Comprobar reglas de arquitectura hexagonal (depcruise: sin fugas de Prisma al dominio)
pnpm arch

# 2. Comprobar reglas de estilo y tipado
pnpm lint
pnpm typecheck

# 3. Ejecutar todas las pruebas unitarias del módulo de facturación
pnpm --filter @his/api test src/modules/facturacion

# 4. Ejecutar pruebas de integración e2e contra la base de datos PostgreSQL
pnpm --filter @his/api test:integration test/e2e/facturacion.e2e-spec.ts
```
