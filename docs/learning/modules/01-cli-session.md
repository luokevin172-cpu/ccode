# Módulo 01: CLI y Sesión Persistente

## 1. QUÉ (Concepto)

La CLI de CCODE no es una herramienta de "ejecutar y salir". Es un **acompañante persistente** que se queda activo observando tu proyecto. Después de inicializar, CCODE entra en una sesión en loop que detecta cambios, sugiere acciones y guía al desarrollador paso a paso.

## 2. CÓMO (Implementación)

### Arquitectura de la CLI

```
src/cli/
  index.ts    → Entry point, comandos, sesión persistente
  brand.ts    → Logo, paleta de colores, componentes UI
  watcher.ts  → Observador de cambios en archivos
```

### Modo Sesión (Loop Persistente)

Cuando ejecutas `ccode` o `ccode init`, el sistema entra en un loop:

```
startSession()
  ├── Iniciar FileWatcher (observa archivos del proyecto)
  ├── LOOP:
  │   ├── Flush cambios detectados
  │   ├── Mostrar estado compacto (progreso, tarea activa)
  │   ├── Construir menú contextual
  │   │   └── Si hay cambios + tarea activa → sugerir verificación
  │   ├── Esperar acción del usuario
  │   ├── Ejecutar handler
  │   └── "CCODE sigue observando..."
  └── Cerrar watcher al salir
```

### Menú Contextual Inteligente

El menú se adapta al estado:
- Si **no hay IA configurada** → muestra "Conectar proveedor" primero
- Si **hay cambios detectados** + tarea activa → destaca "Verificar progreso"
- Si **hay tarea activa** → muestra "Completar" y "Verificar"
- Si **no hay tarea activa** → muestra "Siguiente tarea"

### Brand Terminal

`brand.ts` define la identidad visual:
- Logo ASCII con gradiente azul/cyan
- Paleta consistente (primary, accent, success, warning, error)
- Componentes reutilizables: `showHeader()`, `showStep()`, `showProgressBar()`, `showFileTree()`

## 3. POR QUÉ (Justificación)

- **Acompañante, no herramienta:** El desarrollador trabaja en otra terminal; CCODE está siempre disponible en esta.
- **Menú contextual:** Evita que el usuario tenga que recordar comandos. Siempre ve las opciones relevantes a su estado actual.
- **Detección de cambios:** No necesitas decirle a CCODE que trabajaste — él lo detecta automáticamente.

## 4. PARA QUÉ (Utilidad)

- Guía paso a paso sin que el usuario se pierda
- Cada acción sugiere la siguiente
- El watcher convierte a CCODE en un observador activo del proyecto
- La sesión persistente elimina la fricción de ejecutar comandos individuales

---
*CCODE no se cierra — se queda a tu lado mientras desarrollas.*
