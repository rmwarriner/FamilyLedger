export const isTauriRuntime = (): boolean =>
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export interface MockAccount {
  id: string;
  name: string;
  fullPath: string;
  currency: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
}

export interface MockTransaction {
  id: string;
  date: string;
  description: string;
  payee: string | null;
  amount: string;
  currency: string;
  debitAccountId: string;
  debitAccountName: string;
  creditAccountId: string;
  creditAccountName: string;
  memo: string | null;
}

const mockAccounts: MockAccount[] = [
  {
    id: 'acct-checking',
    name: 'Checking',
    fullPath: 'Assets:Checking',
    currency: 'USD',
    accountType: 'ASSET'
  },
  {
    id: 'acct-groceries',
    name: 'Groceries',
    fullPath: 'Expenses:Groceries',
    currency: 'USD',
    accountType: 'EXPENSE'
  },
  {
    id: 'acct-rent',
    name: 'Rent',
    fullPath: 'Expenses:Rent',
    currency: 'USD',
    accountType: 'EXPENSE'
  },
  {
    id: 'acct-income',
    name: 'Salary',
    fullPath: 'Income:Salary',
    currency: 'USD',
    accountType: 'INCOME'
  }
];

const mockTransactions: MockTransaction[] = [];

export const mockBackend = {
  listAccounts: (): MockAccount[] => mockAccounts.slice(),
  listTransactions: (): MockTransaction[] => mockTransactions.slice().reverse(),
  createTransaction: (transaction: Omit<MockTransaction, 'id' | 'debitAccountName' | 'creditAccountName'>): MockTransaction => {
    const debit = mockAccounts.find((account) => account.id === transaction.debitAccountId);
    const credit = mockAccounts.find((account) => account.id === transaction.creditAccountId);
    if (!debit || !credit) {
      throw new Error('Unknown account id');
    }
    const created: MockTransaction = {
      ...transaction,
      id: `tx-${Date.now()}-${mockTransactions.length + 1}`,
      debitAccountName: debit.name,
      creditAccountName: credit.name
    };
    mockTransactions.push(created);
    return created;
  },
  importData: (payload: string): { accountsImported: number; transactionsImported: number; errors: string[] } => {
    const firstLine = payload.split('\n')[0]?.toLowerCase() ?? '';
    const rowCount = payload
      .split('\n')
      .slice(1)
      .filter((line) => line.trim().length > 0).length;
    if (firstLine.includes('date') && firstLine.includes(',')) {
      return {
        accountsImported: rowCount > 0 ? 1 : 0,
        transactionsImported: rowCount,
        errors: []
      };
    }
    if (payload.includes('!Type:')) {
      const txCount = payload.split('\n').filter((line) => line.trim() === '^').length;
      return {
        accountsImported: txCount > 0 ? 1 : 0,
        transactionsImported: txCount,
        errors: []
      };
    }
    if (payload.includes('<OFX>') || payload.includes('OFXHEADER:')) {
      const txCount = payload.match(/<STMTTRN>/g)?.length ?? 0;
      return {
        accountsImported: txCount > 0 ? 1 : 0,
        transactionsImported: txCount,
        errors: []
      };
    }
    return {
      accountsImported: 0,
      transactionsImported: 0,
      errors: ['Unsupported import format']
    };
  },
  unlockVault: (passphrase: string): boolean => passphrase === 'familyledger'
};
