import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryAuditLog, verifyAuditIntegrity } from '../ipc/audit';

export const AuditLog = (): JSX.Element => {
  const [page, setPage] = useState(1);
  const [tableName, setTableName] = useState('');
  const [operation, setOperation] = useState('');
  const integrity = useQuery({
    queryKey: ['audit', 'integrity'],
    queryFn: async () => verifyAuditIntegrity(),
    staleTime: 30_000,
    refetchInterval: 60_000
  });
  const events = useQuery({
    queryKey: ['audit', 'events', page, tableName, operation],
    queryFn: async () => {
      const request: { page: number; pageSize: number; tableName?: string; operation?: string } = {
        page,
        pageSize: 25
      };
      if (tableName) request.tableName = tableName;
      if (operation) request.operation = operation;
      return queryAuditLog(request);
    },
    staleTime: 10_000
  });
  const totalPages = events.data ? Math.max(1, Math.ceil(events.data.total / events.data.pageSize)) : 1;

  return (
    <section style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <h1>Audit Log</h1>
      <p>
        Integrity:{' '}
        {integrity.isLoading
          ? 'Checking...'
          : integrity.data?.valid
            ? 'Valid hash chain'
            : `Integrity check failed${integrity.data?.firstInvalidEventId ? ` at ${integrity.data.firstInvalidEventId}` : ''}`}
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        <input
          placeholder="Filter table (e.g. postings)"
          value={tableName}
          onChange={(event) => {
            setPage(1);
            setTableName(event.target.value);
          }}
        />
        <select
          value={operation}
          onChange={(event) => {
            setPage(1);
            setOperation(event.target.value);
          }}
        >
          <option value="">All operations</option>
          <option value="INSERT">INSERT</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>When</th>
            <th>Operation</th>
            <th>Table</th>
            <th>Record</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          {events.data?.items.map((item) => (
            <tr key={item.id}>
              <td>{new Date(item.occurredAt).toLocaleString()}</td>
              <td>{item.operation}</td>
              <td>{item.tableName}</td>
              <td>{item.recordId}</td>
              <td>{item.userId}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {events.isLoading ? <p>Loading audit events…</p> : null}
      {events.error ? <p>Failed to load audit events.</p> : null}
      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
          Next
        </button>
      </div>
    </section>
  );
};
