import type { ImportResult, Importer } from './types';

export const CSV_IMPORTER: Importer = {
  name: 'CSV',
  supportedExtensions: ['.csv'],
  parse: async (_input: string | Buffer): Promise<ImportResult> => {
    // TODO(impl): parse generic CSV with configurable column mapping and validation.
    return { accounts: [], transactions: [], errors: [], warnings: [] };
  },
  detectFormat: (input: string | Buffer): boolean => {
    const text = input.toString();
    return text.includes(',');
  }
};
