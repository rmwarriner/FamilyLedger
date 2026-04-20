import type { AiChunk, AiConfig, AiMessage, AiModel, AiResponse } from '../types';
import type { AiProvider } from '../provider';

export class AnthropicProvider implements AiProvider {
  id = 'anthropic';
  name = 'Anthropic';

  async isAvailable(): Promise<boolean> {
    // TODO(impl): implement Anthropic availability and credentials checks.
    return false;
  }

  async chat(_messages: AiMessage[], _config: AiConfig): Promise<AiResponse> {
    // TODO(impl): implement Anthropic chat call.
    return { text: '', model: '' };
  }

  async *stream(_messages: AiMessage[], _config: AiConfig): AsyncIterable<AiChunk> {
    // TODO(impl): implement Anthropic streaming call.
    yield { delta: '', done: true };
  }

  async listModels(): Promise<AiModel[]> {
    // TODO(impl): load Anthropic model catalog.
    return [];
  }
}
