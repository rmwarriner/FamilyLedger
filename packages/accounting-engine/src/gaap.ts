import { Money } from '@familyledger/shared';
import type { Account, JournalEntry, LedgerState, Posting } from './types';

export interface GaapOptions {
  accrualBasis: boolean;
  periodEndDate?: Date;
  generateClosingEntries?: boolean;
  retainedEarningsAccountId?: string;
}

interface DepreciationSchedule {
  periodicAmount: string;
  expenseAccountId: string;
  contraAccountId: string;
}

const isCashLikeAccount = (account: Account): boolean => {
  if (account.type !== 'ASSET') {
    return false;
  }

  const subtype = account.subtype.toUpperCase();
  if (subtype === 'CASH' || subtype === 'BANK') {
    return true;
  }

  const path = account.fullPath.toLowerCase();
  return path.includes('cash') || path.includes('bank');
};

const enforceAccountClassificationConsistency = (state: LedgerState): void => {
  const byPath = new Map<string, { id: string; type: Account['type'] }>();

  for (const account of Object.values(state.accounts)) {
    const key = account.fullPath.trim().toLowerCase();
    const existing = byPath.get(key);
    if (existing && existing.type !== account.type) {
      throw new Error(
        `GAAP_ACCOUNT_CLASSIFICATION_CONFLICT: ${account.fullPath} (${existing.type} vs ${account.type})`
      );
    }
    byPath.set(key, { id: account.id, type: account.type });
  }
};

const parseDepreciationSchedule = (account: Account): DepreciationSchedule | null => {
  if (account.type !== 'ASSET' || account.subtype.toUpperCase() !== 'FIXED_ASSET' || !account.notes) {
    return null;
  }

  try {
    const parsed = JSON.parse(account.notes) as { depreciation?: DepreciationSchedule };
    if (!parsed.depreciation) {
      return null;
    }

    const { periodicAmount, expenseAccountId, contraAccountId } = parsed.depreciation;
    if (!periodicAmount || !expenseAccountId || !contraAccountId) {
      return null;
    }

    return { periodicAmount, expenseAccountId, contraAccountId };
  } catch {
    return null;
  }
};

const createPosting = (
  id: string,
  accountId: string,
  amount: Money,
  memo: string
): Posting => ({
  id,
  accountId,
  amount,
  memo,
  reconciled: false,
  reconciledAt: null,
  cleared: false
});

const generateDepreciationEntries = (
  state: LedgerState,
  periodEndDate: Date
): JournalEntry[] => {
  return Object.values(state.accounts).flatMap((account) => {
    const schedule = parseDepreciationSchedule(account);
    if (!schedule) {
      return [];
    }

    const expenseAccount = state.accounts[schedule.expenseAccountId];
    const contraAccount = state.accounts[schedule.contraAccountId];
    if (!expenseAccount || !contraAccount) {
      return [];
    }

    const amount = Money.from(schedule.periodicAmount, account.currency);
    if (amount.isZero()) {
      return [];
    }

    const id = `gaap-depr-${account.id}-${periodEndDate.toISOString().slice(0, 10)}`;
    return [{
      id,
      date: periodEndDate,
      description: `Depreciation for ${account.fullPath}`,
      payee: null,
      postings: [
        createPosting(`${id}-expense`, expenseAccount.id, amount, `Depreciation expense for ${account.fullPath}`),
        createPosting(`${id}-contra`, contraAccount.id, amount.negate(), `Accumulated depreciation for ${account.fullPath}`)
      ],
      tags: ['gaap', 'depreciation'],
      attachments: [],
      isScheduled: false,
      scheduledId: null,
      importedFrom: null,
      importedId: null,
      createdAt: periodEndDate,
      updatedAt: periodEndDate,
      createdBy: 'gaap-engine'
    }];
  });
};

const generateClosingEntry = (
  state: LedgerState,
  periodEndDate: Date,
  retainedEarningsAccountId: string
): JournalEntry | null => {
  const retained = state.accounts[retainedEarningsAccountId];
  if (!retained || retained.type !== 'EQUITY') {
    return null;
  }

  const sums = new Map<string, Money>();
  for (const entry of state.entries) {
    if (entry.date > periodEndDate) {
      continue;
    }
    for (const posting of entry.postings) {
      const account = state.accounts[posting.accountId];
      if (!account || (account.type !== 'INCOME' && account.type !== 'EXPENSE')) {
        continue;
      }

      const current = sums.get(account.id) ?? Money.from(0, posting.amount.currency);
      sums.set(account.id, current.plus(posting.amount));
    }
  }

  if (sums.size === 0) {
    return null;
  }

  const id = `gaap-close-${periodEndDate.toISOString().slice(0, 10)}`;
  const postings: Posting[] = [];

  for (const [accountId, balance] of sums.entries()) {
    if (balance.isZero()) {
      continue;
    }

    postings.push(
      createPosting(
        `${id}-${accountId}`,
        accountId,
        balance.negate(),
        `Close ${accountId} to retained earnings`
      )
    );
  }

  if (postings.length === 0) {
    return null;
  }

  const closingTotal = postings.reduce(
    (sum, posting) => sum.plus(posting.amount),
    Money.from(0, postings[0]?.amount.currency ?? retained.currency)
  );
  postings.push(
    createPosting(
      `${id}-retained-earnings`,
      retained.id,
      closingTotal.negate(),
      'Period-end close to retained earnings'
    )
  );

  return {
    id,
    date: periodEndDate,
    description: `Period close ${periodEndDate.toISOString().slice(0, 10)}`,
    payee: null,
    postings,
    tags: ['gaap', 'closing'],
    attachments: [],
    isScheduled: false,
    scheduledId: null,
    importedFrom: null,
    importedId: null,
    createdAt: periodEndDate,
    updatedAt: periodEndDate,
    createdBy: 'gaap-engine'
  };
};

export const applyGaapRules = (state: LedgerState, options: GaapOptions): LedgerState => {
  enforceAccountClassificationConsistency(state);

  const cashAccountIds = new Set(
    Object.values(state.accounts)
      .filter(isCashLikeAccount)
      .map((account) => account.id)
  );

  const scopedEntries = options.accrualBasis
    ? state.entries
    : state.entries.filter((entry) => entry.postings.some((posting) => cashAccountIds.has(posting.accountId)));

  const generatedEntries: JournalEntry[] = [];

  if (options.periodEndDate) {
    generatedEntries.push(...generateDepreciationEntries(state, options.periodEndDate));

    if (options.generateClosingEntries && options.retainedEarningsAccountId) {
      const closing = generateClosingEntry(state, options.periodEndDate, options.retainedEarningsAccountId);
      if (closing) {
        generatedEntries.push(closing);
      }
    }
  }

  const existingIds = new Set(scopedEntries.map((entry) => entry.id));
  const uniqueGenerated = generatedEntries.filter((entry) => !existingIds.has(entry.id));

  return {
    ...state,
    entries: [...scopedEntries, ...uniqueGenerated]
  };
};
