```
   ██████╗ ██████╗  ██████╗ ██████╗ ███████╗
  ██╔════╝██╔════╝ ██╔═══██╗██╔══██╗██╔════╝
  ██║     ██║      ██║   ██║██║  ██║█████╗
  ██║     ██║      ██║   ██║██║  ██║██╔══╝
  ╚██████╗╚██████╗ ╚██████╔╝██████╔╝███████╗
   ╚═════╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝
  Context-Persistent AI Development  v2.0
```

---

# CCODE — Contexto Persistente para Desarrollo Asistido

## QUE es CCODE

CCODE es una herramienta CLI que genera y mantiene el **contexto de trabajo** de un proyecto de software. Genera documentacion profesional, arquitectura, reglas de desarrollo y un checklist de tareas verificables — todo adaptado automaticamente a la complejidad real del proyecto.

**CCODE no genera codigo.** Genera el contexto que guia el desarrollo.

Cuando ejecutas `ccode init`, un wizard interactivo te pregunta sobre tu proyecto y una IA genera:

| Archivo | Contenido |
|---------|-----------|
| `project.md` | Vision, objetivos, alcance y funcionalidades |
| `architecture.md` | Estructura del sistema adaptada a la complejidad |
| `rules.md` | Estandares de desarrollo especificos al stack |
| `tasks.json` | Checklist de tareas con criterios de aceptacion |
| `state.json` | Tarea activa y etapa del workflow |
| `context.json` | Configuracion general del proyecto |
| `memory.md` | Historial de decisiones y tareas completadas |
| `config.json` | Configuracion del proveedor de IA |

Todo vive en la carpeta `.ccode/` dentro del repositorio. Cualquier desarrollador o IA puede leerla y entender el proyecto al instante.

### El principio fundamental

> **El contexto vive en el proyecto, no en la conversacion.**

Cuando trabajas con IA en un proyecto grande, el contexto se pierde al cambiar de sesion, modelo o herramienta. Cada vez hay que re-explicar todo. CCODE resuelve esto almacenando el contexto en el repositorio como archivos versionables con Git.

---

## COMO funciona

### Instalacion

```bash
# Clonar el repositorio
git clone https://github.com/iDevelop25/ccode.git
cd ccode

# Instalar dependencias
npm install

# Compilar
npm run build

# Vincular globalmente
npm link
```

### Flujo de trabajo

#### Paso 1: Inicializar el proyecto

```bash
cd mi-proyecto
ccode init
```

El wizard te guia paso a paso:

```
●○○○  Paso 1/4 — Descripcion del proyecto
  > "Una app de gestion de tareas con autenticacion y dashboard"

●●○○  Paso 2/4 — Funcionalidades principales
  > "Login, registro, CRUD de tareas, filtros, estadisticas"

●●●○  Paso 3/4 — Stack tecnologico
  > "Next.js, TypeScript, Prisma, PostgreSQL"

●●●●  Paso 4/4 — Tipo de proyecto
  > "Aplicacion web"
```

La IA analiza la descripcion y decide automaticamente el nivel de complejidad:

- **Simple** (prototipo, pocas features): contexto ligero, 3-5 tareas
- **Medio** (app estandar): contexto moderado, 5-8 tareas
- **Complejo** (multiples modulos, integraciones): contexto completo con patrones y diagramas, 8-12 tareas

Un login simple no necesita diagramas de microservicios. CCODE es inteligente al respecto.

#### Paso 2: Sesion persistente

Despues de `init`, CCODE **no se cierra**. Entra en una sesion interactiva que se queda activa observando tu proyecto:

```
  ████████████░░░░░░░░  60%  (3/5)
  > Tarea activa: TASK-002 — Crear formulario de login

  ? Que hacemos?
    > Verificar progreso (se detectaron cambios)
      Marcar tarea como completada
      Iniciar siguiente tarea (2 pendientes)
      Generar / actualizar plan de tareas
      Ver estado completo
      Ver contexto generado
      Salir
```

La sesion funciona como un loop continuo:

1. **Detecta cambios** en tus archivos automaticamente (FileWatcher)
2. **Muestra progreso** con barra visual y tarea activa
3. **Adapta el menu** al estado actual del proyecto
4. **Sugiere acciones** relevantes (si hay cambios + tarea activa → sugiere verificar)
5. **Se recupera de errores** — si algo falla, la sesion sigue activa

Tu desarrollas en tu editor favorito. CCODE esta en otra terminal como un acompanante que detecta tu progreso.

#### Paso 3: Verificacion automatica

Cuando CCODE detecta cambios en tus archivos, puedes pedirle que verifique:

```
  > Verificar progreso con IA

  Verificando 5 tareas contra el estado del proyecto...

  ✓ TASK-001: Configurar proyecto base — COMPLETADA
    Evidencia: package.json, tsconfig.json y estructura de carpetas encontrados

  ◐ TASK-002: Crear formulario de login — EN PROGRESO
    Falta: Campo de contrasena no encontrado, validacion pendiente

  ○ TASK-003: Implementar autenticacion JWT — PENDIENTE
```

La IA compara los **criterios de aceptacion** de cada tarea con los **archivos reales** del proyecto. No adivina — verifica.

#### Acciones disponibles

| Accion | Que hace |
|--------|----------|
| **Conectar IA** | Configura Claude o Ollama como proveedor |
| **Siguiente tarea** | Muestra la tarea mas prioritaria y ofrece iniciarla |
| **Verificar progreso** | La IA escanea el proyecto y actualiza estados |
| **Completar tarea** | Marca como completada, registra en memoria |
| **Re-planificar** | Genera nuevas tareas considerando lo ya completado |
| **Ver estado** | Dashboard con barra de progreso y estadisticas |
| **Ver contexto** | Muestra cualquier archivo de `.ccode/` |

---

## POR QUE CCODE

### El problema

El desarrollo asistido por IA tiene un problema critico: **el contexto es efimero**. Cada vez que cambias de sesion, modelo o herramienta, pierdes el contexto acumulado. El desarrollador termina re-explicando la arquitectura, las decisiones previas y el estado actual una y otra vez.

### La solucion

CCODE aplica el principio de **contexto persistente**: toda la informacion del proyecto se almacena como archivos dentro del repositorio. Esto significa:

- **Independencia de sesion:** El contexto no depende de la memoria de ninguna herramienta. Cierras CCODE, vuelves manana, y todo sigue ahi.
- **Independencia de modelo:** Cualquier IA (Claude, GPT, Ollama, la que sea) puede leer `.ccode/` y entender el proyecto al instante.
- **Trazabilidad:** Cada cambio queda en archivos versionables con Git. Puedes ver cuando se tomo cada decision.
- **Consistencia:** Todos los colaboradores y herramientas operan con la misma fuente de verdad.
- **Workflow explicito:** El estado del workflow evita que se ejecuten acciones fuera de orden.

### Por que contexto y no codigo

CCODE genera **que** construir, no **como** programarlo. Las tareas son un checklist descriptivo con criterios de aceptacion:

```
Bueno:  "Crear formulario de login con campos usuario y contrasena"
Malo:   "Implementar const form = document.createElement('form')..."
```

Esto permite que cualquier desarrollador (humano o IA) ejecute las tareas con su propio criterio tecnico. CCODE guia el rumbo, no dicta la implementacion.

---

## PARA QUE sirve CCODE

### Para el desarrollador

- **Elimina la perdida de contexto** entre sesiones de trabajo
- **Guia paso a paso** sin que te pierdas en un proyecto grande
- **Detecta tu progreso** automaticamente mientras programas
- **Adapta la complejidad** al tamano real del proyecto

### Para el equipo

- **Fuente de verdad unica:** Todos ven el mismo estado del proyecto
- **Onboarding rapido:** Un nuevo miembro lee `.ccode/` y entiende todo
- **Decisiones trazables:** El historial de memoria muestra por que se tomaron decisiones

### Para la IA

- **Contexto completo en un directorio:** Cualquier LLM puede leer `.ccode/` sin configuracion
- **Tareas verificables:** La IA puede confirmar objetivamente si una tarea esta completa
- **Arquitectura como referencia:** Las respuestas de la IA mantienen coherencia con la arquitectura definida

---

## Arquitectura del sistema

```
src/
  cli/
    index.ts          → Entry point, sesion persistente, handlers de acciones
    brand.ts          → Identidad visual (logo ASCII, paleta, componentes UI)
    watcher.ts        → FileWatcher (observa cambios en tiempo real)
  core/
    context.ts        → ContextEngine (configuracion + estado del workflow)
    tasks.ts          → TaskEngine (checklist de tareas con prioridades)
    prompt-builder.ts → Meta-prompts adaptativos, generacion y verificacion
  ai/
    provider.ts       → Interfaz comun IAIProvider (patron Adapter)
    claude.ts         → Adapter para Claude (API de Anthropic)
    ollama.ts         → Adapter para Ollama (modelos locales)
    manager.ts        → Gestion de configuracion y conexion
  utils/
    files.ts          → Abstraccion del sistema de archivos
```

### Patrones de diseno

| Patron | Donde | Por que |
|--------|-------|---------|
| **Adapter** | `ai/` | Proveedores intercambiables sin cambiar el core |
| **State Machine** | `context.ts` | Workflow explicito (created → connected → planned → in_progress → idle) |
| **Observer** | `watcher.ts` | Deteccion reactiva de cambios en archivos |
| **Builder** | `prompt-builder.ts` | Construccion incremental de prompts complejos |

### Paleta de colores

| Color | Hex | Uso |
|-------|-----|-----|
| Primary | `#00B4D8` | Elementos principales, headers |
| Secondary | `#0077B6` | Acentos secundarios |
| Accent | `#90E0EF` | Highlights, info destacada |
| Success | `#2DC653` | Operaciones exitosas |
| Warning | `#FFB703` | Advertencias |
| Error | `#E63946` | Errores |

### Logo gradiente

El logo ASCII usa un gradiente de 6 tonos de azul/cyan:
`#90E0EF → #48CAE4 → #00B4D8 → #0096C7 → #0077B6 → #023E8A`

---

## Stack tecnologico

| Tecnologia | Rol |
|------------|-----|
| **Node.js** | Runtime |
| **TypeScript** | Tipado estatico, interfaces |
| **ESM** | Sistema de modulos (`"type": "module"`, `NodeNext`) |
| **Commander.js** | Definicion de comandos CLI |
| **Inquirer v13** | Prompts interactivos y menus |
| **Chalk v5** | Colores en terminal |
| **Ora v8** | Spinners de progreso |
| **Axios** | HTTP client para APIs de IA |
| **fs-extra** | Operaciones de archivos mejoradas |
| **Vitest** | Testing |

---

## Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm test:watch
```

19 tests cubriendo:
- `PromptBuilder.parseJSON` — parsing robusto de respuestas de IA (directo, envuelto en texto, bloques markdown)
- `TaskEngine` — CRUD de tareas, priorizacion, estadisticas, manejo de errores
- `FileWatcher` — Estado inicial, flush, stop seguro

---

## Scripts disponibles

```bash
npm run build      # Compilar TypeScript
npm run dev        # Compilar en modo watch
npm start          # Ejecutar CCODE
npm test           # Ejecutar tests
npm run test:watch # Tests en modo watch
```

---

## Documentacion extendida

El proyecto incluye una guia de aprendizaje modular bajo la metodologia **QP2C** (Que, Como, Por que, Para que):

| Modulo | Tema |
|--------|------|
| [00 — Introduccion](docs/learning/modules/00-intro.md) | Que es CCODE y que problema resuelve |
| [01 — CLI y Sesion](docs/learning/modules/01-cli-session.md) | Arquitectura CLI, loop persistente, menu contextual |
| [02 — Contexto Persistente](docs/learning/modules/02-context-persistence.md) | ContextEngine, TaskEngine, estado en `.ccode/` |
| [03 — Generacion de Contexto](docs/learning/modules/03-context-generation.md) | PromptBuilder, meta-prompts, adaptacion de complejidad |
| [04 — Proveedores de IA](docs/learning/modules/04-ai-providers.md) | Patron Adapter, Claude, Ollama, AIManager |
| [05 — Watcher y Verificacion](docs/learning/modules/05-watcher-verify.md) | FileWatcher, verificacion automatica de tareas |

Documentos adicionales:
- [`AGENTS.md`](AGENTS.md) — Roles de ingenieria del proyecto
- [`SKILLS.md`](SKILLS.md) — Competencias tecnicas requeridas

---

## Licencia

ISC

---

*CCODE no te dice como programar — te dice que construir y se asegura de que no pierdas el rumbo.*
