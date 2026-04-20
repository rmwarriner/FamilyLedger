import { useQuery } from '@tanstack/react-query';
import { listAccounts } from '../ipc/accounts';

export const useAccounts = () =>
  useQuery({ queryKey: ['accounts'], queryFn: async () => listAccounts() });
