import type { AiChunk, AiConfig, AiMessage, AiModel, AiResponse } from '../types';
import type { AiProvider } from '../provider';

export class GeminiProvider implements AiProvider {
  id = 'gemini';
  name = 'Gemini';

  async isAvailable(): Promise<boolean> {
    // TODO(impl): implement Gemini availability and credentials checks.
    return false;
  }

  async chat(_messages: AiMessage[], _config: AiConfig): Promise<AiResponse> {
    // TODO(impl): implement Gemini chat call.
    return { text: '', model: '' };
  }

  async *stream(_messages: AiMessage[], _config: AiConfig): AsyncIterable<AiChunk> {
    // TODO(impl): implement Gemini streaming call.
    yield { delta: '', done: true };
  }

  async listModels(): Promise<AiModel[]> {
    // TODO(impl): load Gemini model catalog.
    return [];
  }
}
