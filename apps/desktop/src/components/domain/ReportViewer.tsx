import type { ReportOutputDto } from '../../ipc/reports';

export interface ReportViewerProps {
  report: ReportOutputDto | null;
}

export const ReportViewer = ({ report }: ReportViewerProps): JSX.Element => {
  if (!report) {
    return <section>Select a report to view output.</section>;
  }

  return (
    <section>
      <h3>{report.title}</h3>
      <p>{report.subtitle}</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {report.columns.map((column) => (
              <th key={column.id} align="left">{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {report.rows.map((row) => (
            <tr key={row.id}>
              {report.columns.map((column) => (
                <td key={`${row.id}:${column.id}`}>{String(row.values[column.id] ?? '')}</td>
              ))}
            </tr>
          ))}
          {report.totals ? (
            <tr>
              {report.columns.map((column) => (
                <td key={`totals:${column.id}`}><strong>{String(report.totals!.values[column.id] ?? '')}</strong></td>
              ))}
            </tr>
          ) : null}
        </tbody>
      </table>
      <p style={{ marginTop: 'var(--space-2)' }}>Generated: {report.generatedAt}</p>
    </section>
  );
};
