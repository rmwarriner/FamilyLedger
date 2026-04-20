import { useMutation } from '@tanstack/react-query';
import { askAi, type AiRequest } from '../ipc/ai';

export const useAi = () =>
  useMutation({ mutationFn: async (request: AiRequest) => askAi(request) });
