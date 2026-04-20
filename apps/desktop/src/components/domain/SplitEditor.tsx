import type { JournalEntry } from '@familyledger/accounting-engine';

export interface SplitEditorProps {
  entry: JournalEntry;
  imbalanceLabel: string;
}

export const SplitEditor = ({ entry, imbalanceLabel }: SplitEditorProps): JSX.Element => {
  return (
    <section>
      <h3>Split Editor</h3>
      <p>Postings: {entry.postings.length}</p>
      <p>{imbalanceLabel}</p>
    </section>
  );
};
