# CCODE — Guía de Aprendizaje

## Metodología QP2C

Cada módulo sigue la estructura **QP2C**:

| Sección | Pregunta |
|---------|----------|
| **QUÉ** | ¿Qué concepto o componente se explica? |
| **CÓMO** | ¿Cómo funciona internamente? |
| **POR QUÉ** | ¿Por qué se diseñó así? |
| **PARA QUÉ** | ¿Para qué sirve en el contexto del sistema? |

## Módulos

| # | Módulo | Tema |
|---|--------|------|
| 00 | [Introducción](modules/00-intro.md) | Qué es CCODE y qué problema resuelve |
| 01 | [CLI y Sesión Persistente](modules/01-cli-session.md) | Arquitectura CLI, sesión en loop, menú contextual |
| 02 | [Contexto Persistente](modules/02-context-persistence.md) | ContextEngine, TaskEngine, estado en .ccode/ |
| 03 | [Generación Inteligente de Contexto](modules/03-context-generation.md) | PromptBuilder, meta-prompts, adaptación de complejidad |
| 04 | [Proveedores de IA](modules/04-ai-providers.md) | Adapter pattern, Claude, Ollama, AIManager |
| 05 | [File Watcher y Verificación](modules/05-watcher-verify.md) | Observador de cambios, verificación automática de tareas |

## Filosofía

CCODE es una **capa de contexto**, no un generador de código.

- Genera: documentación, arquitectura, reglas, checklist de tareas
- No genera: código fuente
- Las tareas describen QUÉ lograr, no CÓMO programarlo
- La IA verifica si los criterios de las tareas se cumplieron
- El contexto vive en el proyecto (.ccode/), no en la conversación

---
*Diseñado para desarrolladores y sistemas de análisis de arquitectura.*
