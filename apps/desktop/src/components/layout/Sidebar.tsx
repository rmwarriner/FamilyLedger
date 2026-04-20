import { useUiStore } from '../../store/uiStore';

const navItems = [
  { to: '/accounts', label: 'Accounts' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/budgets', label: 'Budgets' },
  { to: '/reports', label: 'Reports' },
  { to: '/scheduled', label: 'Scheduled' },
  { to: '/import', label: 'Import' },
  { to: '/settings', label: 'Settings' },
  { to: '/audit-log', label: 'Audit Log' }
] as const;

export const Sidebar = (): JSX.Element => {
  const { sidebarCollapsed } = useUiStore();

  if (sidebarCollapsed) {
    return <aside style={{ background: 'var(--sidebar-bg)' }} aria-label="Sidebar collapsed" />;
  }

  return (
    <aside style={{ background: 'var(--sidebar-bg)', padding: 'var(--space-4)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)' }}>FamilyLedger</h2>
      <nav aria-label="Primary Navigation">
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {navItems.map((item) => (
            <li key={item.to} style={{ marginBottom: 'var(--space-2)' }}>
              <a
                href={item.to}
                style={{
                  borderLeft: '3px solid var(--color-accent)',
                  background: 'var(--color-accent-subtle)',
                  display: 'block',
                  padding: 'var(--space-2)'
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
