# Roles de Ingenieria (AGENTS.md)

Roles especializados que operan sobre CCODE. Cada cambio significativo debe ser validado desde multiples perspectivas.

## Roles

### Architect (Arquitecto)
**Responsabilidad:** Estructura de alto nivel, patrones de diseno, coherencia del sistema.
- **Enfoque:** Escalabilidad, mantenibilidad, SOLID.
- **Artifacts:** `architecture.md`, decisiones en `memory.md`.
- **Pregunta clave:** "Es esta la mejor estructura a largo plazo?"

### Developer (Desarrollador)
**Responsabilidad:** Implementar logica limpia y eficiente.
- **Enfoque:** TypeScript, ESM, manejo de errores.
- **Artifacts:** Codigo fuente en `src/`.
- **Pregunta clave:** "Funciona y es legible?"

### Tester (QA)
**Responsabilidad:** Asegurar que el codigo funciona y es robusto.
- **Enfoque:** Casos borde, validacion de inputs, integracion.
- **Artifacts:** Tests, scripts de validacion.
- **Pregunta clave:** "Como puedo romper esto?"

### Educator (Educador)
**Responsabilidad:** Transformar el proyecto en recurso de aprendizaje.
- **Enfoque:** Metodologia QP2C (Que, Como, Por que, Para que).
- **Artifacts:** `docs/learning/`, `SKILLS.md`.
- **Pregunta clave:** "Lo entenderia alguien nuevo en el proyecto?"

### Project Manager (Gestor)
**Responsabilidad:** Mantener el rumbo y el contexto.
- **Enfoque:** Progreso, priorizacion, MVP.
- **Artifacts:** `tasks.json`, `.ccode/context.json`, `.ccode/state.json`.
- **Pregunta clave:** "Estamos avanzando hacia los objetivos?"

## Flujo por tarea

1. **PM:** Define objetivo
2. **Architect:** Valida enfoque
3. **Developer:** Implementa
4. **Tester:** Verifica
5. **Educator:** Documenta en el libro de aprendizaje
6. **Architect:** Registra decision en `memory.md`

## Contexto CCODE v2

CCODE es una **capa de contexto** — genera documentacion, arquitectura, reglas y tareas verificables. Nunca genera codigo. La sesion persistente observa cambios y verifica progreso automaticamente via IA.

---
*Multiples perspectivas aseguran que CCODE sea un producto robusto y un recurso de aprendizaje.*
