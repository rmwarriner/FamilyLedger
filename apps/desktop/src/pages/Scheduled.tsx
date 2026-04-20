import { ScheduledTransactionList } from '../components/domain/ScheduledTransactionList';

export const Scheduled = (): JSX.Element => {
  return (
    <section>
      <h2>Scheduled</h2>
      <p>Review overdue templates and post scheduled entries into the transaction register.</p>
      <ScheduledTransactionList />
    </section>
  );
};
