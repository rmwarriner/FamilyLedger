import { invoke } from '@tauri-apps/api/core';
import { isTauriRuntime, mockBackend } from './mockRuntime';

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
  isTauriRuntime()
    ? invoke<TransactionDto[]>('list_transactions')
    : mockBackend.listTransactions();

export const createTransaction = async (
  request: CreateTransactionRequest
): Promise<TransactionDto> =>
  isTauriRuntime()
    ? invoke<TransactionDto>('create_transaction', { request })
    : mockBackend.createTransaction({
        date: request.date,
        description: request.description,
        payee: request.payee,
        amount: request.amount,
        currency: 'USD',
        debitAccountId: request.debitAccountId,
        creditAccountId: request.creditAccountId,
        memo: request.memo
      });
