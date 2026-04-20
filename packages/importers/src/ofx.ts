import type { ImportResult, Importer } from './types';

export const OFX_IMPORTER: Importer = {
  name: 'OFX',
  supportedExtensions: ['.ofx', '.qfx'],
  parse: async (_input: string | Buffer): Promise<ImportResult> => {
    // TODO(impl): parse OFX/QFX SGML payload into normalized accounts and transactions.
    return { accounts: [], transactions: [], errors: [], warnings: [] };
  },
  detectFormat: (input: string | Buffer): boolean => {
    const text = input.toString();
    return text.includes('<OFX>');
  }
};
