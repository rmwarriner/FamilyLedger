import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GNUCASH_XML_IMPORTER } from '../gnucash-xml';

const fixture = fs.readFileSync(new URL('../__fixtures__/sample.gnucash.xml', import.meta.url), 'utf8');

describe('gnucash-xml importer', () => {
  it('parses fixture and maps into ImportResult', async () => {
    expect(GNUCASH_XML_IMPORTER.detectFormat(fixture)).toBe(true);

    const result = await GNUCASH_XML_IMPORTER.parse(fixture);
    expect(result.errors).toHaveLength(0);
    expect(result.accounts).toEqual([
      {
        importedId: 'gnucash-xml:default',
        name: 'GnuCash XML Account',
        type: 'ASSET',
        currency: 'USD'
      }
    ]);
    expect(result.transactions).toHaveLength(0);
    expect(result.warnings[0]?.code).toBe('GNUCASH_XML_NO_TRANSACTIONS');
  });
});
