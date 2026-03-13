```
   ██████╗ ██████╗  ██████╗ ██████╗ ███████╗
  ██╔════╝██╔════╝ ██╔═══██╗██╔══██╗██╔════╝
  ██║     ██║      ██║   ██║██║  ██║█████╗
  ██║     ██║      ██║   ██║██║  ██║██╔══╝
  ╚██████╗╚██████╗ ╚██████╔╝██████╔╝███████╗
   ╚═════╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝
```

# CCODE

**Persistent context CLI for AI-assisted development.**

Stop re-explaining your project to AI every time the session resets.

```bash
npm install -g @korl3one/ccode
ccode init
```

[![npm version](https://img.shields.io/npm/v/@korl3one/ccode)](https://www.npmjs.com/package/@korl3one/ccode)
[![license](https://img.shields.io/npm/l/@korl3one/ccode)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

---

## The problem

Every time you switch sessions, models, or tools when working with AI, you lose your project context. You end up re-explaining the architecture, previous decisions, and current state over and over again.

## The solution

CCODE stores your project context **inside the repository**. One command generates professional documentation, architecture, rules, and a verifiable task checklist — all adapted to your project's actual complexity.

Any developer or AI can read `.ccode/` and understand the project instantly.

---

## Demo

```
$ ccode init

   ██████╗ ██████╗  ██████╗ ██████╗ ███████╗
  ██╔════╝██╔════╝ ██╔═══██╗██╔══██╗██╔════╝
  ██║     ██║      ██║   ██║██║  ██║█████╗
  ╚██████╗╚██████╗ ╚██████╔╝██████╔╝███████╗
   ╚═════╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝

  ●●●●  Paso 4/4

  ✓ Contexto generado exitosamente

  .ccode/
  ├── project.md        Documentacion del proyecto
  ├── architecture.md   Arquitectura del sistema
  ├── rules.md          Estandares de desarrollo
  ├── tasks.json        Checklist de tareas (8 tareas)
  ├── context.json      Configuracion
  ├── state.json        Estado del workflow
  └── memory.md         Historial de decisiones

  CCODE sigue observando tu proyecto...

  ████████████░░░░░░░░  60%  (3/5)
  > Tarea activa: TASK-002 — Crear formulario de login

  ? Que hacemos?
    > Verificar progreso (se detectaron cambios)
      Marcar tarea como completada
      Iniciar siguiente tarea
      Ver estado completo
      Salir
```

---

## Why CCODE?

| | CCODE | Manual prompts |
|---|:---:|:---:|
| Persistent project context | ✅ | ❌ |
| Architecture adapted to complexity | ✅ | ❌ |
| AI-ready documentation | ✅ | ❌ |
| Verifiable task checklist | ✅ | ❌ |
| Auto-detect file changes | ✅ | ❌ |
| AI-powered task verification | ✅ | ❌ |
| Works with 6 AI providers | ✅ | ❌ |
| Context lives in the repo (Git) | ✅ | ❌ |

---

## How it works

### 1. Initialize

```bash
cd my-project
ccode init
```

A step-by-step wizard asks about your project and an AI generates the full context. CCODE adapts automatically:

- **Simple project** (prototype, few features) → lightweight context, 3-5 tasks
- **Medium project** (standard app) → moderate context, 5-8 tasks
- **Complex project** (multiple modules, integrations) → detailed architecture, 8-12 tasks

### 2. Persistent session

After init, CCODE stays active — watching your project in real time:

- Detects file changes automatically
- Suggests verifying tasks when it sees progress
- Adapts the menu to your current workflow state
- Recovers from errors without crashing

You code in your editor. CCODE runs in another terminal as a companion.

### 3. AI verification

CCODE compares **acceptance criteria** against **actual project files**:

```
✓ TASK-001: Setup project base — COMPLETED
  Evidence: package.json, tsconfig.json found

◐ TASK-002: Create login form — IN PROGRESS
  Missing: password field not found, validation pending

○ TASK-003: Implement JWT auth — PENDING
```

### 4. Context export

```bash
ccode export
```

Generates a single `.md` file with your full project context — ready to paste into any AI chat (ChatGPT, Claude, Gemini, etc.) without connecting an API.

### 5. Project health check

```bash
ccode doctor
```

```
✓ Contexto generado
✓ Proveedor de IA configurado
⚠ 2 tareas sin completar
⚠ architecture.md no refleja 3 archivos nuevos
✓ Conexion con IA activa
```

---

## Supported AI Providers

| Provider | Models | Note |
|----------|--------|------|
| **Claude** (Anthropic) | Sonnet 4, Haiku 3.5, Opus 4 | Recommended |
| **OpenAI** (ChatGPT) | GPT-4o, GPT-4o mini, GPT-4.1, o3-mini | Most popular |
| **Google Gemini** | 2.5 Flash, 2.5 Pro, 2.0 Flash | Free tier available |
| **DeepSeek** | Chat, Reasoner | Budget-friendly |
| **Groq** | Llama 3.3 70B, Llama 3.1 8B, Mixtral 8x7B | Ultra-fast, free tier |
| **Ollama** | Any local model | Offline, no API key |

---

## Available commands

| Command | What it does |
|---------|-------------|
| `ccode init` | Interactive wizard — generates full project context |
| `ccode update` | Re-analyze project and refresh context |
| `ccode export` | Export context as a single `.md` file for any AI |
| `ccode explain` | Quick project summary for onboarding |
| `ccode doctor` | Health check — what's good, what's missing |
| `ccode connect` | Configure AI provider |
| `ccode status` | Dashboard with progress bar and stats |

---

## What gets generated

Everything lives in `.ccode/` inside your repository:

| File | Content |
|------|---------|
| `project.md` | Vision, objectives, scope |
| `architecture.md` | System structure adapted to complexity |
| `rules.md` | Development standards for your stack |
| `tasks.json` | Task checklist with acceptance criteria |
| `state.json` | Active task, workflow stage |
| `memory.md` | Decision history |
| `config.json` | AI provider config |

---

## Architecture

```
src/
  cli/          → Session, branding, file watcher
  core/         → Context engine, tasks, prompt builder
  ai/           → 6 provider adapters (Adapter pattern)
  utils/        → File system abstraction
```

Key patterns: **Adapter** (AI providers), **Observer** (file watcher), **State Machine** (workflow), **Builder** (prompts).

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions and guidelines.

Adding a new AI provider? Just implement `IAIProvider`, add it to the manager switch, done.

---

## Learn more

- [Learning guide](docs/learning/README.md) — 6 modules following QP2C methodology
- [AGENTS.md](AGENTS.md) — Engineering roles
- [SKILLS.md](SKILLS.md) — Technical competencies
- [YouTube @CreativeCode25](https://www.youtube.com/@CreativeCode25) — Tutorials and walkthroughs

---

## Support the project

If CCODE helps you, consider giving it a **star on GitHub** ⭐
It helps the project grow and reach more developers.

[![GitHub stars](https://img.shields.io/github/stars/iDevelop25/ccode?style=social)](https://github.com/iDevelop25/ccode)

---

## License

ISC

---

*CCODE doesn't tell you how to code — it tells you what to build and makes sure you don't lose track.*
