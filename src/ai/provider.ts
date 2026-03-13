/**
 * Interfaz común para proveedores de IA.
 */
export interface IAIProvider {
  generate(prompt: string): Promise<string>;
  getName(): string;
}

export interface IAIConfig {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}
