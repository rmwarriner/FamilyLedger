import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listBudgetSummaries, type BudgetSummaryDto } from '../ipc/budgets';

export interface BudgetViewModel {
  id: string;
  name: string;
  type: 'ENVELOPE' | 'TRACKING';
  currency: string;
  target: number;
  actual: number;
  variance: number;
  overspendPolicy: BudgetSummaryDto['overspendPolicy'];
  rolloverEnabled: boolean;
  borrowCarryover: number;
}

const parseAmount = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const useBudgets = () => {
  const query = useQuery({ queryKey: ['budgets'], queryFn: async () => listBudgetSummaries() });

  const summaries = useMemo<BudgetViewModel[]>(() => {
    const rows = query.data ?? [];
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.budgetType,
      currency: row.currency,
      target: parseAmount(row.target),
      actual: parseAmount(row.actual),
      variance: parseAmount(row.variance),
      overspendPolicy: row.overspendPolicy,
      rolloverEnabled: Boolean(row.rolloverEnabled),
      borrowCarryover: row.borrowCarryover ? parseAmount(row.borrowCarryover) : 0
    }));
  }, [query.data]);

  const envelopes = summaries.filter((row) => row.type === 'ENVELOPE');
  const tracking = summaries.filter((row) => row.type === 'TRACKING');

  return {
    ...query,
    summaries,
    envelopes,
    tracking
  };
};
