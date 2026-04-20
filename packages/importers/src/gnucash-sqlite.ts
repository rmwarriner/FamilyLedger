import Database from 'better-sqlite3';
import type { ImportResult, Importer } from './types';

export const GNUCASH_SQLITE_IMPORTER: Importer = {
  name: 'GnuCash SQLite',
  supportedExtensions: ['.sqlite3', '.db', '.gnucash'],
  parse: async (_input: string | Buffer): Promise<ImportResult> => {
    // TODO(impl): open GnuCash SQLite in read-only mode and extract accounts/transactions/splits.
    // TODO(impl): preserve GnuCash GUID values as importedId for deduplication.
    void Database;
    return { accounts: [], transactions: [], errors: [], warnings: [] };
  },
  detectFormat: (_input: string | Buffer): boolean => {
    // TODO(impl): detect GnuCash SQLite schema signatures.
    return false;
  }
};
