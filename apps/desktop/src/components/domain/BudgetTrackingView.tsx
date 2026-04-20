import { formatCurrency } from '../../lib/formatters';
import type { BudgetViewModel } from '../../hooks/useBudgets';

export interface BudgetTrackingViewProps {
  rows: BudgetViewModel[];
}

export const BudgetTrackingView = ({ rows }: BudgetTrackingViewProps): JSX.Element => {
  if (rows.length === 0) {
    return <section>No tracking budgets available.</section>;
  }

  return (
    <section>
      <h3>Tracking Budgets</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Category</th>
            <th align="right">Target</th>
            <th align="right">Actual</th>
            <th align="right">Variance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td align="right">{formatCurrency(row.target, row.currency, 'en-US')}</td>
              <td align="right">{formatCurrency(row.actual, row.currency, 'en-US')}</td>
              <td align="right">{formatCurrency(row.variance, row.currency, 'en-US')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
