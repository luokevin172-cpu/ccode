# Módulo 05: File Watcher y Verificación Automática

## 1. QUÉ (Concepto)

CCODE no se cierra después de inicializar — se queda **activo observando**. El **FileWatcher** detecta cambios en los archivos del proyecto en tiempo real. Cuando el desarrollador modifica código, CCODE lo nota y sugiere verificar si las tareas se cumplieron. La **verificación** usa la IA para comparar los criterios de aceptación con el estado real del proyecto.

## 2. CÓMO (Implementación)

### FileWatcher (`src/cli/watcher.ts`)

Usa `fs.watch` con `recursive: true` (nativo en macOS) para observar todo el directorio del proyecto.

```
FileWatcher
  ├── start(projectDir)     → Inicia la observación recursiva
  ├── onChange(callback)     → Registra callback con debounce
  ├── flush()                → Obtiene y limpia cambios acumulados
  ├── pendingCount           → Cantidad de cambios sin procesar
  └── stop()                 → Detiene la observación
```

#### Filtrado inteligente

Ignora automáticamente directorios que no son código del usuario:

```
node_modules, .ccode, .git, dist, .next, __pycache__,
.venv, .DS_Store, .env, coverage, .turbo, .cache
```

También ignora archivos que comienzan con `.` (dotfiles).

#### Debounce de 2 segundos

El watcher acumula cambios durante 2 segundos de inactividad antes de notificar. Esto evita:
- Notificaciones por cada keystroke del IDE (auto-save)
- Flood durante operaciones batch (npm install, build)

#### `displayChanges(files)`

Muestra un resumen visual de los cambios detectados (máximo 8 archivos, luego "... y N más").

### Verificación de tareas

Cuando el menú detecta cambios + tarea activa, ofrece "Verificar progreso":

1. Lee los archivos del proyecto (árbol de archivos)
2. Lee las tareas y sus criterios de aceptación
3. Envía todo a la IA via `getVerificationPrompt()`
4. La IA responde con:
   - `status` por tarea: completed, in_progress, pending, blocked
   - `evidence`: qué encontró que confirma el progreso
   - `missing`: qué falta (null si completa)
   - `next_recommended`: siguiente tarea sugerida
5. CCODE actualiza automáticamente los estados de las tareas

### Integración con la sesión

En cada iteración del loop de sesión:

```
1. flush() → obtener cambios acumulados
2. Si hay cambios + tarea activa:
   → Mostrar cambios detectados
   → Agregar "Verificar progreso" al menú (destacado)
3. Si no hay cambios:
   → Menú normal según estado del workflow
```

## 3. POR QUÉ (Justificación)

- **Acompañante, no herramienta:** El desarrollador trabaja en su editor favorito; CCODE está en otra terminal detectando automáticamente su progreso
- **Debounce:** Sin debounce, cada auto-save del IDE dispararía una notificación — mala UX
- **Verificación por IA:** Los criterios de aceptación son texto libre. Solo una IA puede evaluar si "Crear formulario de login con campos usuario y contraseña" se cumplió mirando el código real
- **Filtrado de directorios:** Sin filtrado, un `npm install` generaría miles de eventos inútiles

## 4. PARA QUÉ (Utilidad)

- El desarrollador no necesita decirle a CCODE que trabajó — CCODE lo detecta solo
- La verificación automática elimina la revisión manual de criterios
- El flujo es natural: programas → CCODE nota → ofrece verificar → actualiza progreso
- Las tareas avanzan de estado sin intervención manual cuando la IA confirma su cumplimiento

---
*CCODE observa mientras trabajas y te avisa cuando completaste una tarea.*
