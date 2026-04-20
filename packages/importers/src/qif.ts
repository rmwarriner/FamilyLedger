import type { ImportResult, Importer } from './types';

export const QIF_IMPORTER: Importer = {
  name: 'QIF',
  supportedExtensions: ['.qif'],
  parse: async (_input: string | Buffer): Promise<ImportResult> => {
    // TODO(impl): parse QIF sections and convert to raw ledger entities.
    return { accounts: [], transactions: [], errors: [], warnings: [] };
  },
  detectFormat: (input: string | Buffer): boolean => {
    const text = input.toString();
    return text.includes('!Type:');
  }
};
