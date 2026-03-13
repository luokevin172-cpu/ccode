import * as path from 'path';
import { IAIProvider } from './provider.js';
import { ClaudeAdapter } from './claude.js';
import { OpenAIAdapter } from './openai.js';
import { GeminiAdapter } from './gemini.js';
import { DeepSeekAdapter } from './deepseek.js';
import { GroqAdapter } from './groq.js';
import { OllamaAdapter } from './ollama.js';
import { FileUtils } from '../utils/files.js';

export type ProviderName = 'claude' | 'openai' | 'gemini' | 'deepseek' | 'groq' | 'ollama';

export interface ICCODEConfig {
  provider: ProviderName;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

/**
 * Gestiona la configuración y conexión con proveedores de IA.
 */
export class AIManager {
  private static readonly CONFIG_FILE = '.ccode/config.json';

  static async loadConfig(): Promise<ICCODEConfig | null> {
    const configPath = path.join(process.cwd(), this.CONFIG_FILE);
    if (await FileUtils.exists(configPath)) {
      return await FileUtils.readJson<ICCODEConfig>(configPath);
    }
    return null;
  }

  static async saveConfig(config: ICCODEConfig): Promise<void> {
    const configPath = path.join(process.cwd(), this.CONFIG_FILE);
    await FileUtils.writeJson(configPath, config);
  }

  static getProvider(config: ICCODEConfig): IAIProvider {
    switch (config.provider) {
      case 'claude':
        return new ClaudeAdapter({ apiKey: config.apiKey, model: config.model });
      case 'openai':
        return new OpenAIAdapter({ apiKey: config.apiKey, model: config.model });
      case 'gemini':
        return new GeminiAdapter({ apiKey: config.apiKey, model: config.model });
      case 'deepseek':
        return new DeepSeekAdapter({ apiKey: config.apiKey, model: config.model });
      case 'groq':
        return new GroqAdapter({ apiKey: config.apiKey, model: config.model });
      case 'ollama':
        return new OllamaAdapter({ model: config.model, baseUrl: config.baseUrl });
      default:
        throw new Error(`Proveedor desconocido: ${config.provider}`);
    }
  }

  static async testConnection(config: ICCODEConfig): Promise<boolean> {
    try {
      const provider = this.getProvider(config);
      await provider.generate('Responde únicamente con la palabra "ok".');
      return true;
    } catch {
      return false;
    }
  }
}
