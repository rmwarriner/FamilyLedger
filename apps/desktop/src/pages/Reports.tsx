import { useState } from 'react';
import { ReportViewer } from '../components/domain/ReportViewer';
import { useReports } from '../hooks/useReports';

const reportOptions = [
  { id: 'account-register', label: 'Account Register' },
  { id: 'spending-by-category', label: 'Spending by Category' }
] as const;

export const Reports = (): JSX.Element => {
  const [selected, setSelected] = useState<string>(reportOptions[0]!.id);
  const reports = useReports();

  return (
    <section>
      <h2>Reports</h2>
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
        <select value={selected} onChange={(event) => setSelected(event.target.value)}>
          {reportOptions.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
        <button onClick={() => reports.mutate(selected)} disabled={reports.isPending}>
          {reports.isPending ? 'Running...' : 'Run Report'}
        </button>
      </div>
      {reports.isError ? <p>Report failed: {String(reports.error)}</p> : null}
      <ReportViewer report={reports.data ?? null} />
    </section>
  );
};
