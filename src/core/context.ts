import * as path from 'path';
import { FileUtils } from '../utils/files.js';

export interface IProjectContext {
  name: string;
  version: string;
  architecture_file: string;
  rules_file: string;
  tasks_file: string;
}

export type WorkflowStage = 'created' | 'connected' | 'planned' | 'in_progress' | 'idle';

export interface IProjectState {
  current_task_id: string | null;
  workflow_stage: WorkflowStage;
}

/**
 * Motor de Contexto: gestiona el estado persistente del proyecto .ccode/
 */
export class ContextEngine {
  private static readonly CCODE_DIR = '.ccode';
  private context: IProjectContext | null = null;
  private state: IProjectState | null = null;

  get ccodePath(): string {
    return path.join(process.cwd(), ContextEngine.CCODE_DIR);
  }

  async load(): Promise<boolean> {
    if (!(await FileUtils.exists(this.ccodePath))) {
      return false;
    }
    try {
      this.context = await FileUtils.readJson<IProjectContext>(path.join(this.ccodePath, 'context.json'));
      this.state = await FileUtils.readJson<IProjectState>(path.join(this.ccodePath, 'state.json'));
      return true;
    } catch {
      return false;
    }
  }

  getContext(): IProjectContext {
    if (!this.context) throw new Error('Contexto no cargado.');
    return this.context;
  }

  getState(): IProjectState {
    if (!this.state) throw new Error('Estado no cargado.');
    return this.state;
  }

  async updateState(newState: Partial<IProjectState>): Promise<void> {
    if (!this.state) throw new Error('Estado no cargado.');
    this.state = { ...this.state, ...newState };
    await FileUtils.writeJson(path.join(this.ccodePath, 'state.json'), this.state);
  }

  async readContextFile(filename: string): Promise<string> {
    return FileUtils.readFileSafe(path.join(this.ccodePath, filename));
  }
}
