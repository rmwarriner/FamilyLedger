import { Money } from '@familyledger/shared';
import type { JournalEntry, TrialBalance } from './types';

export const getAccountBalance = (
  accountId: string,
  asOf: Date,
  entries: JournalEntry[]
): Money => {
  const postings = entries
    .filter((entry) => entry.date <= asOf)
    .flatMap((entry) => entry.postings)
    .filter((posting) => posting.accountId === accountId);

  const currency = postings[0]?.amount.currency ?? 'USD';
  return postings.reduce((sum, posting) => sum.plus(posting.amount), Money.from(0, currency));
};

export const getRunningBalance = (
  accountId: string,
  entries: JournalEntry[]
): Array<{ date: Date; balance: Money }> => {
  const sorted = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
  let balance = Money.from(0, 'USD');

  return sorted.map((entry) => {
    const accountPostings = entry.postings.filter((posting) => posting.accountId === accountId);
    if (accountPostings.length > 0) {
      const firstPosting = accountPostings[0];
      if (!firstPosting) {
        return { date: entry.date, balance };
      }
      const currency = firstPosting.amount.currency;
      if (balance.currency !== currency) {
        balance = Money.from(balance.amount, currency);
      }
      balance = accountPostings.reduce((sum, posting) => sum.plus(posting.amount), balance);
    }
    return { date: entry.date, balance };
  });
};

export const getTrialBalance = (asOf: Date, entries: JournalEntry[]): TrialBalance => {
  const rowsByAccount = new Map<string, { debit: Money; credit: Money }>();

  entries
    .filter((entry) => entry.date <= asOf)
    .flatMap((entry) => entry.postings)
    .forEach((posting) => {
      const existing = rowsByAccount.get(posting.accountId) ?? {
        debit: Money.from(0, posting.amount.currency),
        credit: Money.from(0, posting.amount.currency)
      };

      if (posting.amount.amount.greaterThanOrEqualTo(0)) {
        existing.debit = existing.debit.plus(posting.amount);
      } else {
        existing.credit = existing.credit.plus(posting.amount.negate());
      }
      rowsByAccount.set(posting.accountId, existing);
    });

  const rows = Array.from(rowsByAccount.entries()).map(([accountId, totals]) => ({
    accountId,
    debit: totals.debit,
    credit: totals.credit
  }));

  const totalDebits = rows.reduce(
    (sum, row) => sum.plus(row.debit),
    Money.from(0, rows[0]?.debit.currency ?? 'USD')
  );
  const totalCredits = rows.reduce(
    (sum, row) => sum.plus(row.credit),
    Money.from(0, rows[0]?.credit.currency ?? 'USD')
  );

  return { asOf, rows, totalDebits, totalCredits };
};
