export type AiCapability = 'CHAT' | 'STREAM' | 'MODELS';

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiConfig {
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface AiChunk {
  delta: string;
  done: boolean;
}

export interface AiModel {
  id: string;
  name: string;
}

export interface AiResponse {
  text: string;
  model: string;
}
