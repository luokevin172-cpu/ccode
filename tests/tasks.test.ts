import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskEngine } from '../src/core/tasks.js';

// Mock FileUtils para no tocar disco
vi.mock('../src/utils/files.js', () => ({
  FileUtils: {
    exists: vi.fn().mockResolvedValue(false),
    readJson: vi.fn().mockResolvedValue({ tasks: [] }),
    writeJson: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('TaskEngine', () => {
  let engine: TaskEngine;

  beforeEach(async () => {
    engine = new TaskEngine();
    await engine.load();
  });

  it('inicia sin tareas', () => {
    expect(engine.getTasks()).toEqual([]);
    expect(engine.getNextTask()).toBeNull();
  });

  it('genera estadísticas vacías', () => {
    const stats = engine.getStats();
    expect(stats.total).toBe(0);
    expect(stats.completed).toBe(0);
    expect(stats.pending).toBe(0);
  });

  it('agrega tarea con ID auto-generado', async () => {
    const id = await engine.addTask({
      title: 'Crear login',
      description: 'Formulario con usuario y contraseña',
      status: 'pending',
      priority: 'high',
      module: 'auth',
    });
    expect(id).toBe('TASK-001');
    expect(engine.getTasks()).toHaveLength(1);
  });

  it('getNextTask retorna la de mayor prioridad', async () => {
    await engine.setTasks([
      { id: 'TASK-001', title: 'Low', description: '', status: 'pending', priority: 'low', module: 'a' },
      { id: 'TASK-002', title: 'Critical', description: '', status: 'pending', priority: 'critical', module: 'b' },
      { id: 'TASK-003', title: 'High', description: '', status: 'pending', priority: 'high', module: 'c' },
    ]);
    const next = engine.getNextTask();
    expect(next?.id).toBe('TASK-002');
  });

  it('getNextTask ignora tareas completadas', async () => {
    await engine.setTasks([
      { id: 'TASK-001', title: 'Done', description: '', status: 'completed', priority: 'critical', module: 'a' },
      { id: 'TASK-002', title: 'Pending', description: '', status: 'pending', priority: 'low', module: 'b' },
    ]);
    const next = engine.getNextTask();
    expect(next?.id).toBe('TASK-002');
  });

  it('getTaskById encuentra tarea existente', async () => {
    await engine.setTasks([
      { id: 'TASK-001', title: 'Test', description: 'desc', status: 'pending', priority: 'high', module: 'core' },
    ]);
    expect(engine.getTaskById('TASK-001')?.title).toBe('Test');
    expect(engine.getTaskById('TASK-999')).toBeUndefined();
  });

  it('updateTaskStatus cambia el estado', async () => {
    await engine.setTasks([
      { id: 'TASK-001', title: 'Test', description: '', status: 'pending', priority: 'high', module: 'core' },
    ]);
    await engine.updateTaskStatus('TASK-001', 'completed');
    expect(engine.getTaskById('TASK-001')?.status).toBe('completed');
  });

  it('updateTaskStatus lanza error si no existe', async () => {
    await expect(engine.updateTaskStatus('TASK-999', 'completed')).rejects.toThrow('no encontrada');
  });

  it('getStats cuenta correctamente', async () => {
    await engine.setTasks([
      { id: 'TASK-001', title: 'A', description: '', status: 'completed', priority: 'high', module: 'a' },
      { id: 'TASK-002', title: 'B', description: '', status: 'completed', priority: 'high', module: 'a' },
      { id: 'TASK-003', title: 'C', description: '', status: 'in_progress', priority: 'medium', module: 'b' },
      { id: 'TASK-004', title: 'D', description: '', status: 'pending', priority: 'low', module: 'c' },
      { id: 'TASK-005', title: 'E', description: '', status: 'failed', priority: 'high', module: 'c' },
    ]);
    const stats = engine.getStats();
    expect(stats.total).toBe(5);
    expect(stats.completed).toBe(2);
    expect(stats.in_progress).toBe(1);
    expect(stats.pending).toBe(1);
    expect(stats.failed).toBe(1);
  });
});
