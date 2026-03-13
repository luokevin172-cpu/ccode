import * as path from 'path';
import { TaskEngine, ITask } from './tasks.js';
import { FileUtils } from '../utils/files.js';

/**
 * PromptBuilder: genera contexto de proyecto, NO código.
 *
 * CCODE es una capa de contexto. Su trabajo es:
 * - Generar documentación, arquitectura, reglas y tareas
 * - Adaptar la complejidad al tamaño real del proyecto
 * - Las tareas son un checklist descriptivo, no implementaciones
 */
export class PromptBuilder {
  private static readonly CCODE_DIR = '.ccode';

  /**
   * Meta-prompt inteligente: adapta la complejidad del contexto al proyecto.
   * Proyecto simple → contexto ligero. Proyecto complejo → arquitectura detallada.
   */
  static getContextGenerationPrompt(
    name: string,
    description: string,
    features: string,
    techStack: string,
    projectType: string,
  ): string {
    return `Eres un arquitecto de software senior. Tu trabajo es generar el CONTEXTO DE TRABAJO para un proyecto, NO código.

IMPORTANTE — ADAPTA LA COMPLEJIDAD:
- Si el proyecto es simple (pocas funcionalidades, stack básico, prototipo o prueba), genera contexto LIGERO: documentación breve, arquitectura mínima, pocas reglas, 3-5 tareas.
- Si el proyecto es mediano, genera contexto MODERADO: documentación clara, arquitectura con estructura de carpetas, reglas prácticas, 5-8 tareas.
- Si el proyecto es complejo (múltiples módulos, integraciones, escalabilidad), genera contexto COMPLETO: documentación detallada, arquitectura con diagramas, patrones, reglas exhaustivas, 8-12 tareas.

Analiza la descripción y decide el nivel de complejidad automáticamente. NO sobre-documentes un proyecto simple.

=== PROYECTO ===
NOMBRE: ${name}
DESCRIPCIÓN: ${description}
FUNCIONALIDADES: ${features}
STACK: ${techStack}
TIPO: ${projectType}

Responde ÚNICAMENTE con JSON válido. Sin bloques de código markdown, sin texto antes ni después:

{
  "project_name": "nombre del proyecto",
  "complexity": "simple|medium|complex",
  "project": "Contenido Markdown para project.md. Visión, objetivos, alcance y funcionalidades. Proporcionado al nivel de detalle que el proyecto necesita.",
  "architecture": "Contenido Markdown para architecture.md. Estructura del proyecto, tecnologías y sus roles, estructura de carpetas. Solo incluye diagramas y patrones si la complejidad lo justifica.",
  "rules": "Contenido Markdown para rules.md. Convenciones de código y estándares adaptados al stack. Breve para proyectos simples, detallado para complejos.",
  "tasks": [
    {
      "title": "Descripción clara de QUÉ hacer (no CÓMO implementarlo)",
      "description": "Criterios de aceptación: qué debe cumplirse para considerar esta tarea completa",
      "priority": "high",
      "module": "fase o área"
    }
  ]
}

REGLAS PARA LAS TAREAS:
- Las tareas son un CHECKLIST de trabajo, NO instrucciones de código
- Cada tarea describe QUÉ lograr, no CÓMO programarlo
- La descripción debe tener criterios de aceptación claros
- Ordénalas por dependencia lógica (qué va primero)
- Cada tarea debe ser verificable: se puede confirmar si está hecha o no
- Ejemplo bueno: "Crear formulario de login con campos usuario y contraseña"
- Ejemplo malo: "Implementar const form = document.createElement('form')..."

REGLAS GENERALES:
- Todo en español
- Contenido específico al stack indicado (no genérico)
- priority: "high", "medium" o "low"
- NO generes código en ningún campo
- NO uses backticks de markdown alrededor del JSON`;
  }

  /**
   * Prompt para regenerar/refinar tareas basado en el estado actual.
   */
  static getPlanRegenerationPrompt(
    projectMd: string,
    archMd: string,
    rulesMd: string,
    currentTasks: ITask[],
    extraContext: string,
  ): string {
    const completedTasks = currentTasks.filter(t => t.status === 'completed');
    const pendingTasks = currentTasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
    const failedTasks = currentTasks.filter(t => t.status === 'failed');

    const completedInfo = completedTasks.length > 0
      ? completedTasks.map(t => `- ✓ ${t.id}: ${t.title}`).join('\n')
      : 'Ninguna completada aún.';

    const pendingInfo = pendingTasks.length > 0
      ? pendingTasks.map(t => `- ○ ${t.id}: ${t.title} [${t.priority}]`).join('\n')
      : 'Ninguna pendiente.';

    const failedInfo = failedTasks.length > 0
      ? failedTasks.map(t => `- ✗ ${t.id}: ${t.title}`).join('\n')
      : '';

    return `Eres un gestor de proyecto. Analiza el estado actual y genera las SIGUIENTES tareas necesarias.

IMPORTANTE: Solo generas un checklist de tareas. NO generas código. Las tareas describen QUÉ hacer, no CÓMO programarlo.

=== PROYECTO ===
${projectMd}

=== ARQUITECTURA ===
${archMd}

=== REGLAS ===
${rulesMd}

=== TAREAS COMPLETADAS ===
${completedInfo}

=== TAREAS PENDIENTES ACTUALES ===
${pendingInfo}

${failedInfo ? `=== TAREAS FALLIDAS (necesitan replantearse) ===\n${failedInfo}\n` : ''}
=== CONTEXTO ADICIONAL DEL USUARIO ===
${extraContext || 'Ninguno.'}

Genera las próximas tareas. Responde ÚNICAMENTE con JSON válido:

{
  "tasks": [
    {
      "title": "Qué lograr (verificable)",
      "description": "Criterios de aceptación claros",
      "priority": "high|medium|low",
      "module": "fase o área"
    }
  ]
}

- Considera lo ya completado para no repetir trabajo
- Las tareas fallidas pueden necesitar un enfoque diferente
- Ordena por dependencia lógica
- Cada tarea es verificable: se puede confirmar si está hecha o no
- NO incluyas instrucciones de código en las descripciones`;
  }

  /**
   * Prompt para verificar el estado de las tareas (qué se cumplió y qué falta).
   */
  static getVerificationPrompt(
    projectMd: string,
    archMd: string,
    tasks: ITask[],
    projectFiles: string,
  ): string {
    const taskList = tasks.map(t =>
      `- [${t.status === 'completed' ? '✓' : t.status === 'in_progress' ? '◐' : '○'}] ${t.id}: ${t.title}\n  Criterios: ${t.description}`
    ).join('\n');

    return `Eres un revisor de proyecto. Tu trabajo es verificar el estado real de las tareas comparando los criterios de aceptación con el estado actual del proyecto.

=== PROYECTO ===
${projectMd}

=== ARQUITECTURA ESPERADA ===
${archMd}

=== TAREAS Y SUS CRITERIOS ===
${taskList}

=== ARCHIVOS EXISTENTES EN EL PROYECTO ===
${projectFiles}

Analiza y responde ÚNICAMENTE con JSON válido:

{
  "verification": [
    {
      "task_id": "TASK-001",
      "status": "completed|in_progress|pending|blocked",
      "evidence": "Qué encontraste que confirma o niega el cumplimiento",
      "missing": "Qué falta para considerar la tarea completa (null si está completa)"
    }
  ],
  "summary": "Resumen general del progreso del proyecto",
  "next_recommended": "TASK-XXX - qué tarea debería abordarse siguiente y por qué"
}`;
  }

  /**
   * Extrae JSON de la respuesta de la IA.
   */
  static parseJSON<T>(response: string): T {
    try {
      return JSON.parse(response) as T;
    } catch { /* intentar extraer */ }

    const start = response.indexOf('{');
    const end = response.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(response.substring(start, end + 1)) as T;
      } catch { /* intentar con regex */ }
    }

    const jsonBlock = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlock?.[1]) {
      try {
        return JSON.parse(jsonBlock[1].trim()) as T;
      } catch { /* falló todo */ }
    }

    throw new Error('No se pudo extraer JSON válido de la respuesta de la IA.');
  }

  /**
   * Genera el prompt de contexto completo del proyecto.
   * Este es el contexto que cualquier IA puede leer para entender el proyecto.
   */
  async buildContextPrompt(): Promise<string> {
    const ccodePath = path.join(process.cwd(), PromptBuilder.CCODE_DIR);

    const projectMd = await FileUtils.readFileSafe(path.join(ccodePath, 'project.md'));
    const archMd = await FileUtils.readFileSafe(path.join(ccodePath, 'architecture.md'));
    const rulesMd = await FileUtils.readFileSafe(path.join(ccodePath, 'rules.md'));
    const memoryMd = await FileUtils.readFileSafe(path.join(ccodePath, 'memory.md'));

    const taskEngine = new TaskEngine();
    await taskEngine.load();
    const tasks = taskEngine.getTasks();
    const stats = taskEngine.getStats();

    const taskList = tasks.map(t => {
      const icon = t.status === 'completed' ? '✓' : t.status === 'in_progress' ? '◐' : '○';
      return `[${icon}] ${t.id} [${t.priority}] ${t.title} — ${t.status}`;
    }).join('\n');

    return `
=== CONTEXTO DEL PROYECTO ===
${projectMd}

=== ARQUITECTURA ===
${archMd}

=== REGLAS Y ESTÁNDARES ===
${rulesMd}

=== PROGRESO DE TAREAS (${stats.completed}/${stats.total} completadas) ===
${taskList}

=== MEMORIA DE DECISIONES ===
${memoryMd}

=== NOTA ===
Este contexto fue generado por CCODE. Úsalo como referencia para mantener
coherencia arquitectónica y seguir las reglas del proyecto.
`.trim();
  }

  /**
   * Genera prompt enfocado en una tarea específica.
   */
  async buildTaskPrompt(taskId: string | null): Promise<string> {
    const baseContext = await this.buildContextPrompt();

    let taskFocus = 'No hay una tarea activa seleccionada.';
    if (taskId) {
      const taskEngine = new TaskEngine();
      await taskEngine.load();
      const task = taskEngine.getTaskById(taskId);
      if (task) {
        taskFocus = [
          `TAREA ACTIVA: [${task.id}] ${task.title}`,
          `Criterios de aceptación: ${task.description}`,
          `Prioridad: ${task.priority}`,
          `Módulo: ${task.module}`,
        ].join('\n');
      }
    }

    return `${baseContext}

=== TAREA EN FOCO ===
${taskFocus}
`.trim();
  }
}
