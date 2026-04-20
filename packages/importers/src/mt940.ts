import type { ImportResult, Importer } from './types';

export const MT940_IMPORTER: Importer = {
  name: 'MT940',
  supportedExtensions: ['.sta', '.mt940', '.txt'],
  parse: async (_input: string | Buffer): Promise<ImportResult> => {
    // TODO(impl): parse SWIFT MT940 records and normalize into FamilyLedger transactions.
    return { accounts: [], transactions: [], errors: [], warnings: [] };
  },
  detectFormat: (input: string | Buffer): boolean => {
    const text = input.toString();
    return text.includes(':20:') && text.includes(':61:');
  }
};
