import axios from 'axios';
import { IAIProvider, IAIConfig } from './provider.js';

/**
 * Adaptador para DeepSeek.
 * Usa formato compatible con OpenAI.
 */
export class DeepSeekAdapter implements IAIProvider {
  private apiKey: string;
  private model: string;

  constructor(config: IAIConfig) {
    this.apiKey = config.apiKey || '';
    this.model = config.model || 'deepseek-chat';
  }

  getName(): string {
    return `DeepSeek (${this.model})`;
  }

  async generate(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API Key de DeepSeek no configurada.');
    }

    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: this.model,
        max_tokens: 8096,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 120000,
      }
    );

    const text = response.data?.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('DeepSeek respondio pero sin contenido. Intenta de nuevo.');
    }
    return text;
  }
}
