import type { Money } from '@familyledger/shared';

export type OverspendPolicy = 'WARN_ONLY' | 'BLOCK' | 'BORROW_NEXT_MONTH';
export type BudgetType = 'ENVELOPE' | 'TRACKING';

export interface EnvelopeBudget {
  id: string;
  name: string;
  allocated: Money;
  spent: Money;
  available: Money;
  rolloverEnabled: boolean;
  overspendPolicy: OverspendPolicy;
}

export interface TrackingBudgetLine {
  id: string;
  category: string;
  target: Money;
  actual: Money;
}

export interface BudgetSummary {
  id: string;
  type: BudgetType;
  name: string;
  target: Money;
  actual: Money;
  variance: Money;
}
