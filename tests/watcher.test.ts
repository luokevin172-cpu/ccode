import { describe, it, expect, beforeEach } from 'vitest';
import { FileWatcher } from '../src/cli/watcher.js';

describe('FileWatcher', () => {
  let watcher: FileWatcher;

  beforeEach(() => {
    watcher = new FileWatcher();
  });

  it('inicia inactivo', () => {
    expect(watcher.isActive()).toBe(false);
    expect(watcher.pendingCount).toBe(0);
  });

  it('flush retorna array vacío sin cambios', () => {
    const files = watcher.flush();
    expect(files).toEqual([]);
  });

  it('stop no falla si no está activo', () => {
    expect(() => watcher.stop()).not.toThrow();
  });
});
