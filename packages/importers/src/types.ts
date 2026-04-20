export interface RawAccount {
  importedId: string;
  name: string;
  type: string;
  currency: string;
}

export interface RawTransaction {
  importedId: string;
  date: string;
  payee: string;
  amount: string;
  accountImportedId: string;
  memo: string;
}

export interface ImportError {
  code: string;
  message: string;
  row?: number;
}

export interface ImportWarning {
  code: string;
  message: string;
  row?: number;
}

export interface ImportResult {
  accounts: RawAccount[];
  transactions: RawTransaction[];
  errors: ImportError[];
  warnings: ImportWarning[];
}

export interface Importer {
  name: string;
  supportedExtensions: string[];
  parse(input: string | Buffer): Promise<ImportResult>;
  detectFormat(input: string | Buffer): boolean;
}
