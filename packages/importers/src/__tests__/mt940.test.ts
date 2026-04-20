import { describe, expect, it } from 'vitest';
import { MT940_IMPORTER } from '../mt940';

describe('mt940 importer', () => {
  it('parses mt940 statement lines into transactions', async () => {
    const payload = [
      ':20:START',
      ':61:260115D12,34NTRFNONREF',
      ':86:Example Payee'
    ].join('\n');

    expect(MT940_IMPORTER.detectFormat(payload)).toBe(true);
    const result = await MT940_IMPORTER.parse(payload);

    expect(result.accounts).toHaveLength(1);
    expect(result.transactions).toEqual([
      {
        importedId: 'mt940:1',
        date: '2026-01-15',
        payee: 'Example Payee',
        amount: '-12.34',
        accountImportedId: 'mt940:default-account',
        memo: 'Example Payee'
      }
    ]);
  });
});
