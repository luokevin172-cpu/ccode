import * as path from 'path';
import axios from 'axios';
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

export interface DetectedProvider {
  provider: ProviderName;
  source: string; // e.g. "env:ANTHROPIC_API_KEY", "local:ollama"
  apiKey?: string;
}

// URLs para obtener API keys
export const PROVIDER_KEY_URLS: Record<string, string> = {
  claude: 'https://console.anthropic.com/settings/keys',
  openai: 'https://platform.openai.com/api-keys',
  gemini: 'https://aistudio.google.com/apikey',
  deepseek: 'https://platform.deepseek.com/api_keys',
  groq: 'https://console.groq.com/keys',
};

// Variables de entorno por proveedor
const ENV_KEYS: Record<string, string[]> = {
  claude: ['ANTHROPIC_API_KEY'],
  openai: ['OPENAI_API_KEY'],
  gemini: ['GOOGLE_API_KEY', 'GEMINI_API_KEY'],
  deepseek: ['DEEPSEEK_API_KEY'],
  groq: ['GROQ_API_KEY'],
};

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

  /**
   * Test connection with detailed error reporting.
   */
  static async testConnection(config: ICCODEConfig): Promise<{ ok: boolean; error?: string }> {
    try {
      const provider = this.getProvider(config);
      const result = await provider.generate('Responde unicamente con la palabra "ok".');
      if (!result || result.trim().length === 0) {
        return { ok: false, error: 'La IA respondio pero el contenido esta vacio. Verifica que el modelo exista.' };
      }
      return { ok: true };
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data;
        if (status === 401 || status === 403) {
          return { ok: false, error: `API Key invalida o sin permisos (HTTP ${status}). Verifica tu clave.` };
        }
        if (status === 404) {
          return { ok: false, error: `Modelo no encontrado (HTTP 404). Verifica el nombre del modelo.` };
        }
        if (status === 429) {
          return { ok: false, error: 'Rate limit alcanzado. Espera unos segundos e intenta de nuevo.' };
        }
        if (err.code === 'ECONNREFUSED') {
          if (config.provider === 'ollama') {
            return { ok: false, error: 'No se pudo conectar a Ollama. Asegurate de que este corriendo: ollama serve' };
          }
          return { ok: false, error: 'Conexion rechazada. Verifica tu conexion a internet.' };
        }
        if (err.code === 'ENOTFOUND') {
          return { ok: false, error: 'No se pudo resolver el host. Verifica tu conexion a internet.' };
        }
        if (err.code === 'ETIMEDOUT' || err.message?.includes('timeout')) {
          return { ok: false, error: 'Timeout: la IA no respondio a tiempo. Intenta con un modelo mas rapido.' };
        }
        const msg = typeof data === 'object' && data?.error?.message
          ? data.error.message
          : `Error HTTP ${status || 'desconocido'}`;
        return { ok: false, error: msg };
      }
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Detect available AI providers from environment variables and local services.
   */
  static async detectProviders(): Promise<DetectedProvider[]> {
    const detected: DetectedProvider[] = [];

    // Check environment variables
    for (const [provider, envVars] of Object.entries(ENV_KEYS)) {
      for (const envVar of envVars) {
        const value = process.env[envVar];
        if (value && value.length > 10) {
          detected.push({
            provider: provider as ProviderName,
            source: `env:${envVar}`,
            apiKey: value,
          });
          break; // one match per provider is enough
        }
      }
    }

    // Check Ollama
    try {
      const res = await axios.get('http://localhost:11434/api/tags', { timeout: 3000 });
      if (res.status === 200 && res.data?.models) {
        detected.push({
          provider: 'ollama',
          source: `local:ollama (${res.data.models.length} modelos)`,
        });
      }
    } catch {
      // Ollama not running, skip
    }

    return detected;
  }

  /**
   * List available Ollama models.
   */
  static async listOllamaModels(): Promise<string[]> {
    try {
      const res = await axios.get('http://localhost:11434/api/tags', { timeout: 5000 });
      if (res.data?.models) {
        return res.data.models.map((m: { name: string }) => m.name);
      }
    } catch {
      // ignore
    }
    return [];
  }
}
