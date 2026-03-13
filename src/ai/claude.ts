import axios from 'axios';
import { IAIProvider, IAIConfig } from './provider.js';

/**
 * Adaptador para Claude (Anthropic).
 */
export class ClaudeAdapter implements IAIProvider {
  private apiKey: string;
  private model: string;

  constructor(config: IAIConfig) {
    this.apiKey = config.apiKey || '';
    this.model = config.model || 'claude-sonnet-4-20250514';
  }

  getName(): string {
    return `Claude (${this.model})`;
  }

  async generate(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API Key de Anthropic no configurada.');
    }

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: this.model,
        max_tokens: 8096,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        timeout: 120000,
      }
    );

    const text = response.data?.content?.[0]?.text;
    if (!text) {
      throw new Error('Claude respondio pero sin contenido. Intenta de nuevo.');
    }
    return text;
  }
}
