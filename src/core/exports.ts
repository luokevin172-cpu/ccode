import * as path from 'path';
import { FileUtils } from '../utils/files.js';
import { TaskEngine, ITask } from './tasks.js';

/**
 * ContextExporter: genera archivos de contexto para cada herramienta de IA.
 *
 * Lee la fuente de verdad (.ccode/) y produce exports específicos:
 * - AGENTS.md      → Estándar abierto (Linux Foundation)
 * - CLAUDE.md      → Claude Code
 * - GEMINI.md      → Gemini CLI
 * - .cursorrules   → Cursor
 * - copilot-instructions.md → GitHub Copilot
 *
 * Cada export se adapta al formato y expectativas de la herramienta destino.
 */
export class ContextExporter {
  private readonly ccodePath: string;
  private readonly projectRoot: string;

  // Formatos soportados y sus rutas relativas al root del proyecto
  static readonly FORMATS: Record<string, { file: string; label: string }> = {
    agents:  { file: 'AGENTS.md', label: 'AGENTS.md (Open Standard)' },
    claude:  { file: 'CLAUDE.md', label: 'CLAUDE.md (Claude Code)' },
    gemini:  { file: 'GEMINI.md', label: 'GEMINI.md (Gemini CLI)' },
    cursor:  { file: '.cursorrules', label: '.cursorrules (Cursor)' },
    copilot: { file: '.github/copilot-instructions.md', label: 'copilot-instructions.md (GitHub Copilot)' },
  };

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || process.cwd();
    this.ccodePath = path.join(this.projectRoot, '.ccode');
  }

  /**
   * Lee todos los archivos de contexto de .ccode/
   */
  private async readSources(): Promise<{
    project: string;
    architecture: string;
    rules: string;
    memory: string;
    tasks: ITask[];
    stats: { total: number; completed: number; pending: number; in_progress: number; failed: number };
    projectName: string;
  }> {
    const project = await FileUtils.readFileSafe(path.join(this.ccodePath, 'project.md'));
    const architecture = await FileUtils.readFileSafe(path.join(this.ccodePath, 'architecture.md'));
    const rules = await FileUtils.readFileSafe(path.join(this.ccodePath, 'rules.md'));
    const memory = await FileUtils.readFileSafe(path.join(this.ccodePath, 'memory.md'));

    const taskEngine = new TaskEngine();
    await taskEngine.load();
    const tasks = taskEngine.getTasks();
    const stats = taskEngine.getStats();

    let projectName = 'Proyecto';
    try {
      const ctx = await FileUtils.readJson<{ name?: string }>(path.join(this.ccodePath, 'context.json'));
      if (ctx.name) projectName = ctx.name;
    } catch { /* ignore */ }

    return { project, architecture, rules, memory, tasks, stats, projectName };
  }

  /**
   * Formatea las tareas como lista legible.
   */
  private formatTasks(tasks: ITask[], style: 'checkbox' | 'status'): string {
    if (tasks.length === 0) return 'No hay tareas definidas.';

    return tasks.map(t => {
      if (style === 'checkbox') {
        const check = t.status === 'completed' ? 'x' : ' ';
        return `- [${check}] **${t.id}** ${t.title}`;
      }
      const icon = t.status === 'completed' ? 'DONE' :
                   t.status === 'in_progress' ? 'IN PROGRESS' :
                   t.status === 'failed' ? 'FAILED' : 'PENDING';
      return `- [${icon}] ${t.id}: ${t.title}`;
    }).join('\n');
  }

  /**
   * Genera AGENTS.md — Estándar abierto compatible con múltiples herramientas.
   * Sigue la convención de AGENTS.md (Linux Foundation / AAIF).
   */
  async generateAgentsMd(): Promise<string> {
    const { project, architecture, rules, tasks, stats, projectName } = await this.readSources();

    return `# ${projectName}

${project}

## Architecture

${architecture}

## Development Guidelines

${rules}

## Current Status

Progress: ${stats.completed}/${stats.total} tasks completed

${this.formatTasks(tasks, 'checkbox')}

## Notes for AI Agents

- This project uses CCODE for context management
- All context files live in \`.ccode/\` — that is the source of truth
- Do not modify \`.ccode/\` files directly; use \`ccode update\` instead
- Follow the development guidelines above when making changes
- Check task status before starting new work
`;
  }

  /**
   * Genera CLAUDE.md — Optimizado para Claude Code.
   * Claude Code lee este archivo automáticamente del root del proyecto.
   */
  async generateClaudeMd(): Promise<string> {
    const { project, architecture, rules, tasks, stats, memory, projectName } = await this.readSources();

    const activeTasks = tasks.filter(t => t.status !== 'completed');
    const activeSection = activeTasks.length > 0
      ? activeTasks.map(t => {
          const status = t.status === 'in_progress' ? '(in progress)' : '';
          return `- ${t.id}: ${t.title} ${status}\n  Criteria: ${t.description}`;
        }).join('\n')
      : 'All tasks completed.';

    return `# ${projectName}

${project}

## Architecture

${architecture}

## Rules

${rules}

## Progress (${stats.completed}/${stats.total})

${this.formatTasks(tasks, 'checkbox')}

## Pending Work

${activeSection}

## Decision History

${memory}
`;
  }

  /**
   * Genera GEMINI.md — Para Gemini CLI.
   */
  async generateGeminiMd(): Promise<string> {
    const { project, architecture, rules, tasks, stats, projectName } = await this.readSources();

    return `# ${projectName}

${project}

## Architecture

${architecture}

## Guidelines

${rules}

## Task Progress (${stats.completed}/${stats.total})

${this.formatTasks(tasks, 'checkbox')}
`;
  }

  /**
   * Genera .cursorrules — Instrucciones para Cursor IDE.
   * Cursor lee este archivo del root del proyecto automáticamente.
   */
  async generateCursorRules(): Promise<string> {
    const { project, architecture, rules, tasks, stats, projectName } = await this.readSources();

    // Cursor rules tiende a ser más conciso y directivo
    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    const pendingSection = pendingTasks.length > 0
      ? pendingTasks.map(t => `- ${t.title}`).join('\n')
      : 'All tasks completed.';

    return `# ${projectName}

${project}

## Architecture

${architecture}

## Rules

${rules}

## Current Tasks (${stats.completed}/${stats.total} done)

${pendingSection}
`;
  }

  /**
   * Genera copilot-instructions.md — Para GitHub Copilot.
   * Se ubica en .github/copilot-instructions.md
   */
  async generateCopilotInstructions(): Promise<string> {
    const { project, architecture, rules, projectName } = await this.readSources();

    // Copilot instructions es más enfocado en reglas de código
    return `# ${projectName}

${project}

## Architecture

${architecture}

## Coding Guidelines

${rules}
`;
  }

  /**
   * Genera el export universal (.ccode/context-export.md).
   */
  async generateUniversalExport(): Promise<string> {
    const { project, architecture, rules, memory, tasks, stats } = await this.readSources();

    const taskList = tasks.map(t => {
      const icon = t.status === 'completed' ? '[DONE]' :
                   t.status === 'in_progress' ? '[IN PROGRESS]' : '[PENDING]';
      return `${icon} ${t.id} [${t.priority.toUpperCase()}] ${t.title}`;
    }).join('\n');

    return `# CCODE — Project Context Export

## Project

${project}

## Architecture

${architecture}

## Development Rules

${rules}

## Task Progress (${stats.completed}/${stats.total} completed)

${taskList}

## Decision History

${memory}
`;
  }

  /**
   * Genera y escribe un formato específico.
   */
  async exportFormat(format: string): Promise<string> {
    const info = ContextExporter.FORMATS[format];
    if (!info) throw new Error(`Formato desconocido: ${format}`);

    let content: string;
    switch (format) {
      case 'agents':  content = await this.generateAgentsMd(); break;
      case 'claude':  content = await this.generateClaudeMd(); break;
      case 'gemini':  content = await this.generateGeminiMd(); break;
      case 'cursor':  content = await this.generateCursorRules(); break;
      case 'copilot': content = await this.generateCopilotInstructions(); break;
      default: throw new Error(`Formato desconocido: ${format}`);
    }

    const filePath = path.join(this.projectRoot, info.file);

    // Asegurar que el directorio padre exista (para .github/)
    await FileUtils.ensureDir(path.dirname(filePath));
    await FileUtils.writeFile(filePath, content);

    return filePath;
  }

  /**
   * Exporta todos los formatos de una vez.
   * Retorna la lista de archivos generados.
   */
  async exportAll(): Promise<Array<{ format: string; file: string; label: string }>> {
    const results: Array<{ format: string; file: string; label: string }> = [];

    for (const [format, info] of Object.entries(ContextExporter.FORMATS)) {
      await this.exportFormat(format);
      results.push({ format, file: info.file, label: info.label });
    }

    // También generar el export universal
    const universalContent = await this.generateUniversalExport();
    await FileUtils.writeFile(path.join(this.ccodePath, 'context-export.md'), universalContent);
    results.push({ format: 'universal', file: '.ccode/context-export.md', label: 'Export Universal' });

    return results;
  }

  /**
   * Verifica qué formatos ya existen en el proyecto.
   */
  async detectExisting(): Promise<string[]> {
    const existing: string[] = [];
    for (const [format, info] of Object.entries(ContextExporter.FORMATS)) {
      if (await FileUtils.exists(path.join(this.projectRoot, info.file))) {
        existing.push(format);
      }
    }
    return existing;
  }
}
