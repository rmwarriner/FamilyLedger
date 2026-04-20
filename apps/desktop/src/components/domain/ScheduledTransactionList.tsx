import { useScheduled } from '../../hooks/useScheduled';

export const ScheduledTransactionList = (): JSX.Element => {
  const { data = [], isLoading, isError, error, post } = useScheduled();

  if (isLoading) {
    return <section>Loading scheduled transactions...</section>;
  }

  if (isError) {
    return <section>Unable to load scheduled transactions: {String(error)}</section>;
  }

  return (
    <section>
      <h3>Scheduled Transactions</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Description</th>
            <th align="left">Due</th>
            <th align="right">Amount</th>
            <th align="left">Mode</th>
            <th align="left">Status</th>
            <th align="left">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.description}</td>
              <td>{item.dueAt}</td>
              <td align="right">{item.amount}</td>
              <td>{item.autoPost ? 'Auto-post' : 'Manual review'}</td>
              <td>{item.isOverdue ? 'Overdue' : 'Upcoming'}</td>
              <td>
                <button
                  onClick={() => post.mutate(item.id)}
                  disabled={post.isPending}
                >
                  Post now
                </button>
              </td>
            </tr>
          ))}
          {data.length === 0 ? (
            <tr>
              <td colSpan={6}>No scheduled transactions configured.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </section>
  );
};
