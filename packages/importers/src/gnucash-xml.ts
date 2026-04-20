import type { ImportResult, Importer } from './types';

export const GNUCASH_XML_IMPORTER: Importer = {
  name: 'GnuCash XML',
  supportedExtensions: ['.gnucash', '.xml', '.gz'],
  parse: async (_input: string | Buffer): Promise<ImportResult> => {
    // TODO(impl): parse gzipped GnuCash XML, map account types, and split transactions to Posting[] model.
    // TODO(impl): preserve GnuCash GUID values as importedId for transaction and account deduplication.
    return { accounts: [], transactions: [], errors: [], warnings: [] };
  },
  detectFormat: (_input: string | Buffer): boolean => {
    // TODO(impl): detect GnuCash XML markers and gzip magic bytes.
    return false;
  }
};
