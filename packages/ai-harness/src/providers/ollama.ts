import type { AiChunk, AiConfig, AiMessage, AiModel, AiResponse } from '../types';
import type { AiProvider } from '../provider';

export class OllamaProvider implements AiProvider {
  id = 'ollama';
  name = 'Ollama';

  constructor(private readonly baseUrl: string = 'http://localhost:11434') {}

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async chat(messages: AiMessage[], config: AiConfig): Promise<AiResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: config.model, messages, stream: false })
    });
    const payload = (await response.json()) as { message?: { content?: string } };
    return { text: payload.message?.content ?? '', model: config.model };
  }

  async *stream(_messages: AiMessage[], _config: AiConfig): AsyncIterable<AiChunk> {
    // TODO(impl): parse streaming chunks from /api/chat stream endpoint.
    yield { delta: '', done: true };
  }

  async listModels(): Promise<AiModel[]> {
    const response = await fetch(`${this.baseUrl}/api/tags`);
    const payload = (await response.json()) as { models?: Array<{ name: string }> };
    return (payload.models ?? []).map((model) => ({ id: model.name, name: model.name }));
  }
}
