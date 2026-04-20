import fs from 'node:fs';
import Database from 'better-sqlite3';
import type { ImportResult, Importer, RawAccount, RawTransaction } from './types';

const SQLITE_HEADER = 'SQLite format 3\u0000';

const hasGnuCashTables = (db: Database.Database): boolean => {
  const rows = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
    .all() as Array<{ name: string }>;
  const names = new Set(rows.map((row) => row.name.toLowerCase()));
  return names.has('accounts') && names.has('transactions') && names.has('splits');
};

const parseFromPath = (path: string): ImportResult => {
  const db = new Database(path, { readonly: true, fileMustExist: true });

  try {
    if (!hasGnuCashTables(db)) {
      return {
        accounts: [],
        transactions: [],
        errors: [{ code: 'GNUCASH_SQLITE_SCHEMA_MISMATCH', message: 'SQLite file does not match expected GnuCash schema.' }],
        warnings: []
      };
    }

    const accounts = (db
      .prepare('SELECT guid, name FROM accounts LIMIT 1000')
      .all() as Array<{ guid: string; name: string }>)
      .map((row) => ({
        importedId: row.guid,
        name: row.name,
        type: 'ASSET',
        currency: 'USD'
      } satisfies RawAccount));

    const transactions = (db
      .prepare('SELECT guid, post_date, description FROM transactions LIMIT 5000')
      .all() as Array<{ guid: string; post_date: string; description: string }>)
      .map((row) => ({
        importedId: row.guid,
        date: row.post_date.slice(0, 10),
        payee: row.description || 'GnuCash Transaction',
        amount: '0.00',
        accountImportedId: accounts[0]?.importedId ?? 'gnucash-sqlite:unknown-account',
        memo: 'Amount extraction pending split aggregation'
      } satisfies RawTransaction));

    return {
      accounts,
      transactions,
      errors: [],
      warnings: []
    };
  } finally {
    db.close();
  }
};

export const GNUCASH_SQLITE_IMPORTER: Importer = {
  name: 'GnuCash SQLite',
  supportedExtensions: ['.sqlite3', '.db', '.gnucash'],
  parse: async (input: string | Buffer): Promise<ImportResult> => {
    if (typeof input === 'string' && fs.existsSync(input)) {
      return parseFromPath(input);
    }

    return {
      accounts: [],
      transactions: [],
      errors: [],
      warnings: [{
        code: 'GNUCASH_SQLITE_BUFFER_UNSUPPORTED',
        message: 'SQLite importer requires a file path input for read-only parsing.'
      }]
    };
  },
  detectFormat: (input: string | Buffer): boolean => {
    if (Buffer.isBuffer(input)) {
      return input.subarray(0, SQLITE_HEADER.length).toString('utf8') === SQLITE_HEADER;
    }

    if (fs.existsSync(input)) {
      const header = fs.readFileSync(input, { encoding: 'utf8', flag: 'r' }).slice(0, SQLITE_HEADER.length);
      return header === SQLITE_HEADER;
    }

    return input.includes(SQLITE_HEADER);
  }
};
