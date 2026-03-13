import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContextExporter } from '../src/core/exports.js';

// Mock FileUtils para no tocar disco
vi.mock('../src/utils/files.js', () => ({
  FileUtils: {
    exists: vi.fn().mockResolvedValue(true),
    readJson: vi.fn().mockImplementation(async (filePath: string) => {
      if (filePath.includes('context.json')) {
        return { name: 'TestProject', version: '1.0.0' };
      }
      if (filePath.includes('tasks.json')) {
        return {
          tasks: [
            { id: 'TASK-001', title: 'Setup base', description: 'Init project', status: 'completed', priority: 'high', module: 'setup' },
            { id: 'TASK-002', title: 'Create login', description: 'Login form', status: 'pending', priority: 'high', module: 'auth' },
            { id: 'TASK-003', title: 'Add tests', description: 'Unit tests', status: 'in_progress', priority: 'medium', module: 'testing' },
          ],
        };
      }
      return {};
    }),
    readFileSafe: vi.fn().mockImplementation(async (filePath: string) => {
      if (filePath.includes('project.md')) return '# TestProject\n\nA test project for validation.';
      if (filePath.includes('architecture.md')) return '## Stack\n\nNode.js + TypeScript';
      if (filePath.includes('rules.md')) return '## Rules\n\n- Use TypeScript\n- Follow ESLint';
      if (filePath.includes('memory.md')) return '## Decisions\n\n- Project created';
      return '';
    }),
    writeFile: vi.fn().mockResolvedValue(undefined),
    writeJson: vi.fn().mockResolvedValue(undefined),
    ensureDir: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('ContextExporter', () => {
  let exporter: ContextExporter;

  beforeEach(() => {
    exporter = new ContextExporter('/tmp/test-project');
  });

  it('tiene 5 formatos registrados', () => {
    const formats = Object.keys(ContextExporter.FORMATS);
    expect(formats).toHaveLength(5);
    expect(formats).toContain('agents');
    expect(formats).toContain('claude');
    expect(formats).toContain('gemini');
    expect(formats).toContain('cursor');
    expect(formats).toContain('copilot');
  });

  it('genera AGENTS.md con proyecto y tareas', async () => {
    const content = await exporter.generateAgentsMd();
    expect(content).toContain('TestProject');
    expect(content).toContain('TASK-001');
    expect(content).toContain('TASK-002');
    expect(content).toContain('[x]'); // completed task
    expect(content).toContain('[ ]'); // pending task
    expect(content).toContain('Node.js + TypeScript');
  });

  it('genera CLAUDE.md con sección de trabajo pendiente', async () => {
    const content = await exporter.generateClaudeMd();
    expect(content).toContain('TestProject');
    expect(content).toContain('Pending Work');
    expect(content).toContain('TASK-002');
    expect(content).toContain('Decision History');
  });

  it('genera GEMINI.md', async () => {
    const content = await exporter.generateGeminiMd();
    expect(content).toContain('TestProject');
    expect(content).toContain('Task Progress');
    expect(content).toContain('1/3');
  });

  it('genera .cursorrules conciso', async () => {
    const content = await exporter.generateCursorRules();
    expect(content).toContain('TestProject');
    expect(content).toContain('Rules');
    expect(content).toContain('Create login'); // pending task title
  });

  it('genera copilot-instructions.md enfocado en reglas', async () => {
    const content = await exporter.generateCopilotInstructions();
    expect(content).toContain('TestProject');
    expect(content).toContain('Coding Guidelines');
    expect(content).toContain('Use TypeScript');
  });

  it('genera export universal con todos los campos', async () => {
    const content = await exporter.generateUniversalExport();
    expect(content).toContain('CCODE');
    expect(content).toContain('Project');
    expect(content).toContain('Architecture');
    expect(content).toContain('Development Rules');
    expect(content).toContain('Task Progress');
    expect(content).toContain('Decision History');
  });

  it('formatea tareas completadas con checkbox marcado', async () => {
    const content = await exporter.generateAgentsMd();
    expect(content).toContain('[x] **TASK-001**');
    expect(content).toContain('[ ] **TASK-002**');
  });

  it('FORMATS tiene rutas correctas', () => {
    expect(ContextExporter.FORMATS.agents.file).toBe('AGENTS.md');
    expect(ContextExporter.FORMATS.claude.file).toBe('CLAUDE.md');
    expect(ContextExporter.FORMATS.gemini.file).toBe('GEMINI.md');
    expect(ContextExporter.FORMATS.cursor.file).toBe('.cursorrules');
    expect(ContextExporter.FORMATS.copilot.file).toBe('.github/copilot-instructions.md');
  });
});
