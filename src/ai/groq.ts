import axios from 'axios';
import { IAIProvider, IAIConfig } from './provider.js';

/**
 * Adaptador para Groq (inferencia ultra-rapida).
 * Usa formato compatible con OpenAI.
 */
export class GroqAdapter implements IAIProvider {
  private apiKey: string;
  private model: string;

  constructor(config: IAIConfig) {
    this.apiKey = config.apiKey || '';
    this.model = config.model || 'llama-3.3-70b-versatile';
  }

  getName(): string {
    return `Groq (${this.model})`;
  }

  async generate(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API Key de Groq no configurada.');
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
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
      throw new Error('Groq respondio pero sin contenido. Intenta de nuevo.');
    }
    return text;
  }
}
