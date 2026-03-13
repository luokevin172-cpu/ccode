import * as fs from 'fs';
import * as path from 'path';
import { c } from './brand.js';

/**
 * FileWatcher: observa cambios en el proyecto en tiempo real.
 * Acumula cambios entre interacciones del usuario.
 */
export class FileWatcher {
  private changes: Map<string, string> = new Map(); // filename → event type
  private watcher: fs.FSWatcher | null = null;
  private active = false;
  private debounceTimer: NodeJS.Timeout | null = null;
  private onChangeCallback: ((changes: Map<string, string>) => void) | null = null;

  private static readonly IGNORE = [
    'node_modules', '.ccode', '.git', 'dist', '.next', '__pycache__',
    '.venv', '.DS_Store', '.env', 'coverage', '.turbo', '.cache',
  ];

  start(projectDir: string): void {
    if (this.active) return;

    try {
      this.watcher = fs.watch(projectDir, { recursive: true }, (event, filename) => {
        if (!filename) return;

        // Ignorar directorios y archivos del sistema
        const parts = filename.split(path.sep);
        if (parts.some(p => FileWatcher.IGNORE.includes(p) || p.startsWith('.'))) return;

        this.changes.set(filename, event);

        // Debounce: esperar 2s de inactividad antes de notificar
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          if (this.onChangeCallback && this.changes.size > 0) {
            this.onChangeCallback(new Map(this.changes));
          }
        }, 2000);
      });

      this.active = true;
    } catch {
      // fs.watch puede fallar en algunos sistemas — ignorar silenciosamente
    }
  }

  /**
   * Callback que se ejecuta cuando hay cambios (con debounce).
   */
  onChange(callback: (changes: Map<string, string>) => void): void {
    this.onChangeCallback = callback;
  }

  /**
   * Obtiene y limpia los cambios acumulados.
   */
  flush(): string[] {
    const files = [...this.changes.keys()];
    this.changes.clear();
    return files;
  }

  /**
   * Cantidad de cambios pendientes.
   */
  get pendingCount(): number {
    return this.changes.size;
  }

  stop(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.watcher?.close();
    this.watcher = null;
    this.active = false;
    this.changes.clear();
  }

  isActive(): boolean {
    return this.active;
  }
}

/**
 * Muestra un resumen de los cambios detectados.
 */
export function displayChanges(files: string[]): void {
  if (files.length === 0) return;

  console.log('');
  console.log(c.accent(`  ⟳ ${files.length} archivo${files.length > 1 ? 's' : ''} modificado${files.length > 1 ? 's' : ''} detectado${files.length > 1 ? 's' : ''}:`));
  const show = files.slice(0, 8);
  show.forEach(f => console.log(c.dim(`    ${f}`)));
  if (files.length > 8) console.log(c.dim(`    ... y ${files.length - 8} más`));
  console.log('');
}
