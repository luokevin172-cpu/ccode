# Módulo 03: Generación Inteligente de Contexto

## 1. QUÉ (Concepto)

El **PromptBuilder** es el cerebro de CCODE. Transforma la descripción informal del usuario en documentación profesional, arquitectura y un checklist de tareas — todo adaptado automáticamente a la complejidad real del proyecto.

CCODE **nunca genera código**. Genera el contexto que guía el desarrollo.

## 2. CÓMO (Implementación)

### PromptBuilder (`src/core/prompt-builder.ts`)

Clase con métodos estáticos para construir prompts especializados:

#### Meta-prompt de Generación (`getContextGenerationPrompt`)

Recibe los datos del wizard (nombre, descripción, features, stack, tipo) y construye un prompt que:

1. Instruye a la IA para actuar como arquitecto senior
2. Define tres niveles de complejidad:
   - **Simple** (prototipo, pocas features): contexto ligero, 3-5 tareas
   - **Medio** (app estándar): contexto moderado, 5-8 tareas
   - **Complejo** (múltiples módulos, integraciones): contexto completo, 8-12 tareas
3. La IA decide el nivel automáticamente según la descripción
4. Genera un JSON con: `project`, `architecture`, `rules`, `tasks[]`

```
getContextGenerationPrompt(name, description, features, techStack, projectType)
  → Prompt que produce JSON con contexto completo adaptado
```

#### Reglas para tareas generadas

- Describen **QUÉ** lograr, no **CÓMO** programarlo
- Criterios de aceptación verificables
- Ordenadas por dependencia lógica
- Sin código en ningún campo

#### Prompt de Regeneración (`getPlanRegenerationPrompt`)

Analiza el estado actual del proyecto (completadas, pendientes, fallidas) y genera nuevas tareas que:
- No repiten trabajo completado
- Replantean tareas fallidas con enfoque diferente
- Mantienen coherencia con la arquitectura existente

#### Prompt de Verificación (`getVerificationPrompt`)

Envía a la IA los criterios de aceptación + archivos del proyecto para verificar:
- Qué tareas están realmente completadas (evidencia)
- Qué falta para completar cada tarea
- Cuál debería ser la siguiente tarea

### Parsing robusto de JSON (`parseJSON<T>`)

La IA no siempre responde con JSON limpio. `parseJSON` intenta tres estrategias:

1. `JSON.parse()` directo
2. Buscar `{...}` dentro del texto (primer `{` al último `}`)
3. Regex para extraer bloques de código markdown (` ```json ... ``` `)

### Constructores de contexto

- `buildContextPrompt()`: Lee todos los archivos de `.ccode/` y ensambla un prompt completo
- `buildTaskPrompt(taskId)`: Contexto completo + foco en una tarea específica

## 3. POR QUÉ (Justificación)

- **Adaptación de complejidad:** Un login simple no necesita diagramas de microservicios. CCODE es inteligente al respecto.
- **Separación contexto/código:** Las tareas son un checklist verificable, no instrucciones de implementación. Esto permite que cualquier desarrollador o IA las ejecute con su propio criterio.
- **Parsing defensivo:** Los LLMs son impredecibles en formato. Tres capas de parsing eliminan fallos por formato inesperado.

## 4. PARA QUÉ (Utilidad)

- Un solo prompt genera toda la documentación del proyecto adaptada a su tamaño real
- Las tareas generadas son verificables automáticamente por la IA
- El contexto ensamblado es portable: cualquier IA puede leer `.ccode/` y entender el proyecto
- La regeneración de plan permite evolucionar el checklist sin perder progreso

---
*El PromptBuilder convierte una idea vaga en un plan de trabajo profesional y verificable.*
