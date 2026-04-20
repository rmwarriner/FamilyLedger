import { useState } from 'react';
import { SplitEditor } from './SplitEditor';
import type { JournalEntry } from '@familyledger/accounting-engine';

export const TransactionForm = (): JSX.Element => {
  const [showSplits, setShowSplits] = useState(false);
  const entry: JournalEntry = {
    id: 'draft',
    date: new Date(),
    description: '',
    payee: null,
    postings: [],
    tags: [],
    attachments: [],
    isScheduled: false,
    scheduledId: null,
    importedFrom: null,
    importedId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'active-user'
  };

  return (
    <section>
      <h3>Transaction Entry</h3>
      <button onClick={() => setShowSplits((previous) => !previous)}>Add split</button>
      {showSplits ? (
        <SplitEditor
          entry={entry}
          imbalanceLabel={"The postings don't balance yet — the remaining amount is shown below."}
        />
      ) : null}
      {/* TODO(impl): implement payee autocomplete, account selector tree search, and natural amount parsing. */}
      {/* TODO(impl): add keyboard shortcuts Cmd/Ctrl+Enter to save and Escape to cancel. */}
    </section>
  );
};
