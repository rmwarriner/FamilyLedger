import { BudgetEnvelopeGrid } from '../components/domain/BudgetEnvelopeGrid';
import { BudgetTrackingView } from '../components/domain/BudgetTrackingView';
import { useBudgets } from '../hooks/useBudgets';

export const Budgets = (): JSX.Element => {
  const { isLoading, isError, error, envelopes, tracking } = useBudgets();

  if (isLoading) {
    return <section>Loading budgets...</section>;
  }

  if (isError) {
    return <section>Unable to load budgets: {String(error)}</section>;
  }

  return (
    <section>
      <h2>Budgets</h2>
      <p>Envelope and tracking summaries are aggregated through the desktop backend command.</p>
      <BudgetEnvelopeGrid rows={envelopes} />
      <div style={{ height: 'var(--space-4)' }} />
      <BudgetTrackingView rows={tracking} />
    </section>
  );
};
