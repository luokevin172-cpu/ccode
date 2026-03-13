import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { IAIProvider, IAIConfig } from './provider.js';

/**
 * Adaptador para Google Gemini.
 * Soporta API Key y OAuth token (de Gemini CLI).
 */
export class GeminiAdapter implements IAIProvider {
  private apiKey: string;
  private oauthToken: string;
  private model: string;

  constructor(config: IAIConfig) {
    this.apiKey = config.apiKey || '';
    this.oauthToken = '';
    this.model = config.model || 'gemini-2.5-flash';
  }

  getName(): string {
    return `Gemini (${this.model})`;
  }

  /**
   * Try to read OAuth token from Gemini CLI installation.
   */
  static readOAuthToken(): string | null {
    try {
      const credsPath = path.join(os.homedir(), '.gemini', 'oauth_creds.json');
      if (!fs.existsSync(credsPath)) return null;

      const creds = JSON.parse(fs.readFileSync(credsPath, 'utf-8'));
      if (creds.access_token && typeof creds.access_token === 'string') {
        return creds.access_token;
      }
    } catch {
      // ignore
    }
    return null;
  }

  /**
   * Check if Gemini CLI is installed and authenticated.
   */
  static isAvailable(): boolean {
    return GeminiAdapter.readOAuthToken() !== null;
  }

  setOAuthToken(token: string): void {
    this.oauthToken = token;
  }

  async generate(prompt: string): Promise<string> {
    const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;

    let url: string;
    let headers: Record<string, string>;

    if (this.oauthToken) {
      // Use OAuth token from Gemini CLI
      url = baseUrl;
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.oauthToken}`,
      };
    } else if (this.apiKey) {
      // Use API key
      url = `${baseUrl}?key=${this.apiKey}`;
      headers = { 'Content-Type': 'application/json' };
    } else {
      throw new Error('No hay credenciales de Gemini configuradas.');
    }

    const response = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 8096 },
      },
      { headers, timeout: 120000 }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Gemini respondio pero sin contenido. Intenta de nuevo.');
    }
    return text;
  }
}
