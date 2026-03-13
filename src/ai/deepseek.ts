import axios from 'axios';
import { IAIProvider, IAIConfig } from './provider.js';

/**
 * Adaptador para DeepSeek.
 * Usa formato compatible con OpenAI.
 */
export class DeepSeekAdapter implements IAIProvider {
  private config: Required<Pick<IAIConfig, 'apiKey' | 'model' | 'baseUrl'>>;

  constructor(config: IAIConfig) {
    this.config = {
      apiKey: config.apiKey || '',
      model: config.model || 'deepseek-chat',
      baseUrl: config.baseUrl || 'https://api.deepseek.com/v1/chat/completions',
    };
  }

  getName(): string {
    return `DeepSeek (${this.config.model})`;
  }

  async generate(prompt: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('API Key de DeepSeek no configurada.');
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
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 120000,
      }
    );

    return response.data.choices[0].message.content;
  }
}
