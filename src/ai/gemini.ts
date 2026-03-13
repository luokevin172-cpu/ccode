import axios from 'axios';
import { IAIProvider, IAIConfig } from './provider.js';

/**
 * Adaptador para Google Gemini.
 */
export class GeminiAdapter implements IAIProvider {
  private apiKey: string;
  private model: string;

  constructor(config: IAIConfig) {
    this.apiKey = config.apiKey || '';
    this.model = config.model || 'gemini-2.5-flash';
  }

  getName(): string {
    return `Gemini (${this.model})`;
  }

  async generate(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API Key de Google AI no configurada.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 8096 },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000,
      }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Gemini respondio pero sin contenido. Intenta de nuevo.');
    }
    return text;
  }
}
