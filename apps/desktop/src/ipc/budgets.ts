import { invoke } from '@tauri-apps/api/core';
import type { BudgetSummary } from '@familyledger/budgets';

export const listBudgetSummaries = async (): Promise<BudgetSummary[]> =>
  invoke<BudgetSummary[]>('list_budgets');
