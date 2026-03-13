import axios from 'axios';
import { IAIProvider, IAIConfig } from './provider.js';

/**
 * Adaptador para Claude (Anthropic).
 */
export class ClaudeAdapter implements IAIProvider {
  private config: Required<Pick<IAIConfig, 'apiKey' | 'model' | 'baseUrl'>>;

  constructor(config: IAIConfig) {
    this.config = {
      apiKey: config.apiKey || '',
      model: config.model || 'claude-sonnet-4-20250514',
      baseUrl: config.baseUrl || 'https://api.anthropic.com/v1/messages',
    };
  }

  getName(): string {
    return `Claude (${this.config.model})`;
  }

  async generate(prompt: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('API Key de Anthropic no configurada.');
    }

    const response = await axios.post(
      this.config.baseUrl,
      {
        model: this.config.model,
        max_tokens: 8096,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
      }
    );

    return response.data.content[0].text;
  }
}
