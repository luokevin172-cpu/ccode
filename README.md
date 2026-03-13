<div align="center">

<img src="assets/logo.png" alt="CCODE" width="600"/>

<br/>
<br/>

**Persistent context CLI for AI-assisted development.**

Stop re-explaining your project to AI every time the session resets.

<br/>

```bash
npm install -g @korl3one/ccode
```

<br/>

[![npm version](https://img.shields.io/npm/v/@korl3one/ccode?color=00B4D8&style=for-the-badge)](https://www.npmjs.com/package/@korl3one/ccode)
[![license](https://img.shields.io/npm/l/@korl3one/ccode?color=0077B6&style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-2DC653?style=for-the-badge)](https://nodejs.org)
[![GitHub stars](https://img.shields.io/github/stars/iDevelop25/ccode?style=for-the-badge&color=FFB703)](https://github.com/iDevelop25/ccode)

</div>

---

## The problem

Every time you switch sessions, models, or tools when working with AI, **you lose your project context**. You end up re-explaining the architecture, previous decisions, and current state over and over again.

And if you use multiple AI tools — Claude Code, Cursor, Gemini CLI, Copilot — you have to configure context files for each one manually.

## The solution

CCODE generates and maintains your project context **inside the repository**. One command produces professional documentation, architecture, rules, and a verifiable task checklist — all adapted to your project's actual complexity.

Then it **syncs that context to every major AI tool** automatically.

Any developer or AI can read your project and understand it instantly.

---

## Universal Context Sync

This is what makes CCODE different. One command generates context files for **every major AI tool**:

```bash
ccode sync
```

```
project/
├── AGENTS.md                        ← Open Standard (60K+ repos)
├── CLAUDE.md                        ← Claude Code
├── GEMINI.md                        ← Gemini CLI
├── .cursorrules                     ← Cursor
├── .github/copilot-instructions.md  ← GitHub Copilot
└── .ccode/context-export.md         ← Universal (copy/paste to any AI chat)
```

Each file is adapted to the tool's expected format. Your project context — architecture, rules, tasks, decisions — synced everywhere, from a single source of truth.

No manual setup per tool. No copy-pasting between files. Context stays in sync automatically with `ccode init`, `ccode update`, and `ccode sync`.

---

## Why CCODE?

<div align="center">

| | CCODE | Manual prompts |
|---|:---:|:---:|
| Persistent project context | ✅ | ❌ |
| Universal context sync (5+ AI tools) | ✅ | ❌ |
| Architecture adapted to complexity | ✅ | ❌ |
| AI-ready documentation | ✅ | ❌ |
| Verifiable task checklist | ✅ | ❌ |
| Auto-detect file changes | ✅ | ❌ |
| AI-powered task verification | ✅ | ❌ |
| Zero-config AI provider detection | ✅ | ❌ |
| Context lives in the repo (Git) | ✅ | ❌ |

</div>

---

## How it works

### 1. Initialize

```bash
cd my-project
ccode init
```

A step-by-step wizard asks about your project and an AI generates the full context. CCODE **adapts automatically**:

| Project type | Context depth | Tasks |
|---|---|---|
| Simple (prototype, few features) | Lightweight docs | 3-5 |
| Medium (standard app) | Moderate architecture | 5-8 |
| Complex (multiple modules) | Detailed patterns + diagrams | 8-12 |

A simple login doesn't need microservice diagrams. CCODE is smart about it.

After generation, context is automatically synced to all AI tools.

### 2. Persistent session

After init, CCODE **stays active** — watching your project in real time:

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

It doesn't guess — it verifies.

### 4. Context sync

```bash
ccode sync
```

Regenerates context files for every AI tool. Run it after making significant changes, or let `ccode update` handle it when you re-analyze the project.

### 5. Context export

```bash
ccode export
```

Three options: sync to all tools, export a universal `.md` for copy/paste into any AI chat, or pick specific tools.

### 6. Project health check

```bash
ccode doctor
```

Like a linter, but for your project context. Checks context files, AI connection, task status, export state, and tells you what needs attention.

---

## Supported AI Providers

<div align="center">

| Provider | Models | Note |
|----------|--------|------|
| **Google Gemini** | 2.5 Flash, 2.5 Pro, 2.0 Flash | Free — just a Google account |
| **Claude** (Anthropic) | Sonnet 4, Haiku 3.5, Opus 4 | Best quality |

</div>

CCODE auto-detects your provider:

1. **Gemini CLI OAuth** — If you have `gemini` CLI installed and authenticated, it works instantly. Zero config.
2. **Environment variables** — `GOOGLE_API_KEY` or `ANTHROPIC_API_KEY` detected automatically.
3. **Manual setup** — Guided wizard with browser-based key generation as fallback.

---

## Available commands

| Command | What it does |
|---------|-------------|
| `ccode init` | Interactive wizard — generates full project context + syncs to all AI tools |
| `ccode sync` | Sync context to all AI tools (AGENTS.md, CLAUDE.md, .cursorrules, ...) |
| `ccode update` | Re-analyze project with AI and refresh context |
| `ccode export` | Export context — all tools, universal .md, or pick specific |
| `ccode verify` | AI-powered task verification against actual project files |
| `ccode status` | Dashboard with progress bar and stats |
| `ccode doctor` | Health check — context files, AI connection, exports, tasks |
| `ccode connect` | Configure or reconfigure AI provider |
| `ccode explain` | Quick project summary for onboarding |
| `ccode plan` | Generate or regenerate task checklist |
| `ccode next` | Show and start the next pending task |
| `ccode complete` | Mark active task as completed |

---

## What gets generated

### Source of truth (`.ccode/`)

```
.ccode/
├── project.md          Vision, objectives, scope
├── architecture.md     System structure (adapted to complexity)
├── rules.md            Development standards for your stack
├── tasks.json          Task checklist with acceptance criteria
├── state.json          Active task, workflow stage
├── context.json        Project configuration
├── memory.md           Decision history
├── config.json         AI provider config
└── context-export.md   Universal export
```

### Synced context files (project root)

```
AGENTS.md                        Open Standard
CLAUDE.md                        Claude Code
GEMINI.md                        Gemini CLI
.cursorrules                     Cursor
.github/copilot-instructions.md  GitHub Copilot
```

All derived from `.ccode/`. One source, multiple outputs.

---

## Architecture

```
src/
├── cli/           Session, branding, file watcher
├── core/          Context engine, tasks, prompt builder, exports
├── ai/            Provider adapters (Adapter pattern)
└── utils/         File system abstraction
```

**Patterns:** Adapter (AI providers) · Observer (file watcher) · State Machine (workflow) · Builder (prompts)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions.

Adding a new AI provider? Implement `IAIProvider`, add it to the manager, done.

Adding a new export format? Add a method to `ContextExporter`, register the format, done.

Zero changes to the rest of the system in both cases.

---

## Learn more

| Resource | Link |
|----------|------|
| Engineering roles | [AGENTS.md](AGENTS.md) |
| Technical competencies | [SKILLS.md](SKILLS.md) |
| YouTube | [@CreativeCode25](https://www.youtube.com/@CreativeCode25) |

---

<div align="center">

### If CCODE helps you, consider giving it a star

It helps the project grow and reach more developers.

<br/>

[![Star on GitHub](https://img.shields.io/github/stars/iDevelop25/ccode?style=for-the-badge&color=FFB703&label=Star%20on%20GitHub)](https://github.com/iDevelop25/ccode)

<br/>

**[npm](https://www.npmjs.com/package/@korl3one/ccode)** · **[GitHub](https://github.com/iDevelop25/ccode)** · **[YouTube](https://www.youtube.com/@CreativeCode25)**

<br/>

*CCODE doesn't tell you how to code — it tells you what to build and makes sure you don't lose track.*

</div>
