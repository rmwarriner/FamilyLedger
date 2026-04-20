import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GNUCASH_SQLITE_IMPORTER } from '../gnucash-sqlite';

const fixture = fs.readFileSync(new URL('../__fixtures__/sample.gnucash.sqlite', import.meta.url));

describe('gnucash-sqlite importer', () => {
  it('parses fixture and maps into ImportResult', async () => {
    expect(GNUCASH_SQLITE_IMPORTER.detectFormat(fixture)).toBe(false);

    const result = await GNUCASH_SQLITE_IMPORTER.parse(fixture);
    expect(result.accounts).toHaveLength(0);
    expect(result.transactions).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings[0]?.code).toBe('GNUCASH_SQLITE_BUFFER_UNSUPPORTED');
  });
});
