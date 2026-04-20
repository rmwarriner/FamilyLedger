import type { Account, LedgerState, Posting } from '@familyledger/accounting-engine';
import type { ReportColumn, ReportOutput, ReportParams, ReportRow } from '../types';

const toNumber = (posting: Posting): number => Number(posting.amount.amount.toString());

export const moneyNumber = (value: { toString(): string } | string | number): number => {
  if (typeof value === 'number') return value;
  return Number(typeof value === 'string' ? value : value.toString());
};

export const accountById = (ledger: LedgerState): Map<string, Account> =>
  new Map(Object.values(ledger.accounts).map((account) => [account.id, account]));

export const aggregateByAccount = (
  ledger: LedgerState,
  predicate: (account: Account) => boolean
): Array<{ account: Account; amount: number }> => {
  const accounts = accountById(ledger);
  const totals = new Map<string, number>();

  for (const entry of ledger.entries) {
    for (const posting of entry.postings) {
      const account = accounts.get(posting.accountId);
      if (!account || !predicate(account)) continue;
      totals.set(account.id, (totals.get(account.id) ?? 0) + toNumber(posting));
    }
  }

  return Array.from(totals.entries())
    .map(([accountId, amount]) => ({ account: accounts.get(accountId)!, amount }))
    .sort((a, b) => a.account.fullPath.localeCompare(b.account.fullPath));
};

export const sum = (values: number[]): number => values.reduce((acc, value) => acc + value, 0);

export const baseOutput = (
  title: string,
  subtitle: string,
  columns: ReportColumn[],
  rows: ReportRow[],
  totals: ReportRow | null,
  parameters: ReportParams
): ReportOutput => ({
  title,
  subtitle,
  columns,
  rows,
  totals,
  generatedAt: new Date(),
  parameters
});

export const cashLike = (account: Account): boolean => {
  if (account.type !== 'ASSET') return false;
  const subtype = account.subtype.toUpperCase();
  if (subtype.includes('CASH') || subtype.includes('BANK')) return true;
  const path = account.fullPath.toLowerCase();
  return path.includes('cash') || path.includes('checking') || path.includes('bank');
};
