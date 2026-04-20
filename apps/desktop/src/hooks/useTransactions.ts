import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTransaction,
  listTransactions,
  type CreateTransactionRequest
} from '../ipc/transactions';

export const useTransactions = () => {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['transactions'], queryFn: async () => listTransactions() });

  const create = useMutation({
    mutationFn: async (request: CreateTransactionRequest) => createTransaction(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });

  return { ...query, create };
};
