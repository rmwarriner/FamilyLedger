import type { ImportResult, Importer, RawAccount, RawTransaction } from './types';

const extractTag = (tag: string, source: string): string | null => {
  const paired = source.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  if (paired?.[1]) {
    return paired[1].trim();
  }

  const sgml = source.match(new RegExp(`<${tag}>([^<\\r\\n]+)`, 'i'));
  return sgml?.[1]?.trim() ?? null;
};

const extractTransactions = (text: string, accountImportedId: string): RawTransaction[] => {
  const blocks = Array.from(text.matchAll(/<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi));

  return blocks.map((block, index) => {
    const value = block[1] ?? '';
    const amountRaw = extractTag('TRNAMT', value) ?? '0';
    const amount = Number(amountRaw);

    return {
      importedId: extractTag('FITID', value) ?? `ofx:${index + 1}`,
      date: (extractTag('DTPOSTED', value) ?? '').slice(0, 8),
      payee: extractTag('NAME', value) ?? extractTag('MEMO', value) ?? 'Unknown Payee',
      amount: Number.isFinite(amount) ? amount.toFixed(2) : '0.00',
      accountImportedId,
      memo: extractTag('MEMO', value) ?? ''
    };
  });
};

export const OFX_IMPORTER: Importer = {
  name: 'OFX',
  supportedExtensions: ['.ofx', '.qfx'],
  parse: async (input: string | Buffer): Promise<ImportResult> => {
    const text = input.toString();
    const accountId = extractTag('ACCTID', text) ?? 'ofx:default-account';
    const accountType = extractTag('ACCTTYPE', text) ?? 'BANK';

    const accounts: RawAccount[] = [{
      importedId: accountId,
      name: `OFX ${accountType} ${accountId}`,
      type: accountType,
      currency: extractTag('CURDEF', text) ?? 'USD'
    }];

    return {
      accounts,
      transactions: extractTransactions(text, accountId),
      errors: [],
      warnings: []
    };
  },
  detectFormat: (input: string | Buffer): boolean => {
    const text = input.toString();
    return text.includes('<OFX>') || text.includes('OFXHEADER:');
  }
};
