import { gunzipSync } from 'node:zlib';
import type { ImportResult, Importer, RawAccount, RawTransaction } from './types';

const gzipHeader = Buffer.from([0x1f, 0x8b]);

const decodeXmlPayload = (input: string | Buffer): string => {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  if (buffer.subarray(0, 2).equals(gzipHeader)) {
    return gunzipSync(buffer).toString('utf8');
  }
  return buffer.toString('utf8');
};

const parseAccounts = (xml: string): RawAccount[] => {
  const matches = Array.from(xml.matchAll(/<act:id>([^<]+)<\/act:id>[\s\S]*?<act:name>([^<]+)<\/act:name>/g));
  if (matches.length === 0) {
    return [{ importedId: 'gnucash-xml:default', name: 'GnuCash XML Account', type: 'ASSET', currency: 'USD' }];
  }

  return matches.map((match) => ({
    importedId: match[1]!.trim(),
    name: match[2]!.trim(),
    type: 'ASSET',
    currency: 'USD'
  }));
};

const parseTransactions = (xml: string, accountImportedId: string): RawTransaction[] => {
  const txnMatches = Array.from(xml.matchAll(/<trn:id>([^<]+)<\/trn:id>[\s\S]*?<trn:date-posted>[\s\S]*?<ts:date>([^<]+)<\/ts:date>[\s\S]*?<trn:description>([^<]*)<\/trn:description>/g));

  return txnMatches.map((match, index) => ({
    importedId: match[1]!.trim(),
    date: match[2]!.trim().slice(0, 10),
    payee: match[3]!.trim() || `GnuCash XML Txn ${index + 1}`,
    amount: '0.00',
    accountImportedId,
    memo: 'Amount extraction pending split parsing'
  }));
};

export const GNUCASH_XML_IMPORTER: Importer = {
  name: 'GnuCash XML',
  supportedExtensions: ['.gnucash', '.xml', '.gz'],
  parse: async (input: string | Buffer): Promise<ImportResult> => {
    const xml = decodeXmlPayload(input);
    const accounts = parseAccounts(xml);
    const accountImportedId = accounts[0]?.importedId ?? 'gnucash-xml:default';
    const transactions = parseTransactions(xml, accountImportedId);

    const warnings = transactions.length === 0
      ? [{ code: 'GNUCASH_XML_NO_TRANSACTIONS', message: 'No transactions found in GnuCash XML payload.' }]
      : [];

    return {
      accounts,
      transactions,
      errors: [],
      warnings
    };
  },
  detectFormat: (input: string | Buffer): boolean => {
    const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
    if (buffer.length >= 2 && buffer.subarray(0, 2).equals(gzipHeader)) {
      return true;
    }

    const text = buffer.toString('utf8');
    return text.includes('<gnc-v2') || text.includes('gnc:book') || text.includes('<gnc:');
  }
};
