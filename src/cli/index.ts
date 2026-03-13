#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';
import * as path from 'path';
import * as fs from 'fs';
import {
  showLogo, showWelcome, showHeader, showStep, showSuccess, showError,
  showWarning, showInfo, showNextStep, showFileTree, showProgressBar, c,
} from './brand.js';
import { FileUtils } from '../utils/files.js';
import { ContextEngine } from '../core/context.js';
import { TaskEngine, ITask } from '../core/tasks.js';
import { PromptBuilder } from '../core/prompt-builder.js';
import { AIManager, ICCODEConfig } from '../ai/manager.js';
import { FileWatcher, displayChanges } from './watcher.js';

// ─── Estado global de sesión ────────────────────────────────────────

const watcher = new FileWatcher();

// ─── Helpers ────────────────────────────────────────────────────────

async function requireInit(): Promise<boolean> {
  const ccodeDir = path.join(process.cwd(), '.ccode');
  if (!(await FileUtils.exists(ccodeDir))) {
    showError('Proyecto no inicializado.');
    showInfo('Ejecuta: ccode init');
    return false;
  }
  return true;
}

async function requireAI(): Promise<ICCODEConfig | null> {
  const config = await AIManager.loadConfig();
  if (!config) {
    showError('Proveedor de IA no configurado.');
    showInfo('Ejecuta: ccode connect');
    return null;
  }
  return config;
}

async function promptAIConfig(): Promise<ICCODEConfig> {
  const { provider } = await inquirer.prompt([{
    type: 'select' as 'list',
    name: 'provider',
    message: 'Proveedor de IA:',
    choices: [
      { name: '  Claude (Anthropic) — Recomendado', value: 'claude' },
      { name: '  OpenAI (ChatGPT)', value: 'openai' },
      { name: '  Google Gemini', value: 'gemini' },
      { name: '  DeepSeek', value: 'deepseek' },
      { name: '  Groq (ultra-rápido)', value: 'groq' },
      { name: '  Ollama (local, sin API key)', value: 'ollama' },
    ],
  }]);

  const config: ICCODEConfig = { provider };

  // Modelos por proveedor
  const modelChoices: Record<string, Array<{ name: string; value: string }>> = {
    claude: [
      { name: 'Claude Sonnet 4 (recomendado)', value: 'claude-sonnet-4-20250514' },
      { name: 'Claude Haiku 3.5 (rápido)', value: 'claude-haiku-4-5-20251001' },
      { name: 'Claude Opus 4 (máxima calidad)', value: 'claude-opus-4-20250514' },
    ],
    openai: [
      { name: 'GPT-4o (recomendado)', value: 'gpt-4o' },
      { name: 'GPT-4o mini (rápido)', value: 'gpt-4o-mini' },
      { name: 'GPT-4.1 (último)', value: 'gpt-4.1' },
      { name: 'o3-mini (razonamiento)', value: 'o3-mini' },
    ],
    gemini: [
      { name: 'Gemini 2.5 Flash (recomendado)', value: 'gemini-2.5-flash' },
      { name: 'Gemini 2.5 Pro (máxima calidad)', value: 'gemini-2.5-pro' },
      { name: 'Gemini 2.0 Flash (rápido)', value: 'gemini-2.0-flash' },
    ],
    deepseek: [
      { name: 'DeepSeek Chat (recomendado)', value: 'deepseek-chat' },
      { name: 'DeepSeek Reasoner', value: 'deepseek-reasoner' },
    ],
    groq: [
      { name: 'Llama 3.3 70B (recomendado)', value: 'llama-3.3-70b-versatile' },
      { name: 'Llama 3.1 8B (rápido)', value: 'llama-3.1-8b-instant' },
      { name: 'Mixtral 8x7B', value: 'mixtral-8x7b-32768' },
    ],
  };

  // API Key (todos excepto Ollama)
  if (provider !== 'ollama') {
    const providerNames: Record<string, string> = {
      claude: 'Anthropic', openai: 'OpenAI', gemini: 'Google AI',
      deepseek: 'DeepSeek', groq: 'Groq',
    };

    const { apiKey } = await inquirer.prompt([{
      type: 'password',
      name: 'apiKey',
      message: `API Key de ${providerNames[provider]}:`,
      mask: '*',
      validate: (v: string) => v.length > 10 || 'Ingresa una API Key válida',
    }]);
    config.apiKey = apiKey;
  }

  // Selección de modelo
  if (provider === 'ollama') {
    const { model } = await inquirer.prompt([{
      type: 'input',
      name: 'model',
      message: 'Modelo de Ollama:',
      default: 'llama3',
    }]);
    config.model = model;
  } else {
    const { model } = await inquirer.prompt([{
      type: 'select' as 'list',
      name: 'model',
      message: 'Modelo:',
      choices: modelChoices[provider],
    }]);
    config.model = model;
  }

  return config;
}

function listProjectFiles(dir: string, prefix = ''): string[] {
  const results: string[] = [];
  const ignore = ['node_modules', '.ccode', '.git', 'dist', '.next', '__pycache__', '.venv'];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (ignore.includes(entry.name) || entry.name.startsWith('.')) continue;
      const fullPath = path.join(prefix, entry.name);
      if (entry.isDirectory()) {
        results.push(`${fullPath}/`);
        results.push(...listProjectFiles(path.join(dir, entry.name), fullPath));
      } else {
        results.push(fullPath);
      }
      if (results.length > 100) break;
    }
  } catch { /* ignore */ }
  return results;
}

// ─── SESIÓN PERSISTENTE ─────────────────────────────────────────────

async function startSession(): Promise<void> {
  // Iniciar watcher
  watcher.start(process.cwd());

  let running = true;

  while (running) {
    // Cargar estado actual
    const taskEngine = new TaskEngine();
    await taskEngine.load();
    const stats = taskEngine.getStats();
    const hasConfig = await AIManager.loadConfig();

    const contextEngine = new ContextEngine();
    const isLoaded = await contextEngine.load();
    const state = isLoaded ? contextEngine.getState() : null;
    const currentTask = state?.current_task_id
      ? taskEngine.getTaskById(state.current_task_id)
      : null;

    // Mostrar cambios detectados
    const changedFiles = watcher.flush();
    if (changedFiles.length > 0) {
      displayChanges(changedFiles);
    }

    // Mostrar estado actual compacto
    if (stats.total > 0) {
      console.log(c.dim(`  ${showProgressBar(stats.completed, stats.total)}`));
    }
    if (currentTask) {
      console.log(c.accent(`  ▶ Tarea activa: ${currentTask.id} — ${currentTask.title}`));
    }
    console.log('');

    // Construir menú contextual
    const choices: Array<{ name: string; value: string }> = [];

    // Si hay cambios recientes y tarea activa → sugerir verificación primero
    if (changedFiles.length > 0 && currentTask) {
      choices.push({ name: c.accent('  🔍  Verificar progreso (se detectaron cambios)'), value: 'verify' });
    }

    if (currentTask) {
      choices.push(
        { name: '  ✅  Marcar tarea como completada', value: 'complete' },
        { name: '  🔍  Verificar progreso con IA', value: 'verify' },
      );
    } else if (stats.pending > 0) {
      choices.push(
        { name: `  ▶   Iniciar siguiente tarea (${stats.pending} pendientes)`, value: 'next' },
      );
    }

    if (!hasConfig) {
      choices.push({ name: '  🔌  Conectar proveedor de IA', value: 'connect' });
    }

    choices.push(
      { name: '  📋  Generar / actualizar plan de tareas', value: 'plan' },
      { name: `  📊  Ver estado completo`, value: 'status' },
      { name: '  📄  Ver contexto generado', value: 'context' },
      { name: '  🔄  Actualizar contexto (re-analizar proyecto)', value: 'update' },
      { name: '  📤  Exportar contexto para otra IA', value: 'export' },
      { name: '  💡  Explicar proyecto (resumen rápido)', value: 'explain' },
      { name: '  🩺  Doctor (diagnóstico de salud)', value: 'doctor' },
    );

    if (hasConfig) {
      choices.push({ name: '  🔌  Reconfigurar IA', value: 'connect' });
    }

    choices.push({ name: '  🚪  Salir', value: 'exit' });

    // Eliminar duplicados por value
    const seen = new Set<string>();
    const uniqueChoices = choices.filter(ch => {
      if (seen.has(ch.value)) return false;
      seen.add(ch.value);
      return true;
    });

    const { action } = await inquirer.prompt([{
      type: 'select' as 'list',
      name: 'action',
      message: '¿Qué hacemos?',
      choices: uniqueChoices,
    }]);

    if (action === 'exit') {
      running = false;
      continue;
    }

    const handlers: Record<string, () => Promise<void>> = {
      init: handleInit,
      connect: handleConnect,
      plan: handlePlan,
      next: handleNext,
      verify: handleVerify,
      complete: handleComplete,
      status: handleStatus,
      context: handleContext,
      update: handleUpdate,
      export: handleExport,
      explain: handleExplain,
      doctor: handleDoctor,
    };

    if (handlers[action]) {
      try {
        await handlers[action]();
      } catch (err) {
        showError(err instanceof Error ? err.message : String(err));
        showInfo('La sesión sigue activa. Puedes intentar otra acción.');
      }
    }

    // Pequeña pausa visual entre acciones
    console.log('');
    console.log(c.dim('  ─────────────────────────────────────────────'));
    console.log(c.dim('  CCODE sigue observando tu proyecto...'));
    console.log('');
  }

  watcher.stop();
  console.log(c.dim('\n  Sesión finalizada. Hasta pronto!\n'));
}

// ─── INIT ───────────────────────────────────────────────────────────

async function handleInit(): Promise<void> {
  showLogo();
  console.log(c.accent('  Asistente de Inicialización de Proyecto'));
  console.log(c.dim('  CCODE genera el contexto de trabajo, no el código.\n'));

  const ccodeDir = path.join(process.cwd(), '.ccode');
  if (await FileUtils.exists(ccodeDir)) {
    showWarning('Este proyecto ya ha sido inicializado.');
    showInfo('Usa "plan" para regenerar el plan de tareas.');
    return;
  }

  // ─ Paso 1
  showStep(1, 4, 'Tu Proyecto');
  console.log(c.dim('  Cuéntanos sobre tu proyecto. CCODE adaptará la'));
  console.log(c.dim('  complejidad del contexto automáticamente.\n'));

  const projectAnswers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Nombre del proyecto:',
      default: path.basename(process.cwd()),
      validate: (v: string) => v.trim().length > 0 || 'Requerido',
    },
    {
      type: 'input',
      name: 'description',
      message: 'Describe tu proyecto (qué es y qué problema resuelve):',
      validate: (v: string) => v.trim().length > 10 || 'Sé más descriptivo',
    },
    {
      type: 'input',
      name: 'features',
      message: 'Funcionalidades principales (separadas por coma):',
      validate: (v: string) => v.trim().length > 0 || 'Indica al menos una',
    },
  ]);

  // ─ Paso 2
  showStep(2, 4, 'Stack Técnico');

  const techAnswers = await inquirer.prompt([
    {
      type: 'input',
      name: 'techStack',
      message: 'Stack tecnológico (ej: React, Node.js, PostgreSQL):',
      validate: (v: string) => v.trim().length > 0 || 'Requerido',
    },
    {
      type: 'select' as 'list',
      name: 'projectType',
      message: 'Tipo de proyecto:',
      choices: ['Web App', 'Mobile App', 'API / Backend', 'CLI', 'Librería / SDK', 'Full Stack', 'Otro'],
    },
  ]);

  // ─ Paso 3
  showStep(3, 4, 'Conexión con IA');
  console.log(c.dim('  Necesitamos IA para generar el contexto.\n'));

  const aiConfig = await promptAIConfig();

  // ─ Paso 4
  showStep(4, 4, 'Generando Contexto');

  const spinner = ora({ text: 'Conectando con IA...', color: 'cyan', spinner: 'dots' }).start();

  try {
    await FileUtils.ensureDir(ccodeDir);
    await AIManager.saveConfig(aiConfig);

    spinner.text = 'Analizando proyecto y generando contexto...';
    const provider = AIManager.getProvider(aiConfig);

    const metaPrompt = PromptBuilder.getContextGenerationPrompt(
      projectAnswers.name, projectAnswers.description,
      projectAnswers.features, techAnswers.techStack, techAnswers.projectType,
    );

    const response = await provider.generate(metaPrompt);

    spinner.text = 'Procesando...';
    const generated = PromptBuilder.parseJSON<{
      project_name?: string; complexity?: string;
      project: string; architecture: string; rules: string;
      tasks: Array<{ title: string; description: string; priority: string; module: string }>;
    }>(response);

    spinner.text = 'Creando estructura...';

    const contextData = {
      name: generated.project_name || projectAnswers.name,
      version: '1.0.0',
      architecture_file: 'architecture.md',
      rules_file: 'rules.md',
      tasks_file: 'tasks.json',
    };
    await FileUtils.writeJson(path.join(ccodeDir, 'context.json'), contextData);
    await FileUtils.writeFile(path.join(ccodeDir, 'project.md'), generated.project);
    await FileUtils.writeFile(path.join(ccodeDir, 'architecture.md'), generated.architecture);
    await FileUtils.writeFile(path.join(ccodeDir, 'rules.md'), generated.rules);

    const tasks: ITask[] = (generated.tasks || []).map((t, i) => ({
      id: `TASK-${String(i + 1).padStart(3, '0')}`,
      title: t.title,
      description: t.description,
      status: 'pending' as const,
      priority: (['high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium') as ITask['priority'],
      module: t.module || 'general',
    }));
    await FileUtils.writeJson(path.join(ccodeDir, 'tasks.json'), { tasks });

    await FileUtils.writeJson(path.join(ccodeDir, 'state.json'), {
      current_task_id: null, workflow_stage: 'planned',
    });

    await FileUtils.writeFile(path.join(ccodeDir, 'memory.md'),
      `# Memoria del Proyecto\n\n## Decisiones\n\n### Inicialización — ${new Date().toISOString().split('T')[0]}\n- Proyecto **${contextData.name}** creado con CCODE\n- Complejidad: ${generated.complexity || 'auto'}\n- Stack: ${techAnswers.techStack}\n- Tipo: ${techAnswers.projectType}\n- ${tasks.length} tareas generadas\n`,
    );

    await FileUtils.writeFile(path.join(ccodeDir, 'onboarding.md'),
      `# Guía de Onboarding\n\nCCODE mantiene el contexto del proyecto en .ccode/\nNo genera código — genera documentación, arquitectura y tareas.\n\n## Flujo\n1. CCODE te muestra la siguiente tarea\n2. Tú desarrollas con tu herramienta favorita\n3. CCODE detecta cambios y verifica progreso\n4. Cuando se cumple una tarea, la marca automáticamente\n`,
    );

    await FileUtils.writeFile(path.join(ccodeDir, 'user-prompt.md'),
      `# Prompt Original\n\n## Descripción\n${projectAnswers.description}\n\n## Funcionalidades\n${projectAnswers.features}\n\n## Stack\n${techAnswers.techStack}\n\n## Tipo\n${techAnswers.projectType}\n`,
    );

    spinner.succeed(c.success('Contexto generado'));

    showHeader('Proyecto Listo', `${contextData.name} — ${generated.complexity || 'auto'}`);
    console.log(c.dim('  Archivos de contexto en .ccode/:\n'));
    showFileTree([
      { name: 'project.md     ', desc: 'Documentación' },
      { name: 'architecture.md', desc: 'Arquitectura' },
      { name: 'rules.md       ', desc: 'Reglas' },
      { name: 'tasks.json     ', desc: `${tasks.length} tareas` },
      { name: 'memory.md      ', desc: 'Historial' },
      { name: 'config.json    ', desc: `IA: ${aiConfig.provider}` },
    ]);
    console.log('');

    showSuccess('CCODE se queda activo observando tu proyecto.');
    showInfo('Abre otra terminal y empieza a desarrollar.');
    showInfo('CCODE detectará los cambios automáticamente.');

  } catch (error: unknown) {
    spinner.fail('Error durante la generación');
    const errMsg = error instanceof Error ? error.message : String(error);
    showError(errMsg);

    showWarning('Creando estructura básica...');
    if (!(await FileUtils.exists(ccodeDir))) await FileUtils.ensureDir(ccodeDir);

    await FileUtils.writeJson(path.join(ccodeDir, 'context.json'), {
      name: projectAnswers.name, version: '1.0.0',
      architecture_file: 'architecture.md', rules_file: 'rules.md', tasks_file: 'tasks.json',
    });
    await FileUtils.writeJson(path.join(ccodeDir, 'tasks.json'), { tasks: [] });
    await FileUtils.writeJson(path.join(ccodeDir, 'state.json'), { current_task_id: null, workflow_stage: 'created' });
    await FileUtils.writeFile(path.join(ccodeDir, 'project.md'), `# ${projectAnswers.name}\n\n${projectAnswers.description}\n`);
    await FileUtils.writeFile(path.join(ccodeDir, 'architecture.md'), `# Arquitectura\n\nStack: ${techAnswers.techStack}\n`);
    await FileUtils.writeFile(path.join(ccodeDir, 'rules.md'), '# Reglas\n\n(Pendiente)\n');
    await FileUtils.writeFile(path.join(ccodeDir, 'memory.md'), '# Memoria\n');
    await FileUtils.writeFile(path.join(ccodeDir, 'onboarding.md'), '# Onboarding\n');

    showSuccess('Estructura básica creada.');
  }

  // ─── NO salir → entrar a sesión persistente ───
  // (se ejecuta después del init, la sesión queda activa)
}

// ─── CONNECT ────────────────────────────────────────────────────────

async function handleConnect(): Promise<void> {
  if (!(await requireInit())) return;

  showHeader('Configuración de IA');

  const existingConfig = await AIManager.loadConfig();
  if (existingConfig) {
    showInfo(`Actual: ${existingConfig.provider} (${existingConfig.model || 'default'})`);
    const { reconfigure } = await inquirer.prompt([{
      type: 'confirm', name: 'reconfigure',
      message: '¿Reconfigurar?', default: false,
    }]);
    if (!reconfigure) return;
  }

  const config = await promptAIConfig();

  const spinner = ora({ text: 'Verificando conexión...', color: 'cyan', spinner: 'dots' }).start();
  const success = await AIManager.testConnection(config);

  if (success) {
    spinner.succeed(c.success('Conexión verificada'));
    await AIManager.saveConfig(config);
    showSuccess('Configuración guardada.');
  } else {
    spinner.fail(c.error('No se pudo conectar'));
    showError('Verifica tu API Key, conexión a internet, o que Ollama esté corriendo.');
  }
}

// ─── PLAN ───────────────────────────────────────────────────────────

async function handlePlan(): Promise<void> {
  if (!(await requireInit())) return;
  const config = await requireAI();
  if (!config) return;

  showHeader('Plan de Tareas');

  const taskEngine = new TaskEngine();
  await taskEngine.load();
  const currentTasks = taskEngine.getTasks();
  const stats = taskEngine.getStats();

  if (currentTasks.length > 0) {
    showInfo(`Tareas: ${stats.completed} completadas, ${stats.pending} pendientes`);
    const { action } = await inquirer.prompt([{
      type: 'select' as 'list', name: 'action',
      message: '¿Qué hacer?',
      choices: [
        { name: '  Regenerar (mantiene completadas)', value: 'regenerate' },
        { name: '  Cancelar', value: 'cancel' },
      ],
    }]);
    if (action === 'cancel') return;
  }

  const { extraContext } = await inquirer.prompt([{
    type: 'input', name: 'extraContext',
    message: 'Requisitos adicionales (Enter para omitir):',
  }]);

  const spinner = ora({ text: 'Generando tareas...', color: 'cyan', spinner: 'dots' }).start();

  try {
    const ccodePath = path.join(process.cwd(), '.ccode');
    const projectMd = await FileUtils.readFileSafe(path.join(ccodePath, 'project.md'));
    const archMd = await FileUtils.readFileSafe(path.join(ccodePath, 'architecture.md'));
    const rulesMd = await FileUtils.readFileSafe(path.join(ccodePath, 'rules.md'));

    const provider = AIManager.getProvider(config);
    const planPrompt = PromptBuilder.getPlanRegenerationPrompt(projectMd, archMd, rulesMd, currentTasks, extraContext);

    const response = await provider.generate(planPrompt);
    const generated = PromptBuilder.parseJSON<{
      tasks: Array<{ title: string; description: string; priority: string; module: string }>;
    }>(response);

    const completedTasks = currentTasks.filter(t => t.status === 'completed');
    const newTasks: ITask[] = generated.tasks.map((t, i) => ({
      id: `TASK-${String(completedTasks.length + i + 1).padStart(3, '0')}`,
      title: t.title, description: t.description,
      status: 'pending' as const,
      priority: (['high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium') as ITask['priority'],
      module: t.module || 'general',
    }));

    await taskEngine.setTasks([...completedTasks, ...newTasks]);
    spinner.succeed(c.success(`${newTasks.length} tareas generadas`));

    newTasks.forEach(task => {
      const pColor = task.priority === 'high' ? c.error : task.priority === 'medium' ? c.warning : c.dim;
      console.log(`  ${c.dim('○')} ${c.bold(task.id)} ${pColor(`[${task.priority.toUpperCase()}]`)} ${task.title}`);
    });
    console.log('');
  } catch (error: unknown) {
    spinner.fail('Error');
    showError(error instanceof Error ? error.message : String(error));
  }
}

// ─── NEXT ───────────────────────────────────────────────────────────

async function handleNext(): Promise<void> {
  if (!(await requireInit())) return;

  const contextEngine = new ContextEngine();
  await contextEngine.load();
  const state = contextEngine.getState();

  const taskEngine = new TaskEngine();
  await taskEngine.load();

  if (state.current_task_id) {
    const current = taskEngine.getTaskById(state.current_task_id);
    if (current && current.status === 'in_progress') {
      showHeader('Tarea en Progreso');
      printTaskDetail(current);
      showInfo('Ve a desarrollar — CCODE detectará los cambios.');
      return;
    }
  }

  const nextTask = taskEngine.getNextTask();
  if (!nextTask) {
    const stats = taskEngine.getStats();
    if (stats.total === 0) {
      showWarning('No hay tareas.');
    } else {
      showSuccess(`Todas completadas (${stats.completed}/${stats.total})`);
    }
    return;
  }

  showHeader('Siguiente Tarea');
  printTaskDetail(nextTask);

  const { startTask } = await inquirer.prompt([{
    type: 'confirm', name: 'startTask',
    message: '¿Iniciar esta tarea?', default: true,
  }]);

  if (startTask) {
    await taskEngine.updateTaskStatus(nextTask.id, 'in_progress');
    await contextEngine.updateState({ current_task_id: nextTask.id, workflow_stage: 'in_progress' });
    showSuccess(`${nextTask.id} en progreso.`);
    showInfo('Abre otra terminal y desarrolla. CCODE vigila los cambios.');
  }
}

function printTaskDetail(task: ITask): void {
  const priorityColors: Record<string, (s: string) => string> = {
    critical: c.error, high: c.warning, medium: c.primary, low: c.dim,
  };
  const pColor = priorityColors[task.priority] || c.white;

  console.log(`  ${c.bold(task.id)}  ${pColor(`[${task.priority.toUpperCase()}]`)}  ${c.dim(task.module)}`);
  console.log('');
  console.log(c.white(`  ${task.title}`));
  console.log('');
  console.log(c.dim('  Criterios de aceptación:'));
  task.description.split('\n').forEach(line => console.log(c.dim(`  ${line}`)));
  console.log('');
}

// ─── VERIFY ─────────────────────────────────────────────────────────

async function handleVerify(): Promise<void> {
  if (!(await requireInit())) return;
  const config = await requireAI();
  if (!config) return;

  showHeader('Verificando Progreso');

  const taskEngine = new TaskEngine();
  await taskEngine.load();
  const tasks = taskEngine.getTasks();
  if (tasks.length === 0) { showWarning('No hay tareas.'); return; }

  const spinner = ora({ text: 'Analizando proyecto...', color: 'cyan', spinner: 'dots' }).start();

  try {
    const ccodePath = path.join(process.cwd(), '.ccode');
    const projectMd = await FileUtils.readFileSafe(path.join(ccodePath, 'project.md'));
    const archMd = await FileUtils.readFileSafe(path.join(ccodePath, 'architecture.md'));
    const projectFiles = listProjectFiles(process.cwd()).join('\n');

    const provider = AIManager.getProvider(config);
    const verifyPrompt = PromptBuilder.getVerificationPrompt(projectMd, archMd, tasks, projectFiles);

    spinner.text = 'La IA verifica las tareas...';
    const response = await provider.generate(verifyPrompt);
    spinner.succeed(c.success('Verificación completada'));

    try {
      const result = PromptBuilder.parseJSON<{
        verification: Array<{ task_id: string; status: string; evidence: string; missing: string | null }>;
        summary: string;
        next_recommended: string;
      }>(response);

      console.log('');
      for (const v of result.verification) {
        const task = taskEngine.getTaskById(v.task_id);
        if (!task) continue;
        const icon = v.status === 'completed' ? c.success('✓')
          : v.status === 'in_progress' ? c.warning('◐')
          : v.status === 'blocked' ? c.error('✗') : c.dim('○');

        console.log(`  ${icon} ${c.bold(v.task_id)} ${task.title}`);
        console.log(c.dim(`    ${v.evidence}`));
        if (v.missing) console.log(c.warning(`    Falta: ${v.missing}`));
        console.log('');
      }

      console.log(c.primary('  ─ Resumen ─'));
      console.log(c.white(`  ${result.summary}`));
      if (result.next_recommended) {
        console.log(c.primary(`\n  → ${result.next_recommended}`));
      }
      console.log('');

      const { updateStates } = await inquirer.prompt([{
        type: 'confirm', name: 'updateStates',
        message: '¿Actualizar estados según la verificación?', default: true,
      }]);

      if (updateStates) {
        const contextEngine = new ContextEngine();
        await contextEngine.load();

        for (const v of result.verification) {
          const task = taskEngine.getTaskById(v.task_id);
          if (!task) continue;
          if (v.status === 'completed' && task.status !== 'completed') {
            await taskEngine.updateTaskStatus(v.task_id, 'completed');

            // Registrar en memoria
            const memoryPath = path.join(process.cwd(), '.ccode/memory.md');
            const entry = `\n### Auto-completada: [${v.task_id}] ${task.title}\n- **Fecha:** ${new Date().toISOString().split('T')[0]}\n- **Verificado por IA:** ${v.evidence}\n`;
            const mem = await FileUtils.readFileSafe(memoryPath, '# Memoria\n');
            await FileUtils.writeFile(memoryPath, mem + entry);

            // Si era la tarea activa, limpiar
            if (contextEngine.getState().current_task_id === v.task_id) {
              await contextEngine.updateState({ current_task_id: null, workflow_stage: 'idle' });
            }

            showSuccess(`${v.task_id} marcada como completada automáticamente.`);
          }
        }
      }
    } catch {
      console.log('');
      response.split('\n').forEach(line => console.log(`  ${line}`));
      console.log('');
    }
  } catch (error: unknown) {
    spinner.fail('Error');
    showError(error instanceof Error ? error.message : String(error));
  }
}

// ─── COMPLETE ───────────────────────────────────────────────────────

async function handleComplete(): Promise<void> {
  if (!(await requireInit())) return;

  const contextEngine = new ContextEngine();
  await contextEngine.load();
  const state = contextEngine.getState();

  const taskEngine = new TaskEngine();
  await taskEngine.load();

  let taskToComplete: ITask | undefined;

  if (state.current_task_id) {
    taskToComplete = taskEngine.getTaskById(state.current_task_id);
  }

  if (!taskToComplete) {
    const inProgress = taskEngine.getTasks().filter(t => t.status === 'in_progress');
    if (inProgress.length === 0) {
      showWarning('No hay tareas activas.');
      return;
    }
    if (inProgress.length === 1) {
      taskToComplete = inProgress[0];
    } else {
      const { selectedId } = await inquirer.prompt([{
        type: 'select' as 'list', name: 'selectedId',
        message: '¿Cuál completar?',
        choices: inProgress.map(t => ({ name: `  ${t.id} — ${t.title}`, value: t.id })),
      }]);
      taskToComplete = taskEngine.getTaskById(selectedId);
    }
  }

  if (!taskToComplete) return;

  showHeader('Completar', `${taskToComplete.id} — ${taskToComplete.title}`);

  console.log(c.dim('  Criterios:'));
  taskToComplete.description.split('\n').forEach(line => console.log(c.dim(`  ${line}`)));
  console.log('');

  const { confirmComplete } = await inquirer.prompt([{
    type: 'confirm', name: 'confirmComplete',
    message: '¿Criterios cumplidos?', default: true,
  }]);

  if (!confirmComplete) {
    showInfo('Usa "verificar" para que la IA revise.');
    return;
  }

  await taskEngine.updateTaskStatus(taskToComplete.id, 'completed');
  await contextEngine.updateState({ current_task_id: null, workflow_stage: 'idle' });

  const memoryPath = path.join(process.cwd(), '.ccode/memory.md');
  const entry = `\n### Completada: [${taskToComplete.id}] ${taskToComplete.title}\n- **Fecha:** ${new Date().toISOString().split('T')[0]}\n`;
  const mem = await FileUtils.readFileSafe(memoryPath, '# Memoria\n');
  await FileUtils.writeFile(memoryPath, mem + entry);

  showSuccess(`${taskToComplete.id} completada.`);
  const stats = taskEngine.getStats();
  console.log(c.primary(`  ${showProgressBar(stats.completed, stats.total)}`));
}

// ─── STATUS ─────────────────────────────────────────────────────────

async function handleStatus(): Promise<void> {
  if (!(await requireInit())) return;

  const contextEngine = new ContextEngine();
  await contextEngine.load();
  const context = contextEngine.getContext();
  const state = contextEngine.getState();

  const taskEngine = new TaskEngine();
  await taskEngine.load();
  const stats = taskEngine.getStats();
  const config = await AIManager.loadConfig();

  showHeader('Estado', `${context.name} v${context.version}`);

  if (config) console.log(c.dim(`  IA: ${config.provider} (${config.model || 'default'})`));
  else console.log(c.warning('  IA: No configurado'));
  console.log('');

  if (stats.total > 0) {
    console.log(c.primary(`  ${showProgressBar(stats.completed, stats.total)}`));
    console.log('');
    console.log(c.success(`  ● Completadas:  ${stats.completed}`));
    if (stats.in_progress > 0) console.log(c.warning(`  ◐ En progreso:  ${stats.in_progress}`));
    console.log(c.white(`  ○ Pendientes:   ${stats.pending}`));
    if (stats.failed > 0) console.log(c.error(`  ✗ Fallidas:     ${stats.failed}`));

    console.log('');
    taskEngine.getTasks().forEach(task => {
      const icon = task.status === 'completed' ? c.success('✓')
        : task.status === 'in_progress' ? c.warning('◐')
        : task.status === 'failed' ? c.error('✗') : c.dim('○');
      const color = task.status === 'completed' ? c.dim : c.white;
      console.log(`  ${icon} ${c.dim(task.id)} ${color(task.title)}`);
    });
  } else {
    console.log(c.dim('  Sin tareas.'));
  }
  console.log('');
}

// ─── CONTEXT ────────────────────────────────────────────────────────

async function handleContext(): Promise<void> {
  if (!(await requireInit())) return;

  showHeader('Contexto del Proyecto');

  const { file } = await inquirer.prompt([{
    type: 'select' as 'list', name: 'file',
    message: '¿Qué ver?',
    choices: [
      { name: '  📄 Documentación (project.md)', value: 'project.md' },
      { name: '  🏗  Arquitectura', value: 'architecture.md' },
      { name: '  📏 Reglas', value: 'rules.md' },
      { name: '  🧠 Memoria', value: 'memory.md' },
      { name: '  📝 Prompt original', value: 'user-prompt.md' },
      { name: '  📋 Contexto completo', value: '__full__' },
    ],
  }]);

  const ccodePath = path.join(process.cwd(), '.ccode');

  if (file === '__full__') {
    const pb = new PromptBuilder();
    const full = await pb.buildContextPrompt();
    console.log('');
    full.split('\n').forEach(line => console.log(`  ${line}`));
  } else {
    const content = await FileUtils.readFileSafe(path.join(ccodePath, file), '(Vacío)');
    console.log('');
    content.split('\n').forEach(line => console.log(`  ${line}`));
  }
  console.log('');
}

// ─── UPDATE ─────────────────────────────────────────────────────────

async function handleUpdate(): Promise<void> {
  if (!(await requireInit())) return;
  const config = await requireAI();
  if (!config) return;

  showHeader('Actualizar Contexto');

  const spinner = ora({ text: 'Analizando proyecto...', color: 'cyan', spinner: 'dots' }).start();

  try {
    const ccodePath = path.join(process.cwd(), '.ccode');
    const contextEngine = new ContextEngine();
    await contextEngine.load();
    const ctx = contextEngine.getContext();

    // Leer archivos del proyecto
    const projectFiles = listProjectFiles(process.cwd());

    // Leer contexto actual
    const currentProject = await FileUtils.readFileSafe(path.join(ccodePath, 'project.md'));
    const currentArch = await FileUtils.readFileSafe(path.join(ccodePath, 'architecture.md'));
    const currentRules = await FileUtils.readFileSafe(path.join(ccodePath, 'rules.md'));

    spinner.text = 'Actualizando con IA...';

    const provider = AIManager.getProvider(config);
    const updatePrompt = `Eres un arquitecto de software. Analiza el estado ACTUAL del proyecto y actualiza la documentación existente.

=== DOCUMENTACIÓN ACTUAL ===
${currentProject}

=== ARQUITECTURA ACTUAL ===
${currentArch}

=== REGLAS ACTUALES ===
${currentRules}

=== ARCHIVOS EN EL PROYECTO ===
${projectFiles.join('\n')}

Actualiza la documentación para reflejar los archivos y estructura actuales del proyecto. Mantén lo que siga siendo válido, actualiza lo que haya cambiado, agrega lo nuevo.

Responde ÚNICAMENTE con JSON válido:
{
  "project": "Contenido actualizado de project.md",
  "architecture": "Contenido actualizado de architecture.md",
  "rules": "Contenido actualizado de rules.md",
  "changes": ["Lista de cambios detectados"]
}`;

    const response = await provider.generate(updatePrompt);
    const result = PromptBuilder.parseJSON<{
      project: string; architecture: string; rules: string; changes: string[];
    }>(response);

    await FileUtils.writeFile(path.join(ccodePath, 'project.md'), result.project);
    await FileUtils.writeFile(path.join(ccodePath, 'architecture.md'), result.architecture);
    await FileUtils.writeFile(path.join(ccodePath, 'rules.md'), result.rules);

    spinner.succeed(c.success('Contexto actualizado'));

    if (result.changes && result.changes.length > 0) {
      console.log('');
      console.log(c.accent('  Cambios detectados:'));
      result.changes.forEach(change => console.log(c.dim(`    • ${change}`)));
    }
    console.log('');
  } catch (error: unknown) {
    spinner.fail('Error');
    showError(error instanceof Error ? error.message : String(error));
  }
}

// ─── EXPORT ─────────────────────────────────────────────────────────

async function handleExport(): Promise<void> {
  if (!(await requireInit())) return;

  showHeader('Exportar Contexto');

  const pb = new PromptBuilder();
  const fullContext = await pb.buildContextPrompt();

  const exportPath = path.join(process.cwd(), '.ccode', 'context-export.md');
  await FileUtils.writeFile(exportPath, `# CCODE — Project Context Export\n\n${fullContext}`);

  showSuccess('Contexto exportado a .ccode/context-export.md');
  showInfo('Copia el contenido y pégalo en cualquier chat de IA (ChatGPT, Claude, Gemini, etc.).');
  console.log('');
}

// ─── EXPLAIN ────────────────────────────────────────────────────────

async function handleExplain(): Promise<void> {
  if (!(await requireInit())) return;

  showHeader('Resumen del Proyecto');

  const ccodePath = path.join(process.cwd(), '.ccode');
  const projectMd = await FileUtils.readFileSafe(path.join(ccodePath, 'project.md'));
  const archMd = await FileUtils.readFileSafe(path.join(ccodePath, 'architecture.md'));

  const taskEngine = new TaskEngine();
  await taskEngine.load();
  const stats = taskEngine.getStats();
  const projectFiles = listProjectFiles(process.cwd());

  // Extraer info clave
  console.log(c.bold('  Proyecto'));
  projectMd.split('\n').slice(0, 8).forEach(line => {
    if (line.trim()) console.log(`  ${line}`);
  });

  console.log('');
  console.log(c.bold('  Arquitectura'));
  archMd.split('\n').slice(0, 12).forEach(line => {
    if (line.trim()) console.log(`  ${line}`);
  });

  console.log('');
  console.log(c.bold('  Archivos detectados'));
  const dirs = projectFiles.filter(f => f.endsWith('/')).slice(0, 10);
  dirs.forEach(d => console.log(c.accent(`    ${d}`)));
  const fileCount = projectFiles.filter(f => !f.endsWith('/')).length;
  console.log(c.dim(`    ${fileCount} archivos en total`));

  console.log('');
  console.log(c.bold('  Progreso'));
  console.log(`  ${showProgressBar(stats.completed, stats.total)}`);
  console.log(c.dim(`    ${stats.completed} completadas, ${stats.in_progress} en progreso, ${stats.pending} pendientes, ${stats.failed} fallidas`));
  console.log('');
}

// ─── DOCTOR ─────────────────────────────────────────────────────────

async function handleDoctor(): Promise<void> {
  if (!(await requireInit())) return;

  showHeader('Diagnóstico del Proyecto');

  const ccodePath = path.join(process.cwd(), '.ccode');
  let issues = 0;

  // 1. Verificar archivos de contexto
  const requiredFiles = [
    { file: 'context.json', label: 'Configuración del proyecto' },
    { file: 'state.json', label: 'Estado del workflow' },
    { file: 'project.md', label: 'Documentación del proyecto' },
    { file: 'architecture.md', label: 'Arquitectura' },
    { file: 'rules.md', label: 'Reglas de desarrollo' },
    { file: 'tasks.json', label: 'Checklist de tareas' },
    { file: 'memory.md', label: 'Historial de decisiones' },
  ];

  console.log(c.bold('  Archivos de contexto'));
  for (const { file, label } of requiredFiles) {
    const exists = await FileUtils.exists(path.join(ccodePath, file));
    if (exists) {
      const content = await FileUtils.readFileSafe(path.join(ccodePath, file));
      if (content.trim().length < 5) {
        console.log(c.warning(`  ⚠ ${label} (${file}) — existe pero está vacío`));
        issues++;
      } else {
        console.log(c.success(`  ✓ ${label}`));
      }
    } else {
      console.log(c.error(`  ✗ ${label} (${file}) — no encontrado`));
      issues++;
    }
  }

  // 2. Proveedor de IA
  console.log('');
  console.log(c.bold('  Proveedor de IA'));
  const config = await AIManager.loadConfig();
  if (config) {
    console.log(c.success(`  ✓ Configurado: ${config.provider} (${config.model || 'default'})`));

    // Test de conexión
    const spinner = ora({ text: '  Probando conexión...', color: 'cyan', spinner: 'dots' }).start();
    const connected = await AIManager.testConnection(config);
    if (connected) {
      spinner.succeed(c.success('Conexión activa'));
    } else {
      spinner.fail(c.error('No se pudo conectar'));
      issues++;
    }
  } else {
    console.log(c.warning(`  ⚠ No configurado — ejecuta "Conectar IA"`));
    issues++;
  }

  // 3. Tareas
  console.log('');
  console.log(c.bold('  Tareas'));
  const taskEngine = new TaskEngine();
  await taskEngine.load();
  const stats = taskEngine.getStats();

  if (stats.total === 0) {
    console.log(c.warning('  ⚠ No hay tareas — ejecuta "Generar plan"'));
    issues++;
  } else {
    console.log(c.success(`  ✓ ${stats.total} tareas en total`));
    if (stats.completed > 0) console.log(c.success(`  ✓ ${stats.completed} completadas`));
    if (stats.in_progress > 0) console.log(c.accent(`  ◐ ${stats.in_progress} en progreso`));
    if (stats.pending > 0) console.log(c.warning(`  ⚠ ${stats.pending} pendientes`));
    if (stats.failed > 0) {
      console.log(c.error(`  ✗ ${stats.failed} fallidas — necesitan replantearse`));
      issues++;
    }
  }

  // 4. Archivos del proyecto
  console.log('');
  console.log(c.bold('  Proyecto'));
  const projectFiles = listProjectFiles(process.cwd());
  const fileCount = projectFiles.filter(f => !f.endsWith('/')).length;
  const dirCount = projectFiles.filter(f => f.endsWith('/')).length;
  console.log(c.success(`  ✓ ${fileCount} archivos en ${dirCount} directorios`));

  // Resumen
  console.log('');
  console.log(c.dim('  ─────────────────────────────────────────────'));
  if (issues === 0) {
    console.log(c.success('  ✓ Todo en orden — el proyecto está saludable'));
  } else {
    console.log(c.warning(`  ⚠ ${issues} problema${issues > 1 ? 's' : ''} encontrado${issues > 1 ? 's' : ''}`));
  }
  console.log('');
}

// ─── CLI Setup ──────────────────────────────────────────────────────

async function main(): Promise<void> {
  const program = new Command();

  program
    .name('ccode')
    .description('CCODE: Contexto Persistente para Desarrollo con IA')
    .version('2.2.0');

  // Comandos individuales (para uso rápido sin sesión)
  program.command('init').description('Inicializa el contexto del proyecto').action(async () => {
    await handleInit();
    // Después de init → entrar en sesión
    await startSession();
  });
  program.command('connect').description('Configura el proveedor de IA').action(handleConnect);
  program.command('plan').description('Genera o regenera tareas').action(handlePlan);
  program.command('next').description('Siguiente tarea').action(handleNext);
  program.command('verify').description('Verifica progreso con IA').action(handleVerify);
  program.command('complete').description('Completa una tarea').action(handleComplete);
  program.command('status').description('Estado del proyecto').action(handleStatus);
  program.command('context').description('Ver contexto generado').action(handleContext);
  program.command('update').description('Re-analiza y actualiza el contexto').action(handleUpdate);
  program.command('export').description('Exporta contexto como .md para cualquier IA').action(handleExport);
  program.command('explain').description('Resumen rápido del proyecto').action(handleExplain);
  program.command('doctor').description('Diagnóstico de salud del proyecto').action(handleDoctor);

  if (process.argv.length <= 2) {
    // Sin argumentos → sesión interactiva
    const isInitialized = await FileUtils.exists(path.join(process.cwd(), '.ccode'));

    if (!isInitialized) {
      showWelcome();
      showInfo('Este directorio no tiene un proyecto CCODE.');
      console.log('');
      const { doInit } = await inquirer.prompt([{
        type: 'confirm', name: 'doInit',
        message: '¿Inicializar proyecto aquí?', default: true,
      }]);
      if (doInit) {
        await handleInit();
        await startSession();
      }
    } else {
      showLogo();
      showSuccess('Proyecto detectado. Iniciando sesión...');
      await startSession();
    }
  } else {
    await program.parseAsync(process.argv);
  }
}

main().catch((error) => {
  watcher.stop();
  showError(`Error: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
