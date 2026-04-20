import type { ImportResult, Importer, RawAccount, RawTransaction } from './types';

export interface SimplefinClient {
  fetchAccounts(): Promise<RawAccount[]>;
  fetchTransactions(startDate: string, endDate: string): Promise<RawTransaction[]>;
}

export class SimplefinBridgeClient implements SimplefinClient {
  private readonly encryptedAccessUrl: string;

  constructor(encryptedAccessUrl: string) {
    this.encryptedAccessUrl = encryptedAccessUrl;
  }

  async fetchAccounts(): Promise<RawAccount[]> {
    // TODO(impl): call SimpleFIN Bridge API /accounts endpoint using decrypted and validated access URL.
    void this.encryptedAccessUrl;
    return [];
  }

  async fetchTransactions(_startDate: string, _endDate: string): Promise<RawTransaction[]> {
    // TODO(impl): call SimpleFIN Bridge API /transactions endpoint with date filtering.
    return [];
  }
}

export const SIMPLEFIN_IMPORTER: Importer = {
  name: 'SimpleFIN Bridge',
  supportedExtensions: ['simplefin://claim-url'],
  parse: async (_input: string | Buffer): Promise<ImportResult> => {
    // TODO(impl): decode claim URL, exchange for access URL, encrypt access URL in vault settings.
    return { accounts: [], transactions: [], errors: [], warnings: [] };
  },
  detectFormat: (_input: string | Buffer): boolean => true
};
