import { useQuery } from '@tanstack/react-query';
import { listBudgetSummaries } from '../ipc/budgets';

export const useBudgets = () =>
  useQuery({ queryKey: ['budgets'], queryFn: async () => listBudgetSummaries() });
