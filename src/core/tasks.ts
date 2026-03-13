import * as path from 'path';
import { FileUtils } from '../utils/files.js';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface ITask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  module: string;
}

export interface ITasksFile {
  tasks: ITask[];
}

/**
 * Gestor de Tareas: manipula el flujo de trabajo en .ccode/tasks.json
 */
export class TaskEngine {
  private static readonly TASKS_FILE = '.ccode/tasks.json';
  private tasksData: ITasksFile = { tasks: [] };

  async load(): Promise<void> {
    const tasksPath = path.join(process.cwd(), TaskEngine.TASKS_FILE);
    if (await FileUtils.exists(tasksPath)) {
      this.tasksData = await FileUtils.readJson<ITasksFile>(tasksPath);
    }
  }

  async save(): Promise<void> {
    const tasksPath = path.join(process.cwd(), TaskEngine.TASKS_FILE);
    await FileUtils.writeJson(tasksPath, this.tasksData);
  }

  getTasks(): ITask[] {
    return this.tasksData.tasks;
  }

  getTaskById(id: string): ITask | undefined {
    return this.tasksData.tasks.find(t => t.id === id);
  }

  async addTask(task: Omit<ITask, 'id'>): Promise<string> {
    const id = `TASK-${String(this.tasksData.tasks.length + 1).padStart(3, '0')}`;
    this.tasksData.tasks.push({ id, ...task });
    await this.save();
    return id;
  }

  async setTasks(tasks: ITask[]): Promise<void> {
    this.tasksData.tasks = tasks;
    await this.save();
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
    const task = this.tasksData.tasks.find(t => t.id === id);
    if (!task) throw new Error(`Tarea ${id} no encontrada.`);
    task.status = status;
    await this.save();
  }

  getNextTask(): ITask | null {
    const pending = this.tasksData.tasks.filter(t => t.status === 'pending');
    if (pending.length === 0) return null;
    const priorities: Record<TaskPriority, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    return pending.sort((a, b) => priorities[b.priority] - priorities[a.priority])[0];
  }

  getStats() {
    const tasks = this.tasksData.tasks;
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      failed: tasks.filter(t => t.status === 'failed').length,
    };
  }
}
