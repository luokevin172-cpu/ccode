import axios from 'axios';
import { IAIProvider, IAIConfig } from './provider.js';

/**
 * Adaptador para Ollama (local).
 */
export class OllamaAdapter implements IAIProvider {
  private model: string;
  private baseUrl: string;

  constructor(config: IAIConfig) {
    this.model = config.model || 'llama3';
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
  }

  getName(): string {
    return `Ollama (${this.model})`;
  }

  async generate(prompt: string): Promise<string> {
    const response = await axios.post(
      `${this.baseUrl}/api/generate`,
      {
        model: this.model,
        prompt,
        stream: false,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 300000, // 5 min for local models (can be slow)
      }
    );

    const text = response.data?.response;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error(
        `Ollama respondio pero sin contenido. Verifica que el modelo "${this.model}" este descargado.\n` +
        `  Ejecuta: ollama pull ${this.model}`
      );
    }

    return text;
  }
}
