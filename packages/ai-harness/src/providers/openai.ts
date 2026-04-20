import OpenAI from 'openai';
import type { AiChunk, AiConfig, AiMessage, AiModel, AiResponse } from '../types';
import type { AiProvider } from '../provider';

export class OpenAiProvider implements AiProvider {
  id = 'openai';
  name = 'OpenAI';

  constructor(private readonly apiKey: string) {}

  private client(): OpenAI {
    return new OpenAI({ apiKey: this.apiKey });
  }

  async isAvailable(): Promise<boolean> {
    return this.apiKey.length > 0;
  }

  async chat(messages: AiMessage[], config: AiConfig): Promise<AiResponse> {
    const completion = await this.client().chat.completions.create({
      model: config.model,
      messages: messages.map((message) => ({ role: message.role, content: message.content })),
      temperature: config.temperature,
      max_tokens: config.maxTokens
    });

    return {
      text: completion.choices[0]?.message.content ?? '',
      model: completion.model
    };
  }

  async *stream(_messages: AiMessage[], _config: AiConfig): AsyncIterable<AiChunk> {
    // TODO(impl): implement OpenAI streaming response integration.
    yield { delta: '', done: true };
  }

  async listModels(): Promise<AiModel[]> {
    const models = await this.client().models.list();
    return models.data.map((model) => ({ id: model.id, name: model.id }));
  }
}
