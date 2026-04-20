import type { ImportError, ImportResult, Importer, RawAccount, RawTransaction } from './types';

const defaultAccount: RawAccount = {
  importedId: 'csv:default-account',
  name: 'Imported CSV Account',
  type: 'ASSET',
  currency: 'USD'
};

const parseAmount = (value: string, row: number, errors: ImportError[]): string => {
  const trimmed = value.trim();
  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) {
    errors.push({
      code: 'CSV_INVALID_AMOUNT',
      message: `Invalid amount at row ${row}: ${value}`,
      row
    });
    return '0.00';
  }

  return numeric.toFixed(2);
};

export const CSV_IMPORTER: Importer = {
  name: 'CSV',
  supportedExtensions: ['.csv'],
  parse: async (input: string | Buffer): Promise<ImportResult> => {
    const text = input.toString().trim();
    const rows = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

    if (rows.length === 0) {
      return {
        accounts: [],
        transactions: [],
        errors: [{ code: 'CSV_EMPTY', message: 'CSV input is empty.' }],
        warnings: []
      };
    }

    const header = rows[0]!.split(',').map((value) => value.trim().toLowerCase());
    const dateIndex = header.indexOf('date');
    const payeeIndex = header.indexOf('payee');
    const amountIndex = header.indexOf('amount');

    if (dateIndex < 0 || payeeIndex < 0 || amountIndex < 0) {
      return {
        accounts: [defaultAccount],
        transactions: [],
        errors: [
          {
            code: 'CSV_MISSING_COLUMNS',
            message: 'CSV must include date, payee, and amount columns.'
          }
        ],
        warnings: []
      };
    }

    const errors: ImportError[] = [];
    const transactions: RawTransaction[] = rows.slice(1).flatMap((line, index) => {
      const rowNumber = index + 2;
      const parts = line.split(',');
      const date = parts[dateIndex]?.trim() ?? '';
      const payee = parts[payeeIndex]?.trim() ?? '';
      const amountRaw = parts[amountIndex]?.trim() ?? '';

      if (!date || !payee || !amountRaw) {
        errors.push({
          code: 'CSV_ROW_INCOMPLETE',
          message: `CSV row ${rowNumber} is missing required values.`,
          row: rowNumber
        });
        return [];
      }

      return [{
        importedId: `csv:${rowNumber}:${date}:${payee}`,
        date,
        payee,
        amount: parseAmount(amountRaw, rowNumber, errors),
        accountImportedId: defaultAccount.importedId,
        memo: ''
      }];
    });

    return {
      accounts: [defaultAccount],
      transactions,
      errors,
      warnings: []
    };
  },
  detectFormat: (input: string | Buffer): boolean => {
    const firstLine = input
      .toString()
      .split('\n')[0]
      ?.trim()
      .toLowerCase();

    if (!firstLine) {
      return false;
    }

    const columns = firstLine.split(',').map((value) => value.trim());
    return columns.includes('date') && columns.includes('payee') && columns.includes('amount');
  }
};
