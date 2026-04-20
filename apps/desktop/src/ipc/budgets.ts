import { invoke } from '@tauri-apps/api/core';

export interface BudgetSummaryDto {
  id: string;
  name: string;
  budgetType: 'ENVELOPE' | 'TRACKING';
  target: string;
  actual: string;
  variance: string;
  currency: string;
  overspendPolicy: 'WARN_ONLY' | 'BLOCK' | 'BORROW_NEXT_MONTH' | null;
  rolloverEnabled: boolean | null;
  borrowCarryover: string | null;
}

export const listBudgetSummaries = async (): Promise<BudgetSummaryDto[]> =>
  invoke<BudgetSummaryDto[]>('list_budgets');
