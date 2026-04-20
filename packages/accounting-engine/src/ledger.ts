import { Money, err, ok, type Result } from '@familyledger/shared';
import type { JournalEntry, LedgerError, LedgerState, Posting } from './types';

const sumPostings = (postings: Posting[]): Money =>
  postings.reduce(
    (sum, posting) => sum.plus(posting.amount),
    Money.from(0, postings[0]?.amount.currency ?? 'USD')
  );

export const validateJournalEntry = (entry: JournalEntry): Result<void, LedgerError> => {
  if (entry.postings.length < 2) {
    return err({ code: 'LEDGER_MIN_POSTINGS', message: 'Journal entry requires at least two postings.' });
  }

  const currencies = new Set(entry.postings.map((posting) => posting.amount.currency));
  if (currencies.size !== 1) {
    return err({ code: 'LEDGER_MULTI_CURRENCY_POSTING', message: 'All postings in an entry must share one currency.' });
  }

  const total = sumPostings(entry.postings);
  if (!total.isZero()) {
    return err({ code: 'LEDGER_IMBALANCED', message: "Postings do not sum to zero." });
  }

  return ok(undefined);
};

export const applyJournalEntry = (
  entry: JournalEntry,
  state: LedgerState
): Result<LedgerState, LedgerError> => {
  const validation = validateJournalEntry(entry);
  if (!validation.ok) {
    return validation;
  }

  const hasPlaceholderPosting = entry.postings.some((posting) => state.accounts[posting.accountId]?.isPlaceholder);
  if (hasPlaceholderPosting) {
    return err({ code: 'LEDGER_PLACEHOLDER_POSTING', message: 'Cannot post to placeholder account.' });
  }

  return ok({ ...state, entries: [...state.entries, entry] });
};

export const reverseJournalEntry = (entry: JournalEntry): JournalEntry => {
  const now = new Date();
  return {
    ...entry,
    id: `${entry.id}-reversal`,
    date: now,
    description: `Reversal of ${entry.id}: ${entry.description}`,
    postings: entry.postings.map((posting) => ({
      ...posting,
      id: `${posting.id}-reversal`,
      amount: posting.amount.negate()
    })),
    createdAt: now,
    updatedAt: now
  };
};
