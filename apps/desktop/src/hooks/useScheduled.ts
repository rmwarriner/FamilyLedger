import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listScheduledTransactions, postScheduledTransaction, type ScheduledTransactionDto } from '../ipc/scheduled';

export type ScheduledTransaction = ScheduledTransactionDto;

export const useScheduled = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['scheduled-transactions'],
    queryFn: async (): Promise<ScheduledTransaction[]> => listScheduledTransactions()
  });

  const post = useMutation({
    mutationFn: async (id: string) => postScheduledTransaction(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['scheduled-transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });

  return {
    ...query,
    post
  };
};
