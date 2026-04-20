import type { Account } from './types';

export const buildAccountPath = (account: Account, parent: Account | null): string =>
  parent ? `${parent.fullPath}:${account.name}` : account.name;

export const canPostToAccount = (account: Account): boolean => !account.isPlaceholder && !account.isClosed;
