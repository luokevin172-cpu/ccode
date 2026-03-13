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
  core/         → Context engine, tasks, prompt builder
  ai/           → AI provider adapters (Adapter pattern)
  utils/        → File system utilities
tests/          → Vitest tests
docs/learning/  → QP2C learning modules
```

## Adding a new AI provider

CCODE uses the Adapter pattern. To add a new provider:

1. Create `src/ai/yourprovider.ts` implementing `IAIProvider`
2. Add it to the switch in `src/ai/manager.ts`
3. Add model choices in `promptAIConfig()` in `src/cli/index.ts`

That's it — zero changes to the rest of the system.

## Key principles

- **CCODE generates context, never code**
- Tasks describe WHAT to achieve, not HOW to implement
- Keep it simple — don't over-engineer

## Questions?

Open an issue on GitHub or reach out on [YouTube @CreativeCode25](https://www.youtube.com/@CreativeCode25).
