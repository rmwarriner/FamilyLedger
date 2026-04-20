import type { Money } from '@familyledger/shared';

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
export type AccountSubtype = string;

export interface Account {
  id: string;
  parentId: string | null;
  name: string;
  fullPath: string;
  type: AccountType;
  subtype: AccountSubtype;
  currency: string;
  isPlaceholder: boolean;
  isClosed: boolean;
  openedAt: Date;
  closedAt: Date | null;
  notes: string;
}

export interface Posting {
  id: string;
  accountId: string;
  amount: Money;
  memo: string;
  reconciled: boolean;
  reconciledAt: Date | null;
  cleared: boolean;
}

export interface JournalEntry {
  id: string;
  date: Date;
  description: string;
  payee: string | null;
  postings: Posting[];
  tags: string[];
  attachments: string[];
  isScheduled: boolean;
  scheduledId: string | null;
  importedFrom: string | null;
  importedId: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface LedgerState {
  accounts: Record<string, Account>;
  entries: JournalEntry[];
}

export interface TrialBalanceRow {
  accountId: string;
  debit: Money;
  credit: Money;
}

export interface TrialBalance {
  asOf: Date;
  rows: TrialBalanceRow[];
  totalDebits: Money;
  totalCredits: Money;
}

export interface LedgerError {
  code: string;
  message: string;
}
