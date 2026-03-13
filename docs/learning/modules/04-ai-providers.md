# Módulo 04: Proveedores de IA

## 1. QUÉ (Concepto)

CCODE no está atado a un proveedor de IA específico. Usa el **patrón Adapter** para abstraer la comunicación con cualquier LLM detrás de una interfaz común. Soporta 6 proveedores:

| Proveedor | Archivo | API |
|-----------|---------|-----|
| Claude (Anthropic) | `claude.ts` | REST propia de Anthropic |
| OpenAI (ChatGPT) | `openai.ts` | OpenAI Chat Completions |
| Google Gemini | `gemini.ts` | Google Generative AI |
| DeepSeek | `deepseek.ts` | Compatible con OpenAI |
| Groq | `groq.ts` | Compatible con OpenAI |
| Ollama | `ollama.ts` | API local de Ollama |

## 2. CÓMO (Implementación)

### Interfaz común (`src/ai/provider.ts`)

```typescript
interface IAIProvider {
  generate(prompt: string): Promise<string>;
  getName(): string;
}

interface IAIConfig {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}
```

Todos los proveedores implementan `IAIProvider`. El resto del sistema solo conoce esta interfaz — nunca sabe qué proveedor está detrás.

### Adaptadores

#### ClaudeAdapter (`src/ai/claude.ts`)
- API REST de Anthropic (`/v1/messages`)
- Modelo por defecto: `claude-sonnet-4-20250514`
- Autenticación vía header `x-api-key`
- `max_tokens`: 8096

#### OpenAIAdapter (`src/ai/openai.ts`)
- API de Chat Completions (`/v1/chat/completions`)
- Modelo por defecto: `gpt-4o`
- Autenticación vía `Authorization: Bearer`
- Modelos disponibles: GPT-4o, GPT-4o mini, GPT-4.1, o3-mini

#### GeminiAdapter (`src/ai/gemini.ts`)
- API de Google Generative AI (`generativelanguage.googleapis.com`)
- Modelo por defecto: `gemini-2.5-flash`
- API Key como parámetro en la URL
- Modelos disponibles: 2.5 Flash, 2.5 Pro, 2.0 Flash

#### DeepSeekAdapter (`src/ai/deepseek.ts`)
- API compatible con OpenAI (`api.deepseek.com/v1/chat/completions`)
- Modelo por defecto: `deepseek-chat`
- Modelos disponibles: Chat, Reasoner

#### GroqAdapter (`src/ai/groq.ts`)
- API compatible con OpenAI (`api.groq.com/openai/v1/chat/completions`)
- Modelo por defecto: `llama-3.3-70b-versatile`
- Timeout: 60 segundos (Groq es ultra-rápido)
- Modelos disponibles: Llama 3.3 70B, Llama 3.1 8B, Mixtral 8x7B

#### OllamaAdapter (`src/ai/ollama.ts`)
- API local de Ollama (`localhost:11434/api/generate`)
- Modelo por defecto: `llama3`
- Timeout: 120 segundos (modelos locales son más lentos)
- No requiere API key

### AIManager (`src/ai/manager.ts`)

Factory que coordina la configuración y creación de proveedores:

```typescript
type ProviderName = 'claude' | 'openai' | 'gemini' | 'deepseek' | 'groq' | 'ollama';

interface ICCODEConfig {
  provider: ProviderName;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}
```

Métodos:
- `loadConfig()`: Lee `.ccode/config.json`
- `saveConfig()`: Persiste la configuración
- `getProvider()`: Factory — recibe config, retorna el adapter correcto
- `testConnection()`: Envía prompt "ok" para validar credenciales

### Flujo de conexión

1. El usuario selecciona "Conectar proveedor de IA" desde el menú
2. Elige entre los 6 proveedores disponibles
3. Ingresa su API Key (excepto Ollama)
4. Selecciona el modelo de una lista específica por proveedor
5. CCODE prueba la conexión con `testConnection()`
6. Si tiene éxito, guarda en `.ccode/config.json`
7. El estado del workflow avanza a `connected`

### Formato de APIs

Tres proveedores (OpenAI, DeepSeek, Groq) usan el mismo formato de API — el estándar de OpenAI Chat Completions. Esto significa que cualquier proveedor compatible con OpenAI se puede agregar con mínimo código.

Gemini usa su propio formato (Google Generative AI). Claude usa el formato de Anthropic Messages.

## 3. POR QUÉ (Justificación)

- **Patrón Adapter:** Agregar un nuevo proveedor solo requiere crear un archivo que implemente `IAIProvider` y agregarlo al switch del manager — cero cambios en el resto del sistema
- **Config persistente:** La configuración vive en `.ccode/`, no en variables de entorno. Cada proyecto puede usar un proveedor diferente
- **Test de conexión:** Evita que el usuario avance con credenciales inválidas o un modelo que no existe
- **Compatibilidad OpenAI:** Muchos proveedores (Groq, DeepSeek, Together, Perplexity) usan el formato de OpenAI, lo que facilita agregar nuevos

## 4. PARA QUÉ (Utilidad)

- Libertad de elegir proveedor por proyecto según presupuesto, velocidad o preferencia
- Soporte de modelos locales (Ollama) para desarrollo sin conexión ni costos
- Groq ofrece tier gratuito con inferencia ultra-rápida — ideal para testing
- Agregar proveedores futuros es trivial gracias al Adapter
- La configuración se versiona con el proyecto (sin secrets — `.ccode/config.json` está en `.gitignore`)

---
*CCODE habla con 6 proveedores de IA — tú eliges cuál usar en cada proyecto.*
