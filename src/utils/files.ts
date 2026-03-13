import fsExtra from 'fs-extra';
const fs = fsExtra;

/**
 * Capa de abstracción para operaciones de sistema de archivos.
 */
export class FileUtils {

  static async ensureDir(dirPath: string): Promise<void> {
    await fs.ensureDir(dirPath);
  }

  static async writeJson(filePath: string, data: unknown): Promise<void> {
    await fs.writeJson(filePath, data, { spaces: 2 });
  }

  static async writeFile(filePath: string, content: string): Promise<void> {
    await fs.writeFile(filePath, content, 'utf-8');
  }

  static async readFile(filePath: string): Promise<string> {
    return await fs.readFile(filePath, 'utf-8');
  }

  static async readJson<T = unknown>(filePath: string): Promise<T> {
    return await fs.readJson(filePath) as T;
  }

  static async exists(itemPath: string): Promise<boolean> {
    return await fs.pathExists(itemPath);
  }

  static async readFileSafe(filePath: string, fallback = ''): Promise<string> {
    try {
      if (await fs.pathExists(filePath)) {
        return await fs.readFile(filePath, 'utf-8');
      }
    } catch { /* ignore */ }
    return fallback;
  }
}
