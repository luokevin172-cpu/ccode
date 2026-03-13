import chalk from 'chalk';

// ─── Paleta de colores CCODE ────────────────────────────────────────
export const c = {
  primary:   chalk.hex('#00B4D8'),
  secondary: chalk.hex('#0077B6'),
  accent:    chalk.hex('#90E0EF'),
  success:   chalk.hex('#2DC653'),
  warning:   chalk.hex('#FFB703'),
  error:     chalk.hex('#E63946'),
  dim:       chalk.dim,
  bold:      chalk.bold,
  white:     chalk.white,
  muted:     chalk.gray,
};

// ─── Logo ASCII con gradiente ───────────────────────────────────────
const LOGO_LINES = [
  '   ██████╗ ██████╗  ██████╗ ██████╗ ███████╗',
  '  ██╔════╝██╔════╝ ██╔═══██╗██╔══██╗██╔════╝',
  '  ██║     ██║      ██║   ██║██║  ██║█████╗  ',
  '  ██║     ██║      ██║   ██║██║  ██║██╔══╝  ',
  '  ╚██████╗╚██████╗ ╚██████╔╝██████╔╝███████╗',
  '   ╚═════╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝',
];

const GRADIENT = ['#90E0EF', '#48CAE4', '#00B4D8', '#0096C7', '#0077B6', '#023E8A'];

export function showLogo(): void {
  console.log('');
  LOGO_LINES.forEach((line, i) => {
    console.log(chalk.hex(GRADIENT[i])(line));
  });
  console.log(c.dim('  Context-Persistent AI Development  v2.0'));
  console.log('');
}

// ─── Componentes UI ─────────────────────────────────────────────────

export function showHeader(title: string, subtitle?: string): void {
  console.log('');
  console.log(c.primary('  ┌─ ') + c.bold(title));
  if (subtitle) console.log(c.primary('  │  ') + c.dim(subtitle));
  console.log(c.primary('  └' + '─'.repeat(45)));
  console.log('');
}

export function showStep(current: number, total: number, message: string): void {
  const filled = '●'.repeat(current);
  const empty = '○'.repeat(total - current);
  console.log('');
  console.log(c.primary(`  ${filled}${c.dim(empty)}  Paso ${current}/${total}`));
  console.log(c.bold(`  ${message}`));
  console.log('');
}

export function showSuccess(message: string): void {
  console.log(c.success(`\n  ✓ ${message}\n`));
}

export function showError(message: string): void {
  console.log(c.error(`\n  ✗ ${message}\n`));
}

export function showWarning(message: string): void {
  console.log(c.warning(`\n  ⚠ ${message}\n`));
}

export function showInfo(message: string): void {
  console.log(c.primary(`  ℹ ${message}`));
}

export function showNextStep(command: string, description: string): void {
  console.log(c.dim('  ─────────────────────────────────────────────'));
  console.log(c.dim('  → Siguiente paso: ') + c.white(command) + c.dim(` - ${description}`));
  console.log('');
}

export function showDivider(): void {
  console.log(c.dim('  ─────────────────────────────────────────────'));
}

export function showFileTree(files: Array<{ name: string; desc: string }>, indent = '  '): void {
  files.forEach((f, i) => {
    const connector = i === files.length - 1 ? '└──' : '├──';
    console.log(c.white(`${indent}${connector} ${f.name}`) + c.dim(`  ${f.desc}`));
  });
}

export function showProgressBar(completed: number, total: number): string {
  if (total === 0) return '░'.repeat(20) + '  0%';
  const pct = Math.round((completed / total) * 100);
  const barWidth = 20;
  const filled = Math.round((completed / total) * barWidth);
  const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
  return `${bar}  ${pct}%  (${completed}/${total})`;
}

export function showWelcome(): void {
  showLogo();
  console.log(c.accent('  Bienvenido a CCODE'));
  console.log(c.dim('  Tu asistente de desarrollo con contexto persistente.'));
  console.log(c.dim('  El contexto vive en el proyecto, no en la conversación.\n'));
}
