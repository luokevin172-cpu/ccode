# Módulo 00: Introducción a CCODE

## 1. QUÉ (Concepto)

CCODE es una herramienta CLI que genera y mantiene el **contexto de trabajo** de un proyecto de software. No genera código — genera documentación, arquitectura, reglas y un checklist de tareas que cualquier desarrollador o IA puede usar como referencia.

El principio fundamental: **el contexto vive en el proyecto, no en la conversación**.

## 2. CÓMO (Implementación)

Al ejecutar `ccode init`, el sistema:

1. Pregunta al usuario sobre su proyecto (descripción, funcionalidades, stack)
2. Envía esa información a una IA que genera contexto profesional
3. Adapta la complejidad automáticamente (simple → ligero, complejo → detallado)
4. Crea la carpeta `.ccode/` con toda la documentación generada
5. Entra en **sesión persistente** — se queda activo observando cambios

La carpeta `.ccode/` contiene:

| Archivo | Contenido |
|---------|-----------|
| `context.json` | Configuración del proyecto |
| `project.md` | Documentación (visión, objetivos, alcance) |
| `architecture.md` | Arquitectura del sistema |
| `rules.md` | Reglas y estándares de desarrollo |
| `tasks.json` | Checklist de tareas con criterios de aceptación |
| `state.json` | Estado actual (tarea activa, etapa del workflow) |
| `memory.md` | Historial de decisiones y tareas completadas |
| `config.json` | Configuración del proveedor de IA |

## 3. POR QUÉ (Justificación)

El problema: cuando trabajas con IA en un proyecto grande, el contexto se pierde al cambiar de sesión, modelo o herramienta. Cada vez hay que re-explicar todo.

CCODE resuelve esto almacenando el contexto en el repositorio. Cualquier IA puede leer `.ccode/` y entender el proyecto inmediatamente.

Además, CCODE **adapta la complejidad**: un login simple no necesita diagramas de microservicios. Un proyecto enterprise sí necesita arquitectura detallada.

## 4. PARA QUÉ (Utilidad)

- Eliminar la pérdida de contexto entre sesiones
- Mantener coherencia arquitectónica a lo largo del desarrollo
- Permitir que cualquier IA (Claude, GPT, Ollama) entienda el proyecto al instante
- Guiar el desarrollo con un checklist de tareas verificables
- Registrar decisiones para trazabilidad histórica

---
*CCODE no te dice cómo programar — te dice qué construir y se asegura de que no pierdas el rumbo.*
