# Módulo 02: Persistencia de Contexto y Motor de Estado

## 1. QUÉ (Concepto)

La **Persistencia de Contexto** es el principio central de CCODE: toda la información del proyecto (arquitectura, reglas, tareas, decisiones) se almacena en `.ccode/` dentro del repositorio. El **ContextEngine** y el **TaskEngine** son los motores que leen, validan y actualizan esta información.

## 2. CÓMO (Implementación)

### ContextEngine (`src/core/context.ts`)

Gestiona la configuración y el estado del workflow:

```typescript
interface IProjectContext {
  name: string;
  version: string;
  architecture_file: string;
  rules_file: string;
  tasks_file: string;
}

interface IProjectState {
  current_task_id: string | null;
  workflow_stage: 'created' | 'connected' | 'planned' | 'in_progress' | 'idle';
}
```

Métodos: `load()`, `getContext()`, `getState()`, `updateState()`, `readContextFile()`.

### TaskEngine (`src/core/tasks.ts`)

Gestiona el checklist de tareas:

```typescript
interface ITask {
  id: string;         // "TASK-001"
  title: string;      // QUÉ lograr
  description: string; // Criterios de aceptación
  status: TaskStatus;  // pending | in_progress | completed | failed
  priority: TaskPriority;
  module: string;
}
```

Métodos: `load()`, `save()`, `getTasks()`, `addTask()`, `setTasks()`, `updateTaskStatus()`, `getNextTask()`, `getStats()`.

### Ciclo de vida

1. **Carga:** `load()` lee los JSON de `.ccode/` y los deserializa en interfaces TypeScript
2. **Consulta:** Los handlers de la CLI leen estado y tareas
3. **Mutación:** Cambios se persisten inmediatamente al disco
4. **Workflow Stage:** Rastrea en qué etapa está el proyecto (created → planned → in_progress → idle)

### Archivos clave

| Archivo | Motor | Propósito |
|---------|-------|-----------|
| `context.json` | ContextEngine | Configuración global, punteros a archivos |
| `state.json` | ContextEngine | Tarea activa, etapa del workflow |
| `tasks.json` | TaskEngine | Checklist completo con estados y prioridades |
| `memory.md` | CLI (directo) | Registro histórico de decisiones |

## 3. POR QUÉ (Justificación)

- **Independencia de sesión:** El contexto no depende de la memoria de ninguna herramienta
- **Trazabilidad:** Cada cambio queda en archivos versionables con Git
- **Consistencia:** Todos los colaboradores y herramientas operan con la misma fuente de verdad
- **Workflow explícito:** El `workflow_stage` evita que el usuario ejecute acciones fuera de orden

## 4. PARA QUÉ (Utilidad)

- `getNextTask()` guía al desarrollador hacia la tarea más prioritaria
- `getStats()` muestra progreso visual (barra, conteos)
- El estado persiste entre sesiones — puedes cerrar CCODE y retomar donde dejaste
- Cualquier IA puede leer `.ccode/` y entender el estado completo del proyecto

---
*La persistencia de contexto convierte a CCODE de documentación pasiva en un motor operativo de desarrollo.*
