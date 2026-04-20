import React from 'react';
import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Accounts } from './pages/Accounts';
import { Transactions } from './pages/Transactions';
import { Budgets } from './pages/Budgets';
import { Reports } from './pages/Reports';
import { Scheduled } from './pages/Scheduled';
import { Import } from './pages/Import';
import { Settings } from './pages/Settings';
import { AuditLog } from './pages/AuditLog';

const rootRoute = createRootRoute({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  )
});

const routes = [
  { path: '/', component: Dashboard },
  { path: '/accounts', component: Accounts },
  { path: '/transactions', component: Transactions },
  { path: '/budgets', component: Budgets },
  { path: '/reports', component: Reports },
  { path: '/scheduled', component: Scheduled },
  { path: '/import', component: Import },
  { path: '/settings', component: Settings },
  { path: '/audit-log', component: AuditLog }
].map((route) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path: route.path,
    component: route.component
  })
);

const routeTree = rootRoute.addChildren(routes);
export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
