import type { ImportResult, Importer, RawAccount, RawTransaction } from './types';

const defaultAccount: RawAccount = {
  importedId: 'mt940:default-account',
  name: 'MT940 Imported Account',
  type: 'BANK',
  currency: 'USD'
};

const parseStatementLines = (text: string): RawTransaction[] => {
  const lines = text.split(/\r?\n/);
  const transactions: RawTransaction[] = [];
  let current61 = '';

  for (const line of lines) {
    if (line.startsWith(':61:')) {
      current61 = line.slice(4).trim();
    }

    if (line.startsWith(':86:') && current61) {
      const memo = line.slice(4).trim();
      const amountMatch = current61.match(/([CD])([0-9,\.]+)/);
      const sign = amountMatch?.[1] === 'D' ? -1 : 1;
      const numeric = Number((amountMatch?.[2] ?? '0').replace(',', '.'));

      transactions.push({
        importedId: `mt940:${transactions.length + 1}`,
        date: current61.slice(0, 6),
        payee: memo || 'MT940 Transaction',
        amount: (sign * numeric).toFixed(2),
        accountImportedId: defaultAccount.importedId,
        memo
      });

      current61 = '';
    }
  }

  return transactions;
};

export const MT940_IMPORTER: Importer = {
  name: 'MT940',
  supportedExtensions: ['.sta', '.mt940', '.txt'],
  parse: async (input: string | Buffer): Promise<ImportResult> => {
    const text = input.toString();

    return {
      accounts: [defaultAccount],
      transactions: parseStatementLines(text),
      errors: [],
      warnings: []
    };
  },
  detectFormat: (input: string | Buffer): boolean => {
    const text = input.toString();
    return text.includes(':20:') && text.includes(':61:');
  }
};
