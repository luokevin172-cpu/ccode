# Technical Competencies

Skills required to develop, maintain, and understand CCODE.

## Core Stack

### Node.js & TypeScript
- **Level:** Intermediate-Advanced
- **Concepts:** Async/Await, ESM (import/export), static typing, generics, interfaces
- **Note:** The project uses `"type": "module"` with `NodeNext` resolution. All main dependencies (chalk v5, inquirer v13, ora v8) are ESM-only.

### Git
- **Level:** Intermediate
- **Concepts:** Branching, conventional commits, `.gitignore`

## CLI Development

### Commander.js
- **Usage:** Command definitions and entry point
- **Note:** Used for individual commands (`init`, `sync`, `doctor`, etc.). The persistent session handles interaction via Inquirer menus.

### Inquirer v13
- **Usage:** Interactive prompts, wizards, contextual menus
- **Note:** v13 renamed `type: 'list'` to `type: 'select'`

### Chalk v5 + Ora v8
- **Usage:** Terminal colors and progress spinners
- **Note:** Both are ESM-only, require `import` (not `require`)

## Architecture & Patterns

### Context Persistence
- **Core concept:** All project state lives in `.ccode/` — JSON and Markdown files, versionable with Git
- **Patterns:** Local-First Software, State Persistence

### Adapter Pattern (AI)
- **Application:** `IAIProvider` as common interface, `ClaudeAdapter` and `GeminiAdapter` as implementations
- **Benefit:** Adding new providers requires zero changes to the rest of the system

### Universal Context Sync
- **Application:** `ContextExporter` reads from `.ccode/` (source of truth) and generates format-specific files for each AI tool
- **Formats:** AGENTS.md, CLAUDE.md, GEMINI.md, .cursorrules, copilot-instructions.md
- **Pattern:** Single source of truth with multiple derived outputs

### Persistent Session (REPL Loop)
- **Concept:** CCODE stays active watching the project, not "run and exit"
- **Components:** FileWatcher (fs.watch), adaptive contextual menu, change debounce

## Prompt Engineering

### Adaptive Meta-prompts
- **Skill:** Design prompts that adapt their output to input complexity
- **Application:** `PromptBuilder` generates lightweight context for simple projects and detailed context for complex ones
- **Technique:** Include adaptation rules in the prompt + strict JSON format

### Defensive Response Parsing
- **Skill:** Extract JSON from unpredictable LLM responses
- **Technique:** Multiple parsing strategies (direct → brace search → regex code blocks)

## Recommended Resources
- "Clean Code" (Robert C. Martin)
- "Node.js Design Patterns" (Mario Casciaro)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Commander.js](https://github.com/tj/commander.js)
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js)
