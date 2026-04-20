import type { ImportResult, Importer, RawAccount, RawTransaction } from './types';

const safeParseJson = <T>(input: string): T | null => {
  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
};

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

export interface SimplefinClient {
  fetchAccounts(): Promise<RawAccount[]>;
  fetchTransactions(startDate: string, endDate: string): Promise<RawTransaction[]>;
}

export class SimplefinBridgeClient implements SimplefinClient {
  private readonly encryptedAccessUrl: string;

  constructor(encryptedAccessUrl: string) {
    this.encryptedAccessUrl = encryptedAccessUrl;
  }

  private getBaseUrl(): string | null {
    return isHttpUrl(this.encryptedAccessUrl) ? this.encryptedAccessUrl : null;
  }

  async fetchAccounts(): Promise<RawAccount[]> {
    const base = this.getBaseUrl();
    if (!base) {
      return [];
    }

    const response = await fetch(new URL('/accounts', base));
    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { accounts?: RawAccount[] };
    return payload.accounts ?? [];
  }

  async fetchTransactions(startDate: string, endDate: string): Promise<RawTransaction[]> {
    const base = this.getBaseUrl();
    if (!base) {
      return [];
    }

    const url = new URL('/transactions', base);
    url.searchParams.set('start_date', startDate);
    url.searchParams.set('end_date', endDate);

    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { transactions?: RawTransaction[] };
    return payload.transactions ?? [];
  }
}

interface SimplefinPayload {
  accounts?: RawAccount[];
  transactions?: RawTransaction[];
}

export const SIMPLEFIN_IMPORTER: Importer = {
  name: 'SimpleFIN Bridge',
  supportedExtensions: ['simplefin://claim-url', '.json'],
  parse: async (input: string | Buffer): Promise<ImportResult> => {
    const text = input.toString();
    const payload = safeParseJson<SimplefinPayload>(text);

    if (!payload) {
      return {
        accounts: [],
        transactions: [],
        errors: [{ code: 'SIMPLEFIN_INVALID_JSON', message: 'SimpleFIN payload must be valid JSON.' }],
        warnings: []
      };
    }

    return {
      accounts: payload.accounts ?? [],
      transactions: payload.transactions ?? [],
      errors: [],
      warnings: []
    };
  },
  detectFormat: (input: string | Buffer): boolean => {
    const text = input.toString().trim();
    if (text.startsWith('simplefin://')) {
      return true;
    }

    const payload = safeParseJson<SimplefinPayload>(text);
    return Boolean(payload && ('accounts' in payload || 'transactions' in payload));
  }
};
