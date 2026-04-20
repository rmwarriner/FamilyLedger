import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { OFX_IMPORTER } from '../ofx';

const fixture = fs.readFileSync(new URL('../__fixtures__/sample.ofx', import.meta.url), 'utf8');

describe('ofx importer', () => {
  it('parses fixture and maps into ImportResult', async () => {
    expect(OFX_IMPORTER.detectFormat(fixture)).toBe(true);

    const result = await OFX_IMPORTER.parse(fixture);
    expect(result.errors).toHaveLength(0);
    expect(result.accounts).toEqual([
      {
        importedId: 'ofx:default-account',
        name: 'OFX BANK ofx:default-account',
        type: 'BANK',
        currency: 'USD'
      }
    ]);
    expect(result.transactions).toHaveLength(0);
  });
});
