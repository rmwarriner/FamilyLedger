import { TransactionForm } from '../components/domain/TransactionForm';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency } from '../lib/formatters';

export const Transactions = (): JSX.Element => {
  const { data: transactions = [], isLoading, isError, error } = useTransactions();

  return (
    <section>
      <h2>Transactions</h2>
      <TransactionForm />
      <h3 style={{ marginTop: 'var(--space-4)' }}>Recent Transactions</h3>
      {isLoading ? <p>Loading transactions...</p> : null}
      {isError ? <p>Unable to load transactions: {String(error)}</p> : null}
      {!isLoading && !isError ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">Date</th>
              <th align="left">Description</th>
              <th align="left">Payee</th>
              <th align="left">From</th>
              <th align="left">To</th>
              <th align="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.date}</td>
                <td>{transaction.description}</td>
                <td>{transaction.payee ?? '-'}</td>
                <td>{transaction.creditAccountName}</td>
                <td>{transaction.debitAccountName}</td>
                <td align="right">
                  {formatCurrency(Number(transaction.amount), transaction.currency, 'en-US')}
                </td>
              </tr>
            ))}
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6}>No transactions yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      ) : null}
    </section>
  );
};
