import { describe, it, expect } from 'vitest';
import { PromptBuilder } from '../src/core/prompt-builder.js';

describe('PromptBuilder.parseJSON', () => {
  it('parsea JSON directo', () => {
    const input = '{"name": "test", "value": 42}';
    const result = PromptBuilder.parseJSON<{ name: string; value: number }>(input);
    expect(result.name).toBe('test');
    expect(result.value).toBe(42);
  });

  it('extrae JSON envuelto en texto', () => {
    const input = 'Aquí tienes el resultado:\n{"name": "test"}\nEspero que te sirva.';
    const result = PromptBuilder.parseJSON<{ name: string }>(input);
    expect(result.name).toBe('test');
  });

  it('extrae JSON de bloque markdown', () => {
    const input = '```json\n{"tasks": [{"title": "Tarea 1"}]}\n```';
    const result = PromptBuilder.parseJSON<{ tasks: { title: string }[] }>(input);
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0].title).toBe('Tarea 1');
  });

  it('maneja JSON con arrays anidados', () => {
    const input = `{
      "project_name": "Mi App",
      "complexity": "simple",
      "tasks": [
        {"title": "Task 1", "priority": "high"},
        {"title": "Task 2", "priority": "low"}
      ]
    }`;
    const result = PromptBuilder.parseJSON<{ project_name: string; tasks: unknown[] }>(input);
    expect(result.project_name).toBe('Mi App');
    expect(result.tasks).toHaveLength(2);
  });

  it('lanza error con input no-JSON', () => {
    expect(() => PromptBuilder.parseJSON('esto no es json')).toThrow();
  });

  it('genera prompt de contexto con datos del proyecto', () => {
    const prompt = PromptBuilder.getContextGenerationPrompt(
      'TestApp', 'Una app de prueba', 'Login, Dashboard', 'Node.js', 'web'
    );
    expect(prompt).toContain('TestApp');
    expect(prompt).toContain('Login, Dashboard');
    expect(prompt).toContain('Node.js');
    expect(prompt).toContain('simple');
    expect(prompt).toContain('complejo');
  });

  it('genera prompt de verificación con tareas', () => {
    const prompt = PromptBuilder.getVerificationPrompt(
      '# Proyecto', '# Arquitectura',
      [{ id: 'TASK-001', title: 'Test', description: 'Criterio', status: 'pending', priority: 'high', module: 'core' }],
      'src/index.ts\nsrc/app.ts'
    );
    expect(prompt).toContain('TASK-001');
    expect(prompt).toContain('Criterio');
    expect(prompt).toContain('src/index.ts');
  });
});
