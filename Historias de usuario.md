## Módulo de admisión:

### Épica 1: Gestión de Agenda y Control de Concurrencia

Esta épica cubre la reserva y cancelación de turnos, así como la gestión de la agenda médica. El objetivo pedagógico principal aquí es enseñar a los alumnos a evitar que dos pacientes reserven el mismo turno simultáneamente mediante bloqueos de base de datos o transacciones.

####

#### HU 1.1 \- Reserva de Turno Seguro

**Como** recepcionista, **quiero** reservar un turno disponible para un paciente **de modo que** quede bloqueado y no pueda ser tomado por nadie más.

- **Dado** que el paciente "Carlos López" está registrado formalmente en el sistema.

**Escenario 1: Reserva exitosa de un turno disponible**

- **Y** el turno de las 10:00 AM con el Dr. Silva está disponible.
- **Cuando** el recepcionista selecciona el turno y confirma la reserva.
- **Entonces** el sistema debe asignar el turno a "Carlos López".
- **Y** el estado del turno debe cambiar inmediatamente a "Programado".

**Escenario 2: Manejo estricto de concurrencia al reservar**

- **Dado** que el turno de las 10:00 AM con el Dr. Silva está disponible.
- **Cuando** dos recepcionistas intentan confirmar la reserva de ese mismo turno en el mismo milisegundo para diferentes pacientes.
- **Entonces** el sistema debe procesar exitosamente solo la primera petición que ingrese a la base de datos.
- **Y** debe rechazar la segunda petición devolviendo un mensaje de error claro indicando que el turno acaba de ser ocupado.

#### HU 1.2 \- Inserción de Entreturno Dinámico

**Como** coordinador de agendas, quiero insertar un entreturno reduciendo el tiempo de atención de los turnos adyacentes para acomodar a un paciente de urgencia menor sin generar conflictos de superposición de IDs en la base de datos.

**Escenario 1: Recálculo automático de duración**

- **Dado** que el Dr. Silva tiene turnos de 30 minutos programados a las 10:00 AM y a las 10:30 AM.
- **Cuando** el usuario con privilegios inserta un "Entreturno" a las 10:15 AM.
- **Entonces** el sistema debe ajustar dinámicamente la duración del turno de las 10:00 AM a 15 minutos.
- **Y** debe asignar el entreturno en un nuevo bloque desde las 10:15 AM hasta las 10:30 AM.
- **Y** debe etiquetar visualmente los turnos afectados para advertir al médico que dispone de menos tiempo por paciente.

#### HU 1.3 \- Manejo de Lista de Espera por Cancelación

**Como** recepcionista, quiero agregar un paciente a la lista de entreturnos (standby) para que el sistema le asigne automáticamente un horario si otro paciente cancela su cita de ese mismo día.

**Escenario 1: Promoción automática desde la lista de espera**

- **Dado** que la agenda del Dr. Silva para el día de hoy está completamente llena.
- **Y** el paciente "Luis Medina" se encuentra en la primera posición de la cola estructurada de entreturnos (standby).
- **Cuando** un paciente programado a las 11:00 AM anula su cita.
- **Entonces** el sistema debe liberar el bloqueo de ese horario en la base de datos temporalmente.
- **Y** debe desencolar a "Luis Medina" y asignarle automáticamente el turno de las 11:00 AM.
- **Y** debe alertar al recepcionista para que llame por altavoz o notifique al paciente sobre su nuevo horario confirmado.

###

### Épica 2: Máquina de Estados del Turno

El enfoque de esta sección es estructurar los estados por los que transita una cita médica. Es el escenario ideal para exigir a los estudiantes la implementación del Patrón State.  
A continuación, un resumen de los estados requeridos para este patrón:

| Estado del Turno  | Momento de Aplicación                                    |
| :---------------- | :------------------------------------------------------- |
| Programado        | Al finalizar la reserva inicial.                         |
| Confirmado        | Cuando el paciente revalida su intención de asistir.     |
| En Sala de Espera | Al registrarse físicamente en la recepción del hospital. |
| Atendido          | Al concluir la consulta con el profesional de la salud.  |
| Cancelado         | Si el paciente o la clínica anulan la cita.              |

####

#### HU 2.1 \- Transición del Estado de Atención

**Como** personal de admisión, **quiero** actualizar el estado del turno de un paciente cuando llega a la clínica **para** mantener informados a los profesionales médicos.

**Escenario 1: Transición lógica permitida**

- **Dado** que el paciente "Juan Gómez" tiene un turno en estado "Confirmado".
- **Cuando** el paciente se anuncia físicamente en el mostrador de recepción.
- **Entonces** el recepcionista debe poder cambiar el estado del turno a "En Sala de Espera".
- **Y** el sistema de notificaciones debe alertar al módulo del consultorio médico correspondiente.

**Escenario 2: Prevención de transiciones de estado inválidas**

- **Dado** que un turno específico se encuentra en estado "Cancelado".
- **Cuando** el recepcionista intenta modificarlo para pasarlo directamente al estado "Atendido".
- **Entonces** el sistema debe bloquear la acción.
- **Y** debe devolver un error de validación de negocio indicando que un turno cancelado no puede avanzar en el flujo de atención.

###

### Épica 3: Triaje de Guardia y Sistemas de Colas

Esta área aborda la puerta de entrada de urgencias. Los alumnos deberán lidiar con el Triaje de guardia (clasificación de urgencias) y la manipulación de sistemas de colas.

####

#### HU 3.1 \- Ingreso y Clasificación de Paciente

**Como** enfermero de guardia, **quiero** registrar y clasificar el nivel de urgencia de un paciente recién llegado **para** garantizar que reciba atención con la prioridad adecuada en la cola.

**Escenario 1: Priorización automática basada en nivel de triaje**

- **Dado** que un paciente sin cita previa ingresa por el sector de urgencias.
- **Cuando** el enfermero realiza la evaluación de triaje y le asigna una clasificación de "Riesgo Vital" (Código Rojo).
- **Entonces** el sistema debe insertar al paciente en la primera posición de la cola de espera, desplazando a los pacientes de menor riesgo.
- **Y** debe emitir una alerta destacada en los monitores de los médicos de guardia disponibles.

## Módulo de Atención y Enfermería

### **Épica 1: Gestión del Cuidado Diario y Monitoreo Continuo**

Esta épica cubre las tareas repetitivas pero críticas que el personal de enfermería realiza durante su turno, enfocándose en la trazabilidad y la seguridad del paciente.

#### HU 1.1 \- Control y Registro de Signos Vitales

**Como** enfermero de turno, **quiero** registrar los signos vitales de un paciente internado **para** mantener un monitoreo continuo y alertar a los médicos sobre cualquier anomalía.

- **Escenario 1: Registro exitoso de signos vitales estables**
  - **Dado** que el enfermero "Martín Torres" ha iniciado sesión en el sistema.
  - **Y** el paciente "Carlos López" se encuentra ingresado en la "Habitación 204".
  - **Cuando** el enfermero ingresa los valores de presión arterial, frecuencia cardíaca y temperatura dentro de los rangos normales.
  - **Entonces** el sistema debe guardar el registro asociándolo a la historia clínica del paciente con la estampa de tiempo actual.
  - **Y** debe añadir una nota de enfermería automática indicando que los controles fueron realizados con éxito.
- **Escenario 2: Generación de alerta por parámetros fuera de rango**
  - **Dado** que el enfermero ingresa los signos vitales del paciente "Carlos López".
  - **Cuando** el valor de la temperatura supera los 39°C.
  - **Entonces** el sistema debe guardar el registro destacándolo visualmente en color rojo.
  - **Y** debe emitir una notificación de alta prioridad al médico de guardia a cargo de ese sector de internación.

#### HU 1.2 \- Administración de Medicación Prescrita

**Como** enfermero, quiero visualizar y confirmar la administración de la medicación prescrita por el médico tratante **para** asegurar que el paciente reciba su tratamiento en horario.

- **Escenario 1: Confirmación de administración en tiempo y forma**
  - **Dado** que existe una indicación médica activa de "Ibuprofeno 400mg cada 8 horas" para la paciente "Ana Rojas".
  - **Cuando** el enfermero marca la dosis de las 14:00 hrs como "Administrada" dentro del margen de tiempo permitido (+/- 30 minutos).
  - **Entonces** el sistema debe registrar la acción vinculando al usuario del enfermero que la aplicó.
  - **Y** debe descontar automáticamente el insumo del inventario del piso.

### **Épica 2: Estandarización de Ingresos (Patrón Builder)**

_Nota:_  
_Esta épica introduce un desafío arquitectónico. Dependiendo de por qué ingresa un paciente (ej. cirugía programada, traumatismo de urgencia, observación pediátrica), las tareas iniciales cambian drásticamente. El Patrón Builder ayuda a ensamblar este "plan de cuidados" paso a paso._

#### HU 2.1 \- Generación de Protocolos de Atención Complejos

Como sistema, quiero generar automáticamente un protocolo de atención base al momento de admitir a un paciente en una habitación, para que enfermería tenga las indicaciones inmediatas sin depender de una orden manual inicial.

- **Escenario 1: Construcción de protocolo para "Ingreso Pre-Quirúrgico"**
  - **Dado** que el módulo de Admisión confirma el traslado de un paciente a la sala de observación por una cirugía programada.
  - **Cuando** el Módulo de Atención y Enfermería recibe el evento de ingreso.
  - **Entonces** el sistema debe utilizar el _Pre-Op Protocol Builder_ para generar las tareas de enfermería.
  - **Y** el protocolo generado debe incluir automáticamente las tareas: "Verificar ayuno de 8 horas", "Colocar vía intravenosa periférica" y "Realizar control de signos vitales cada 2 horas".
- **Escenario 2: Construcción de protocolo para "Ingreso por Infección Respiratoria"**
  - **Dado** que se admite a un paciente con un diagnóstico inicial de neumonía.
  - **Cuando** el sistema inicializa su estadía.
  - **Entonces** el sistema debe invocar al _Respiratory Protocol Builder_.
  - **Y** debe generar tareas específicas como "Monitoreo de saturación de oxígeno continuo" e "Indicación de aislamiento de contacto y gotas".

## **Módulo de Gestión de recursos y camas**

### Épica 1: Asignación de Camas y Manejo de Concurrencia

Esta épica se centra en la correcta distribución de los pacientes en el hospital, evitando errores críticos y fallos de software como la doble asignación de una habitación.

####

#### HU 1.1 \- Asignación Segura de Cama

**Como** administrativo de piso, **quiero** asignar una cama disponible a un paciente ingresado **para** asegurar su ubicación física sin superposiciones.

**Detalle de necesidades técnicas:**

- Implementación estricta de bloqueos de base de datos (optimistas/pesimistas) para evitar asignar la misma cama a dos personas simultáneamente.
- Validación transaccional del estado previo de la cama (solo las camas libres pueden ser ocupadas).
- Relación y persistencia de datos entre el ID del Paciente, el ID de la Cama y la marca temporal de ingreso.

**Criterios de Aceptación (Gherkin):**  
**Escenario 1:** Asignación exitosa de cama disponible

- **Dado** que el paciente "Laura Gómez" requiere internación.
- **Y** la "Cama 101" se encuentra detallada como "libres" en el mapa de camas.
- **Cuando** el administrativo asigna al paciente a la "Cama 101".
- **Entonces** el sistema debe vincular al paciente con la habitación.
- **Y** el estado de la cama debe cambiar inmediatamente al estado de "ocupadas" en el mapa de camas.

**Escenario 2:** Prevención de condición de carrera (Doble asignación)

- **Dado** que la "Cama 101" se encuentra libre.
- **Cuando** dos administrativos intentan asignar simultáneamente a pacientes diferentes en la "Cama 101" en la misma fracción de segundo.
- **Entonces** el sistema debe procesar exitosamente solo la primera petición utilizando bloqueos de base de datos (optimistas o pesimistas).
- **Y** debe denegar la segunda petición con un error de concurrencia indicando que la cama acaba de ser ocupada.

###

### Épica 2: Máquina de Estados Logística

Esta área es ideal para exigir el uso de diagramas de estado complejos, asegurando que las camas no pasen mágicamente de "ocupadas" a "libres" sin un proceso intermedio.

####

#### HU 2.1 \- Transición de Higiene y Mantenimiento

**Como** personal de limpieza, **quiero** actualizar el estado de una cama recién desocupada **para** notificar que está lista y habilitar su uso para un nuevo paciente.

**Detalle de necesidades técnicas:**

- Implementación de una máquina de estados para modelar un flujo de vida estricto para el mapa de camas.
- Publicación de eventos para actualizar en tiempo real los monitores de administración del hospital.

| Estado de la Cama | Regla de Negocio / Transición Permitida                         |
| :---------------- | :-------------------------------------------------------------- |
| Libres            | Puede ser asignada a un paciente ingresante.                    |
| Ocupadas          | Solo permite transición a limpieza tras el alta o traslado.     |
| En limpieza       | Bloqueada temporalmente hasta que maestranza confirme higiene.  |
| Bloqueadas        | Fuera de servicio por mantenimiento técnico de infraestructura. |

**Criterios de Aceptación (Gherkin):**

- **Escenario 1:** Transición automática tras el alta médica
- **Dado** que un paciente recibe el alta médica y abandona la "Cama 205".
- **Cuando** el sistema procesa la liberación clínica del paciente.
- **Entonces** el estado de la cama debe pasar automáticamente al estado "en limpieza" en el mapa de camas.
- **Y** el sistema debe impedir cualquier intento de asignar un nuevo paciente a esa cama.

**Escenario 2:** Liberación exitosa por personal de maestranza

- **Dado** que la "Cama 205" se encuentra "en limpieza".
- **Cuando** el personal de maestranza confirma mediante el sistema que la higienización finalizó.
- **Entonces** el sistema debe actualizar el estado de la cama a la categoría de "libres".
- **Y** la cama debe aparecer disponible nuevamente en el mapa de camas.

###

### Épica 3: Gestión Básica de Inventario de Insumos

Este módulo debe conectarse de forma transparente con la carga laboral operativa del día a día.

####

#### HU 3.1 \- Descuento Operativo de Stock

**Descripción:** Como gestor de inventario, quiero que el sistema descuente automáticamente los insumos médicos del stock del piso cuando enfermería los administra, para garantizar la trazabilidad y evitar quiebres de materiales clínicos.  
**Detalle de necesidades técnicas:**

- Operaciones atómicas en la base de datos para manejar decrementos de stock de forma segura.
- Integración orientada a eventos para reaccionar a las acciones del Módulo de Atención y Enfermería.
- Resolución de la gestión básica de inventario para insumos médicos.

**Criterios de Aceptación (Gherkin):**  
**Escenario 1:** Descuento asíncrono tras administración

- **Dado** que el inventario de insumos médicos del piso tiene un stock de 50 unidades de "Ibuprofeno 400mg".
- **Cuando** el enfermero marca la dosis prescrita como "Administrada".
- **Entonces** el sistema debe descontar automáticamente el insumo del inventario del piso.
- **Y** el stock disponible debe actualizarse a 49 unidades de manera atómica.

# Módulo de Facturación y Finanzas

#### **Épica 1: Motor de Facturación y Patrón Strategy**

El objetivo principal de esta épica es que el sistema determine dinámicamente cómo cobrar una prestación basándose en la cobertura del paciente. Dependiendo de la obra social (prepaga, pública, o particular sin cobertura), la "estrategia" para calcular el costo de la prestación cambiará drásticamente.

- **Regla de Negocio \- Cobertura Pública**: Subsidia el 100% del costo; el paciente abona un importe cero.
- **Regla de Negocio \- Medicina Prepaga**: Aplica un copago fijo para el paciente y factura el porcentaje restante a la empresa auditora o prepaga.
- **Regla de Negocio \- Particular (Sin cobertura)**: Cobra el 100% del valor base del nomenclador directamente al paciente.

##### **HU 1.1 \- Cálculo Dinámico de Costos de Prestaciones**

**Como** analista de facturación, **quiero** que el sistema calcule el costo final de una consulta médica aplicando las reglas comerciales específicas de la obra social del paciente, **para** asegurar una liquidación precisa y automatizada.

- **Escenario 1: Estrategia de cálculo para cobertura pública**
  - **Dado** que el paciente "Juan Gómez" está registrado con la estrategia de cobertura "Obra Social Pública".
  - **Cuando** el módulo recibe la orden de facturar una "Consulta Médica General" con un valor base de 15000 pesos.
  - **Entonces** el sistema debe aplicar la estrategia correspondiente y generar un cargo de 0 pesos a nombre del paciente.
  - **Y** debe registrar un cargo subsidiado de 15000 pesos a nombre del Estado o ente regulador.
- **Escenario 2: Estrategia de cálculo para medicina prepaga**
  - **Dado** que la paciente "Ana Rojas" está registrada con la cobertura "Medicina Prepaga Premium".
  - **Y** el nomenclador establece que esa prepaga exige un copago fijo de 3000 pesos por consulta.
  - **Cuando** el módulo recibe la orden de facturar una "Consulta Médica General" de 15000 pesos.
  - **Entonces** el sistema debe aplicar la estrategia de prepaga.
  - **Y** debe generar un cargo de 3000 pesos a nombre de la paciente "Ana Rojas".
  - **Y** debe generar un reclamo de facturación a terceros por los 12000 pesos restantes dirigido a la prepaga.

#### **Épica 2: Generación Automática de Cargos (Integración Asíncrona)**

Esta épica conecta el mundo físico operativo con el administrativo. Aquí los alumnos deberán integrar el Módulo de Back-Office con el Módulo de Atención y Enfermería de forma asíncrona, escuchando eventos del sistema para no bloquear la operación médica.

##### **HU 2.1 \- Cargo Automático por Consumo de Insumos**

**Como** sistema de back-office, **quiero** escuchar los eventos de consumo de inventario generados por enfermería **para** imputar automáticamente los costos de los medicamentos a la cuenta general de la estadía del paciente.

- **Escenario 1: Facturación exitosa tras evento de administración de enfermería**
  - **Dado** que el paciente "Carlos López" se encuentra internado con una cuenta de gastos activa.
  - **Cuando** el Módulo de Back-Office recibe el evento asíncrono "MedicacionAdministrada" que indica el consumo de 1 unidad de "Ibuprofeno 400mg".
  - **Entonces** el sistema debe consultar el precio unitario del insumo en la lista de precios vigente.
  - **Y** debe agregar una nueva línea de cargo automático a la cuenta del paciente bajo el concepto "Insumos de Farmacia".
  - **Y** la línea de cargo debe estar vinculada al ID del evento original para garantizar la trazabilidad de auditoría.
