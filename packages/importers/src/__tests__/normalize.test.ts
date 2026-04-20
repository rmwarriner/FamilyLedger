import { describe, expect, it } from 'vitest';
import { finalizeImportResult } from '../normalize';

describe('importer normalization and dedup', () => {
  it('normalizes dates/currency/amounts and removes duplicate transactions', () => {
    const result = finalizeImportResult({
      accounts: [
        { importedId: ' acct-1 ', name: ' Checking ', type: 'asset', currency: 'usd ' },
        { importedId: 'acct-1', name: 'Duplicate', type: 'asset', currency: 'usd' }
      ],
      transactions: [
        {
          importedId: 'tx-1',
          date: "01/15'26",
          payee: ' Grocery Store ',
          amount: '-12.3',
          accountImportedId: ' acct-1 ',
          memo: ' weekly '
        },
        {
          importedId: 'tx-2',
          date: '2026-01-15',
          payee: 'grocery store',
          amount: '-12.30',
          accountImportedId: 'acct-1',
          memo: 'dupe by fingerprint'
        },
        {
          importedId: 'tx-1',
          date: '2026-01-15',
          payee: 'duplicate id',
          amount: '-9.00',
          accountImportedId: 'acct-1',
          memo: ''
        }
      ],
      errors: [],
      warnings: []
    }, 'test');

    expect(result.accounts).toEqual([
      { importedId: 'acct-1', name: 'Checking', type: 'ASSET', currency: 'USD' }
    ]);
    expect(result.transactions).toEqual([
      {
        importedId: 'tx-1',
        date: '2026-01-15',
        payee: 'Grocery Store',
        amount: '-12.30',
        accountImportedId: 'acct-1',
        memo: 'weekly'
      }
    ]);
    expect(result.warnings.map((warning) => warning.code)).toEqual([
      'IMPORT_DUPLICATE_ACCOUNT',
      'IMPORT_DUPLICATE_TRANSACTION_FINGERPRINT',
      'IMPORT_DUPLICATE_TRANSACTION_ID'
    ]);
  });
});

