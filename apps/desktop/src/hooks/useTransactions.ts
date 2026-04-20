import { useQuery } from '@tanstack/react-query';
import { listTransactions } from '../ipc/transactions';

export const useTransactions = () =>
  useQuery({ queryKey: ['transactions'], queryFn: async () => listTransactions() });
