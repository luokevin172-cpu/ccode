# Módulo 04: Proveedores de IA

## 1. QUÉ (Concepto)

CCODE no está atado a un proveedor de IA específico. Usa el **patrón Adapter** para abstraer la comunicación con cualquier LLM detrás de una interfaz común. Actualmente soporta **Claude** (Anthropic) y **Ollama** (modelos locales).

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

Todos los proveedores implementan `IAIProvider`. El resto del sistema solo conoce esta interfaz.

### ClaudeAdapter (`src/ai/claude.ts`)

- Usa la API REST de Anthropic (`/v1/messages`)
- Modelo por defecto: `claude-sonnet-4-20250514`
- `max_tokens`: 8096
- Autenticación vía `x-api-key`

### OllamaAdapter (`src/ai/ollama.ts`)

- Conecta con Ollama local (`/api/generate`)
- URL por defecto: `http://localhost:11434`
- Timeout: 120 segundos (modelos locales son más lentos)
- No requiere API key

### AIManager (`src/ai/manager.ts`)

Capa de gestión que coordina la configuración:

```typescript
interface ICCODEConfig {
  provider: 'claude' | 'ollama';
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}
```

Métodos:
- `loadConfig()`: Lee `.ccode/config.json`
- `saveConfig()`: Persiste la configuración
- `getProvider()`: Factory que instancia el adapter correcto
- `testConnection()`: Prueba rápida con prompt "ok" para validar conexión

### Flujo de conexión

1. El usuario ejecuta "Conectar proveedor de IA" desde el menú
2. Selecciona Claude u Ollama
3. Ingresa credenciales (API key o URL)
4. CCODE prueba la conexión con `testConnection()`
5. Si tiene éxito, guarda en `.ccode/config.json`
6. El estado del workflow avanza a `connected`

## 3. POR QUÉ (Justificación)

- **Patrón Adapter:** Agregar un nuevo proveedor (GPT, Gemini, etc.) solo requiere implementar `IAIProvider` — cero cambios en el resto del sistema
- **Config persistente:** La configuración vive en `.ccode/`, no en variables de entorno globales. Cada proyecto puede usar un proveedor diferente
- **Test de conexión:** Evita que el usuario avance con credenciales inválidas

## 4. PARA QUÉ (Utilidad)

- Libertad de elegir proveedor por proyecto
- Soporte de modelos locales (Ollama) para desarrollo sin conexión
- Agregar proveedores nuevos es trivial gracias al Adapter
- La configuración se versiona con el proyecto (sin secrets — el `.ccode/config.json` debería estar en `.gitignore`)

---
*CCODE habla con cualquier IA — tú eliges cuál.*
