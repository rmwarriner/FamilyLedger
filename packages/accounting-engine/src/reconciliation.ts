import type { JournalEntry } from './types';

export const markEntryReconciled = (entry: JournalEntry, reconciledAt: Date): JournalEntry => ({
  ...entry,
  postings: entry.postings.map((posting) => ({ ...posting, reconciled: true, reconciledAt })),
  updatedAt: new Date()
});
