import axios from 'axios';
import { IAIProvider, IAIConfig } from './provider.js';

/**
 * Adaptador para Groq (inferencia ultra-rápida).
 * Usa formato compatible con OpenAI.
 */
export class GroqAdapter implements IAIProvider {
  private config: Required<Pick<IAIConfig, 'apiKey' | 'model' | 'baseUrl'>>;

  constructor(config: IAIConfig) {
    this.config = {
      apiKey: config.apiKey || '',
      model: config.model || 'llama-3.3-70b-versatile',
      baseUrl: config.baseUrl || 'https://api.groq.com/openai/v1/chat/completions',
    };
  }

  getName(): string {
    return `Groq (${this.config.model})`;
  }

  async generate(prompt: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('API Key de Groq no configurada.');
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
        timeout: 60000,
      }
    );

    return response.data.choices[0].message.content;
  }
}
