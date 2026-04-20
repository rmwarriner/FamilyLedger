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

const extractTagValueFrom = (source: string, tag: string, from = 0): { value: string; end: number } | null => {
  const open = `<${tag}>`;
  const close = `</${tag}>`;
  const start = source.indexOf(open, from);
  if (start < 0) {
    return null;
  }

  const valueStart = start + open.length;
  const valueEnd = source.indexOf(close, valueStart);
  if (valueEnd < 0) {
    return null;
  }

  return {
    value: source.slice(valueStart, valueEnd).trim(),
    end: valueEnd + close.length
  };
};

const parseAccounts = (xml: string): RawAccount[] => {
  const accounts: RawAccount[] = [];
  let cursor = 0;

  while (cursor < xml.length) {
    const idMatch = extractTagValueFrom(xml, 'act:id', cursor);
    if (!idMatch) {
      break;
    }

    const nameMatch = extractTagValueFrom(xml, 'act:name', idMatch.end);
    if (!nameMatch) {
      break;
    }

    accounts.push({
      importedId: idMatch.value,
      name: nameMatch.value,
      type: 'ASSET',
      currency: 'USD'
    });
    cursor = nameMatch.end;
  }

  if (accounts.length === 0) {
    return [{ importedId: 'gnucash-xml:default', name: 'GnuCash XML Account', type: 'ASSET', currency: 'USD' }];
  }

  return accounts;
};

const parseTransactions = (xml: string, accountImportedId: string): RawTransaction[] => {
  const transactions: RawTransaction[] = [];
  let cursor = 0;

  while (cursor < xml.length) {
    const idMatch = extractTagValueFrom(xml, 'trn:id', cursor);
    if (!idMatch) {
      break;
    }

    const dateMatch = extractTagValueFrom(xml, 'ts:date', idMatch.end);
    if (!dateMatch) {
      break;
    }

    const descriptionMatch = extractTagValueFrom(xml, 'trn:description', dateMatch.end);
    if (!descriptionMatch) {
      break;
    }

    transactions.push({
      importedId: idMatch.value,
      date: dateMatch.value.slice(0, 10),
      payee: descriptionMatch.value || `GnuCash XML Txn ${transactions.length + 1}`,
      amount: '0.00',
      accountImportedId,
      memo: 'Amount extraction pending split parsing'
    });

    cursor = descriptionMatch.end;
  }

  return transactions;
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
