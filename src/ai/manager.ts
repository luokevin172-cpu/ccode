import * as path from 'path';
import axios from 'axios';
import { IAIProvider } from './provider.js';
import { ClaudeAdapter } from './claude.js';
import { GeminiAdapter } from './gemini.js';
import { FileUtils } from '../utils/files.js';

export type ProviderName = 'claude' | 'gemini';

export interface ICCODEConfig {
  provider: ProviderName;
  apiKey?: string;
  model?: string;
  authType?: 'api-key' | 'oauth'; // for Gemini CLI OAuth
}

export const PROVIDER_INFO: Record<ProviderName, {
  name: string;
  keyUrl: string;
  envVars: string[];
  models: Array<{ name: string; value: string }>;
}> = {
  gemini: {
    name: 'Google Gemini',
    keyUrl: 'https://aistudio.google.com/apikey',
    envVars: ['GOOGLE_API_KEY', 'GEMINI_API_KEY'],
    models: [
      { name: 'Gemini 2.5 Flash (recomendado, gratis)', value: 'gemini-2.5-flash' },
      { name: 'Gemini 2.5 Pro (maxima calidad)', value: 'gemini-2.5-pro' },
      { name: 'Gemini 2.0 Flash (rapido)', value: 'gemini-2.0-flash' },
    ],
  },
  claude: {
    name: 'Claude (Anthropic)',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    envVars: ['ANTHROPIC_API_KEY'],
    models: [
      { name: 'Claude Sonnet 4 (recomendado)', value: 'claude-sonnet-4-20250514' },
      { name: 'Claude Haiku 3.5 (rapido)', value: 'claude-haiku-4-5-20251001' },
      { name: 'Claude Opus 4 (maxima calidad)', value: 'claude-opus-4-20250514' },
    ],
  },
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
      case 'gemini': {
        const adapter = new GeminiAdapter({ apiKey: config.apiKey, model: config.model });
        // If using OAuth from Gemini CLI
        if (config.authType === 'oauth') {
          const token = GeminiAdapter.readOAuthToken();
          if (token) adapter.setOAuthToken(token);
        }
        return adapter;
      }
      case 'claude':
        return new ClaudeAdapter({ apiKey: config.apiKey, model: config.model });
      default:
        throw new Error(`Proveedor desconocido: ${config.provider}`);
    }
  }

  static async testConnection(config: ICCODEConfig): Promise<{ ok: boolean; error?: string }> {
    try {
      const provider = this.getProvider(config);
      const result = await provider.generate('Responde unicamente con la palabra "ok".');
      if (!result || result.trim().length === 0) {
        return { ok: false, error: 'La IA respondio pero el contenido esta vacio.' };
      }
      return { ok: true };
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data;
        if (status === 401 || status === 403) {
          return { ok: false, error: `Credenciales invalidas (HTTP ${status}). Verifica tu autenticacion.` };
        }
        if (status === 404) {
          return { ok: false, error: 'Modelo no encontrado. Verifica el nombre del modelo.' };
        }
        if (status === 429) {
          return { ok: false, error: 'Rate limit. Espera unos segundos e intenta de nuevo.' };
        }
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
          return { ok: false, error: 'Sin conexion a internet.' };
        }
        if (err.code === 'ETIMEDOUT' || err.message?.includes('timeout')) {
          return { ok: false, error: 'Timeout: la IA no respondio a tiempo.' };
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
   * Auto-detect the best available provider.
   * Priority: 1) Gemini CLI OAuth, 2) env vars, 3) null
   */
  static autoDetect(): { provider: ProviderName; authType: 'oauth' | 'api-key'; apiKey?: string; source: string } | null {
    // 1. Gemini CLI installed and authenticated
    if (GeminiAdapter.isAvailable()) {
      return { provider: 'gemini', authType: 'oauth', source: 'Gemini CLI' };
    }

    // 2. Environment variables
    for (const [provider, info] of Object.entries(PROVIDER_INFO)) {
      for (const envVar of info.envVars) {
        const value = process.env[envVar];
        if (value && value.length > 10) {
          return { provider: provider as ProviderName, authType: 'api-key', apiKey: value, source: envVar };
        }
      }
    }

    return null;
  }
}
