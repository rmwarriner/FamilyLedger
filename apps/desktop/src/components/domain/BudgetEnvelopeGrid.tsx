import { formatCurrency } from '../../lib/formatters';
import type { BudgetViewModel } from '../../hooks/useBudgets';

export interface BudgetEnvelopeGridProps {
  rows: BudgetViewModel[];
}

export const BudgetEnvelopeGrid = ({ rows }: BudgetEnvelopeGridProps): JSX.Element => {
  if (rows.length === 0) {
    return <section>No envelope budgets available.</section>;
  }

  return (
    <section>
      <h3>Envelope Budgets</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Envelope</th>
            <th align="right">Target</th>
            <th align="right">Actual</th>
            <th align="right">Variance</th>
            <th align="left">Policy</th>
            <th align="right">Borrow Carryover</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td align="right">{formatCurrency(row.target, row.currency, 'en-US')}</td>
              <td align="right">{formatCurrency(row.actual, row.currency, 'en-US')}</td>
              <td align="right">{formatCurrency(row.variance, row.currency, 'en-US')}</td>
              <td>
                {row.overspendPolicy ?? 'N/A'}
                {row.rolloverEnabled ? ' • rollover on' : ' • rollover off'}
              </td>
              <td align="right">{formatCurrency(row.borrowCarryover, row.currency, 'en-US')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
