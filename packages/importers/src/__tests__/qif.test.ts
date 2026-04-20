import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { QIF_IMPORTER } from '../qif';

const fixture = fs.readFileSync(new URL('../__fixtures__/sample.qif', import.meta.url), 'utf8');

describe('qif importer', () => {
  it('parses fixture and maps into ImportResult', async () => {
    expect(QIF_IMPORTER.detectFormat(fixture)).toBe(true);

    const result = await QIF_IMPORTER.parse(fixture);
    expect(result.errors).toHaveLength(0);
    expect(result.accounts).toHaveLength(1);
    expect(result.transactions).toEqual([
      {
        importedId: 'qif:1:2026-01-15:Example Payee',
        date: '2026-01-15',
        payee: 'Example Payee',
        amount: '-12.34',
        accountImportedId: 'qif:default-account',
        memo: ''
      }
    ]);
  });
});
