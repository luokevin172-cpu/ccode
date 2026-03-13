import axios from 'axios';
import { IAIProvider, IAIConfig } from './provider.js';

/**
 * Adaptador para Ollama (local).
 */
export class OllamaAdapter implements IAIProvider {
  private config: Required<Pick<IAIConfig, 'model' | 'baseUrl'>>;

  constructor(config: IAIConfig) {
    this.config = {
      model: config.model || 'llama3',
      baseUrl: config.baseUrl || 'http://localhost:11434/api/generate',
    };
  }

  getName(): string {
    return `Ollama (${this.config.model})`;
  }

  async generate(prompt: string): Promise<string> {
    const response = await axios.post(
      this.config.baseUrl,
      {
        model: this.config.model,
        prompt,
        stream: false,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000,
      }
    );

    return response.data.response;
  }
}
