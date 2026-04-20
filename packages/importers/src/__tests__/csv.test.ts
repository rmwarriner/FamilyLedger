import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CSV_IMPORTER } from '../csv';

const fixture = fs.readFileSync(new URL('../__fixtures__/sample.csv', import.meta.url), 'utf8');

describe('csv importer', () => {
  it('parses fixture and maps into ImportResult', async () => {
    expect(CSV_IMPORTER.detectFormat(fixture)).toBe(true);

    const result = await CSV_IMPORTER.parse(fixture);
    expect(result.errors).toHaveLength(0);
    expect(result.accounts).toHaveLength(1);
    expect(result.transactions).toEqual([
      {
        importedId: 'csv:2:2026-01-15:Example Payee',
        date: '2026-01-15',
        payee: 'Example Payee',
        amount: '-12.34',
        accountImportedId: 'csv:default-account',
        memo: ''
      }
    ]);
  });
});
