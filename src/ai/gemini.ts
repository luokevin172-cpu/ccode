import axios from 'axios';
import { IAIProvider, IAIConfig } from './provider.js';

/**
 * Adaptador para Google Gemini.
 */
export class GeminiAdapter implements IAIProvider {
  private config: Required<Pick<IAIConfig, 'apiKey' | 'model' | 'baseUrl'>>;

  constructor(config: IAIConfig) {
    this.config = {
      apiKey: config.apiKey || '',
      model: config.model || 'gemini-2.5-flash',
      baseUrl: config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta/models',
    };
  }

  getName(): string {
    return `Gemini (${this.config.model})`;
  }

  async generate(prompt: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('API Key de Google AI no configurada.');
    }

    const url = `${this.config.baseUrl}/${this.config.model}:generateContent?key=${this.config.apiKey}`;

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

    return response.data.candidates[0].content.parts[0].text;
  }
}
