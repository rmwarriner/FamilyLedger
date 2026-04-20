import { invoke } from '@tauri-apps/api/core';

export interface TransactionDto {
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

export interface CreateTransactionRequest {
  date: string;
  description: string;
  payee: string | null;
  amount: string;
  debitAccountId: string;
  creditAccountId: string;
  memo: string | null;
}

export const listTransactions = async (): Promise<TransactionDto[]> =>
  invoke<TransactionDto[]>('list_transactions');

export const createTransaction = async (
  request: CreateTransactionRequest
): Promise<TransactionDto> =>
  invoke<TransactionDto>('create_transaction', { request });
