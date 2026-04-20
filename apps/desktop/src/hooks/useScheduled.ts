import { useQuery } from '@tanstack/react-query';

export interface ScheduledTransaction {
  id: string;
  dueAt: string;
  autoPost: boolean;
}

export const useScheduled = () =>
  useQuery({
    queryKey: ['scheduled-transactions'],
    queryFn: async (): Promise<ScheduledTransaction[]> => {
      // TODO(impl): fetch scheduled transaction list through typed IPC bridge.
      return [];
    }
  });
