import type { ImportResult, ImportWarning, RawAccount, RawTransaction } from './types';

const normalizeCurrency = (value: string): string => {
  const code = value.trim().toUpperCase();
  return code.length >= 3 ? code.slice(0, 3) : 'USD';
};

const normalizeDate = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return '';
  }

  const ymdDashed = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymdDashed) {
    return `${ymdDashed[1]}-${ymdDashed[2]}-${ymdDashed[3]}`;
  }

  const ymdCompact = trimmed.match(/^(\d{4})(\d{2})(\d{2})/);
  if (ymdCompact) {
    return `${ymdCompact[1]}-${ymdCompact[2]}-${ymdCompact[3]}`;
  }

  const yymmdd = trimmed.match(/^(\d{2})(\d{2})(\d{2})$/);
  if (yymmdd) {
    return `20${yymmdd[1]}-${yymmdd[2]}-${yymmdd[3]}`;
  }

  const qif = trimmed.match(/^(\d{1,2})\/(\d{1,2})'?(\d{2,4})$/);
  if (qif) {
    const year = qif[3]!.length === 2 ? `20${qif[3]}` : qif[3]!;
    return `${year}-${qif[1]!.padStart(2, '0')}-${qif[2]!.padStart(2, '0')}`;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return trimmed;
};

const normalizeAmount = (value: string): string => {
  const numeric = Number(value.replace(',', '.').trim());
  if (!Number.isFinite(numeric)) {
    return '0.00';
  }

  return numeric.toFixed(2);
};

const normalizeAccount = (account: RawAccount): RawAccount => ({
  ...account,
  importedId: account.importedId.trim(),
  name: account.name.trim() || 'Imported Account',
  type: account.type.trim().toUpperCase() || 'ASSET',
  currency: normalizeCurrency(account.currency)
});

const normalizeTransaction = (transaction: RawTransaction): RawTransaction => ({
  ...transaction,
  importedId: transaction.importedId.trim(),
  date: normalizeDate(transaction.date),
  payee: transaction.payee.trim() || 'Unknown Payee',
  amount: normalizeAmount(transaction.amount),
  accountImportedId: transaction.accountImportedId.trim(),
  memo: transaction.memo.trim()
});

const transactionFingerprint = (transaction: RawTransaction): string =>
  [
    transaction.date,
    transaction.payee.toLowerCase(),
    transaction.amount,
    transaction.accountImportedId
  ].join('|');

export const finalizeImportResult = (result: ImportResult, source: string): ImportResult => {
  const warnings: ImportWarning[] = [...result.warnings];

  const normalizedAccounts = result.accounts.map(normalizeAccount);
  const normalizedTransactions = result.transactions.map(normalizeTransaction);

  const accountIds = new Set<string>();
  const accounts = normalizedAccounts.filter((account) => {
    if (accountIds.has(account.importedId)) {
      warnings.push({
        code: 'IMPORT_DUPLICATE_ACCOUNT',
        message: `Skipped duplicate account importedId=${account.importedId} in ${source}.`
      });
      return false;
    }
    accountIds.add(account.importedId);
    return true;
  });

  const transactionIds = new Set<string>();
  const fingerprints = new Set<string>();
  const transactions = normalizedTransactions.filter((transaction) => {
    if (transactionIds.has(transaction.importedId)) {
      warnings.push({
        code: 'IMPORT_DUPLICATE_TRANSACTION_ID',
        message: `Skipped duplicate transaction importedId=${transaction.importedId} in ${source}.`
      });
      return false;
    }
    transactionIds.add(transaction.importedId);

    const fingerprint = transactionFingerprint(transaction);
    if (fingerprints.has(fingerprint)) {
      warnings.push({
        code: 'IMPORT_DUPLICATE_TRANSACTION_FINGERPRINT',
        message: `Skipped duplicate transaction fingerprint=${fingerprint} in ${source}.`
      });
      return false;
    }
    fingerprints.add(fingerprint);
    return true;
  });

  return {
    ...result,
    accounts,
    transactions,
    warnings
  };
};
