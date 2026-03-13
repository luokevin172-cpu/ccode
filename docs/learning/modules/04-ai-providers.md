# Módulo 04: Proveedores de IA

## 1. QUÉ (Concepto)

CCODE no está atado a un proveedor de IA específico. Usa el **patrón Adapter** para abstraer la comunicación con cualquier LLM detrás de una interfaz común. Soporta 2 proveedores:

| Proveedor | Archivo | API |
|-----------|---------|-----|
| Claude (Anthropic) | `claude.ts` | REST propia de Anthropic |
| Google Gemini | `gemini.ts` | Google Generative AI (API Key + OAuth) |

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

#### GeminiAdapter (`src/ai/gemini.ts`)
- API de Google Generative AI (`generativelanguage.googleapis.com`)
- Modelo por defecto: `gemini-2.5-flash`
- Soporta dos métodos de autenticación:
  - **OAuth token** de Gemini CLI (`~/.gemini/oauth_creds.json`) — zero config
  - **API Key** como parámetro en la URL
- Modelos disponibles: 2.5 Flash, 2.5 Pro, 2.0 Flash
- `isAvailable()`: detecta automáticamente si Gemini CLI está autenticado

### AIManager (`src/ai/manager.ts`)

Factory que coordina la configuración, auto-detección y creación de proveedores:

```typescript
type ProviderName = 'claude' | 'gemini';

interface ICCODEConfig {
  provider: ProviderName;
  apiKey?: string;
  model?: string;
  authType?: 'api-key' | 'oauth';
}
```

Métodos:
- `loadConfig()`: Lee `.ccode/config.json`
- `saveConfig()`: Persiste la configuración
- `getProvider()`: Factory — recibe config, retorna el adapter correcto
- `testConnection()`: Envía prompt de prueba para validar credenciales
- `autoDetect()`: Detecta automáticamente proveedores disponibles

### Auto-detección de proveedores

CCODE detecta automáticamente qué proveedores están disponibles:

1. **Gemini CLI OAuth** — Si `~/.gemini/oauth_creds.json` existe con un `access_token` válido
2. **Variables de entorno** — `GOOGLE_API_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`
3. **Manual** — Guía al usuario para obtener una API Key

### Flujo de conexión

1. CCODE intenta auto-detectar un proveedor configurado
2. Si encuentra uno, verifica la conexión automáticamente
3. Si la conexión es exitosa, permite elegir modelo
4. Si no hay auto-detección, guía al usuario paso a paso
5. Prueba la conexión con `testConnection()`
6. Guarda en `.ccode/config.json`

### Formato de APIs

Gemini usa su propio formato (Google Generative AI). Claude usa el formato de Anthropic Messages. Ambos requieren parsing específico de la respuesta.

## 3. POR QUÉ (Justificación)

- **Patrón Adapter:** Agregar un nuevo proveedor solo requiere crear un archivo que implemente `IAIProvider` y agregarlo al switch del manager — cero cambios en el resto del sistema
- **Auto-detección:** El usuario no tiene que configurar nada manualmente si ya tiene un proveedor instalado
- **Config persistente:** La configuración vive en `.ccode/`, no solo en variables de entorno. Cada proyecto puede usar un proveedor diferente
- **Test de conexión:** Evita que el usuario avance con credenciales inválidas o un modelo que no existe

## 4. PARA QUÉ (Utilidad)

- Zero config si ya tienes Gemini CLI o una variable de entorno configurada
- Libertad de elegir proveedor por proyecto según presupuesto, velocidad o preferencia
- Agregar proveedores futuros es trivial gracias al Adapter
- La configuración se versiona con el proyecto (sin secrets — `.ccode/config.json` debe estar en `.gitignore`)

---
*CCODE se conecta a tu proveedor de IA favorito — y lo detecta automáticamente si ya lo tienes instalado.*
