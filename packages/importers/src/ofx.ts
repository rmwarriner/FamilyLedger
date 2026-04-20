import type { ImportResult, Importer, RawAccount, RawTransaction } from './types';
import { finalizeImportResult } from './normalize';

const extractTagValue = (source: string, tag: string): string | null => {
  const upperSource = source.toUpperCase();
  const upperTag = tag.toUpperCase();
  const openTag = `<${upperTag}>`;
  const closeTag = `</${upperTag}>`;

  const start = upperSource.indexOf(openTag);
  if (start < 0) {
    return null;
  }

  const valueStart = start + openTag.length;
  const closeIndex = upperSource.indexOf(closeTag, valueStart);
  const nextTagIndex = upperSource.indexOf('<', valueStart);
  const newlineIndex = source.indexOf('\n', valueStart);

  const candidateEnds = [closeIndex, nextTagIndex, newlineIndex].filter((index) => index >= 0);
  const end = candidateEnds.length > 0
    ? Math.min(...candidateEnds)
    : source.length;

  return source.slice(valueStart, end).trim() || null;
};

const extractBlocks = (source: string, startTag: string, endTag: string): string[] => {
  const upperSource = source.toUpperCase();
  const upperStartTag = startTag.toUpperCase();
  const upperEndTag = endTag.toUpperCase();

  const blocks: string[] = [];
  let cursor = 0;

  while (cursor < source.length) {
    const start = upperSource.indexOf(upperStartTag, cursor);
    if (start < 0) {
      break;
    }

    const contentStart = start + upperStartTag.length;
    const end = upperSource.indexOf(upperEndTag, contentStart);
    if (end < 0) {
      break;
    }

    blocks.push(source.slice(contentStart, end));
    cursor = end + upperEndTag.length;
  }

  return blocks;
};

const extractTransactions = (text: string, accountImportedId: string): RawTransaction[] => {
  const blocks = extractBlocks(text, '<STMTTRN>', '</STMTTRN>');

  return blocks.map((value, index) => {
    const amountRaw = extractTagValue(value, 'TRNAMT') ?? '0';
    const amount = Number(amountRaw);

    return {
      importedId: extractTagValue(value, 'FITID') ?? `ofx:${index + 1}`,
      date: (extractTagValue(value, 'DTPOSTED') ?? '').slice(0, 8),
      payee: extractTagValue(value, 'NAME') ?? extractTagValue(value, 'MEMO') ?? 'Unknown Payee',
      amount: Number.isFinite(amount) ? amount.toFixed(2) : '0.00',
      accountImportedId,
      memo: extractTagValue(value, 'MEMO') ?? ''
    };
  });
};

export const OFX_IMPORTER: Importer = {
  name: 'OFX',
  supportedExtensions: ['.ofx', '.qfx'],
  parse: async (input: string | Buffer): Promise<ImportResult> => {
    const text = input.toString();
    const accountId = extractTagValue(text, 'ACCTID') ?? 'ofx:default-account';
    const accountType = extractTagValue(text, 'ACCTTYPE') ?? 'BANK';

    const accounts: RawAccount[] = [{
      importedId: accountId,
      name: `OFX ${accountType} ${accountId}`,
      type: accountType,
      currency: extractTagValue(text, 'CURDEF') ?? 'USD'
    }];

    return finalizeImportResult({
      accounts,
      transactions: extractTransactions(text, accountId),
      errors: [],
      warnings: []
    }, 'ofx');
  },
  detectFormat: (input: string | Buffer): boolean => {
    const text = input.toString();
    return text.includes('<OFX>') || text.includes('OFXHEADER:');
  }
};
