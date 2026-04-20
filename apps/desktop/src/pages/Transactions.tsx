import { TransactionForm } from '../components/domain/TransactionForm';

export const Transactions = (): JSX.Element => {
  return (
    <section>
      <h2>Transactions</h2>
      <TransactionForm />
    </section>
  );
};
