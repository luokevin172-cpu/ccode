# Competencias Tecnicas (SKILLS.md)

Habilidades requeridas para desarrollar, mantener y entender CCODE.

## Core Stack

### Node.js & TypeScript
- **Nivel:** Intermedio-Avanzado
- **Conceptos:** Async/Await, ESM (import/export), tipado estatico, generics, interfaces
- **Nota v2:** El proyecto usa `"type": "module"` con `NodeNext` resolution. Todas las dependencias principales (chalk v5, inquirer v13, ora v8) son ESM-only.

### Git
- **Nivel:** Intermedio
- **Conceptos:** Branching, conventional commits, `.gitignore`

## CLI Development

### Commander.js
- **Uso:** Definicion de comandos y entry point
- **En v2:** Se usa principalmente para el comando `init`. La sesion persistente maneja la interaccion via menus de Inquirer.

### Inquirer v13
- **Uso:** Prompts interactivos, wizards, menus contextuales
- **Nota:** v13 renombro `type: 'list'` a `type: 'select'`

### Chalk v5 + Ora v8
- **Uso:** Colores en terminal y spinners de progreso
- **Nota:** Ambos son ESM-only, requieren `import` (no `require`)

## Arquitectura y Patrones

### Persistencia de Contexto
- **Concepto central:** Todo el estado del proyecto vive en `.ccode/` — archivos JSON y Markdown versionables con Git
- **Patrones:** Local-First Software, State Persistence

### Patron Adapter (IA)
- **Aplicacion:** `IAIProvider` como interfaz comun, `ClaudeAdapter` y `OllamaAdapter` como implementaciones
- **Beneficio:** Agregar proveedores nuevos no requiere cambios en el resto del sistema

### Sesion Persistente (Loop REPL)
- **Concepto:** CCODE no es "ejecutar y salir" — se queda activo observando el proyecto
- **Componentes:** FileWatcher (fs.watch), menu contextual adaptativo, debounce de cambios

## Prompt Engineering

### Meta-prompts adaptativos
- **Habilidad:** Disenar prompts que adaptan su salida a la complejidad del input
- **Aplicacion:** `PromptBuilder` genera contexto ligero para proyectos simples y detallado para complejos
- **Tecnica:** Incluir reglas de adaptacion en el prompt + formato JSON estricto

### Parsing defensivo de respuestas
- **Habilidad:** Extraer JSON de respuestas impredecibles de LLMs
- **Tecnica:** Multiples estrategias de parsing (directo → busqueda de braces → regex de code blocks)

## Recursos recomendados
- "Clean Code" (Robert C. Martin)
- "Node.js Design Patterns" (Mario Casciaro)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Commander.js](https://github.com/tj/commander.js)
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js)

---
*Dominar estas competencias permite contribuir efectivamente a CCODE y entender sus decisiones de diseno.*
