import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SIMPLEFIN_IMPORTER } from '../simplefin';

const fixture = fs.readFileSync(new URL('../__fixtures__/sample.simplefin.json', import.meta.url), 'utf8');

describe('simplefin importer', () => {
  it('parses fixture and maps into ImportResult', async () => {
    expect(SIMPLEFIN_IMPORTER.detectFormat(fixture)).toBe(true);

    const result = await SIMPLEFIN_IMPORTER.parse(fixture);
    expect(result).toEqual({
      accounts: [],
      transactions: [],
      errors: [],
      warnings: []
    });
  });
});
