import axios from 'axios';
import { IAIProvider, IAIConfig } from './provider.js';

/**
 * Adaptador para OpenAI (ChatGPT).
 */
export class OpenAIAdapter implements IAIProvider {
  private apiKey: string;
  private model: string;

  constructor(config: IAIConfig) {
    this.apiKey = config.apiKey || '';
    this.model = config.model || 'gpt-4o';
  }

  getName(): string {
    return `OpenAI (${this.model})`;
  }

  async generate(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API Key de OpenAI no configurada.');
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
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
      throw new Error('OpenAI respondio pero sin contenido. Intenta de nuevo.');
    }
    return text;
  }
}
