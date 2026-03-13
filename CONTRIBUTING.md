# Contributing to CCODE

Thanks for your interest in contributing to CCODE! Here's how you can help.

## Getting started

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/ccode.git
cd ccode
npm install
npm run build
npm link    # Now you can use "ccode" globally from your local build
```

## Development workflow

```bash
npm run dev        # Watch mode — recompiles on save
npm test           # Run tests
npm run build      # Full build
```

## Making changes

1. Create a branch from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. Make your changes

3. Make sure build and tests pass:
   ```bash
   npm run build && npm test
   ```

4. Commit with a clear message:
   ```bash
   git commit -m "feat: add something useful"
   ```
   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` — new feature
   - `fix:` — bug fix
   - `docs:` — documentation only
   - `chore:` — maintenance (deps, config)

5. Push and open a PR against `main`

## Project structure

```
src/
  cli/          → CLI interface, session, branding
  core/         → Context engine, tasks, prompt builder, exports
  ai/           → AI provider adapters (Adapter pattern)
  utils/        → File system utilities
tests/          → Vitest tests
```

### Key modules

| Module | Purpose |
|--------|---------|
| `core/context.ts` | Persistent project state in `.ccode/` |
| `core/tasks.ts` | Task CRUD, priorities, stats |
| `core/exports.ts` | Universal context sync (AGENTS.md, CLAUDE.md, etc.) |
| `core/prompt-builder.ts` | Meta-prompts for AI context generation |
| `ai/manager.ts` | Provider auto-detection, config, factory |
| `ai/provider.ts` | `IAIProvider` interface |
| `cli/index.ts` | Commands, handlers, session loop |
| `cli/watcher.ts` | File change detection |

## Adding a new AI provider

CCODE uses the Adapter pattern. To add a new provider:

1. Create `src/ai/yourprovider.ts` implementing `IAIProvider`
2. Add it to the switch in `src/ai/manager.ts`
3. Add provider info in `PROVIDER_INFO` in `src/ai/manager.ts`

That's it — zero changes to the rest of the system.

## Adding a new export format

To support a new AI tool's context file:

1. Add the format entry in `ContextExporter.FORMATS` in `src/core/exports.ts`
2. Add a `generateXxx()` method that reads from `.ccode/` sources
3. Add the case to the `exportFormat()` switch
4. Add a test in `tests/exports.test.ts`

## Key principles

- **CCODE generates context, never code**
- Tasks describe WHAT to achieve, not HOW to implement
- Keep it simple — don't over-engineer
- Single source of truth: `.ccode/` files are the source, exports derive from them

## Questions?

Open an issue on [GitHub](https://github.com/iDevelop25/ccode/issues) or reach out on [YouTube @CreativeCode25](https://www.youtube.com/@CreativeCode25).
