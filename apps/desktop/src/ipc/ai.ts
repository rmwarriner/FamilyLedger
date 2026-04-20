import { invoke } from '@tauri-apps/api/core';

export interface AiRequest {
  provider: string;
  model: string;
  prompt: string;
}

export interface AiResponse {
  text: string;
}

export const askAi = async (request: AiRequest): Promise<AiResponse> =>
  invoke<AiResponse>('ask_ai', { request });
