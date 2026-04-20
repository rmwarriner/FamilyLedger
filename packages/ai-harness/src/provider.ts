import type { AiChunk, AiConfig, AiMessage, AiModel, AiResponse } from './types';

export interface AiProvider {
  id: string;
  name: string;
  isAvailable(): Promise<boolean>;
  chat(messages: AiMessage[], config: AiConfig): Promise<AiResponse>;
  stream(messages: AiMessage[], config: AiConfig): AsyncIterable<AiChunk>;
  listModels(): Promise<AiModel[]>;
}
