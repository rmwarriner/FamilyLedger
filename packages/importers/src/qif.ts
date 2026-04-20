import type { ImportResult, Importer, RawAccount, RawTransaction } from './types';

const defaultAccount: RawAccount = {
  importedId: 'qif:default-account',
  name: 'QIF Imported Account',
  type: 'BANK',
  currency: 'USD'
};

const normalizeQifDate = (value: string): string => {
  const trimmed = value.trim();
  const match = trimmed.match(/(\d{1,2})\/(\d{1,2})'?(\d{2,4})/);
  if (!match) {
    return trimmed;
  }

  const month = match[1]!.padStart(2, '0');
  const day = match[2]!.padStart(2, '0');
  const year = match[3]!.length === 2 ? `20${match[3]}` : match[3]!;
  return `${year}-${month}-${day}`;
};

export const QIF_IMPORTER: Importer = {
  name: 'QIF',
  supportedExtensions: ['.qif'],
  parse: async (input: string | Buffer): Promise<ImportResult> => {
    const lines = input.toString().split(/\r?\n/);
    const transactions: RawTransaction[] = [];

    let date = '';
    let payee = '';
    let amount = '0.00';
    let memo = '';

    const flush = (): void => {
      if (!date && !payee && amount === '0.00') {
        return;
      }
      const normalizedDate = normalizeQifDate(date);

      transactions.push({
        importedId: `qif:${transactions.length + 1}:${normalizedDate}:${payee}`,
        date: normalizedDate,
        payee: payee || 'Unknown Payee',
        amount: Number(amount).toFixed(2),
        accountImportedId: defaultAccount.importedId,
        memo
      });

      date = '';
      payee = '';
      amount = '0.00';
      memo = '';
    };

    for (const line of lines) {
      if (line.startsWith('D')) {
        date = line.slice(1).trim();
      } else if (line.startsWith('P')) {
        payee = line.slice(1).trim();
      } else if (line.startsWith('T')) {
        amount = line.slice(1).trim();
      } else if (line.startsWith('M')) {
        memo = line.slice(1).trim();
      } else if (line.trim() === '^') {
        flush();
      }
    }

    flush();

    return {
      accounts: [defaultAccount],
      transactions,
      errors: [],
      warnings: []
    };
  },
  detectFormat: (input: string | Buffer): boolean => {
    const text = input.toString();
    return text.includes('!Type:');
  }
};
