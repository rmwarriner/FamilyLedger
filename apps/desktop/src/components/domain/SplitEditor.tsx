import { Button } from '../primitives/Button';
import type { AccountDto } from '../../ipc/accounts';

export interface SplitLine {
  id: string;
  debitAccountId: string;
  amount: string;
  memo: string;
}

export interface SplitEditorProps {
  lines: SplitLine[];
  accounts: AccountDto[];
  sourceAccountId: string;
  onSourceAccountChange: (accountId: string) => void;
  onLineChange: (lineId: string, patch: Partial<SplitLine>) => void;
  onAddLine: () => void;
  onRemoveLine: (lineId: string) => void;
  imbalanceLabel: string;
}

export const SplitEditor = ({
  lines,
  accounts,
  sourceAccountId,
  onSourceAccountChange,
  onLineChange,
  onAddLine,
  onRemoveLine,
  imbalanceLabel
}: SplitEditorProps): JSX.Element => {
  return (
    <section aria-label="Split editor" data-testid="split-editor" style={{ display: 'grid', gap: 'var(--space-2)' }}>
      <h4>Split Editor</h4>
      <label>
        Source account (credit side)
        <select
          data-testid="split-source-account"
          value={sourceAccountId}
          onChange={(event) => onSourceAccountChange(event.target.value)}
        >
          <option value="">Select source account</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.fullPath}
            </option>
          ))}
        </select>
      </label>

      {lines.map((line, index) => (
        <fieldset
          key={line.id}
          style={{ display: 'grid', gap: 'var(--space-2)', border: '1px solid var(--color-border, #ddd)' }}
        >
          <legend>Split Line {index + 1}</legend>
          <label>
            Debit account
            <select
              data-testid={`split-account-${index}`}
              value={line.debitAccountId}
              onChange={(event) => onLineChange(line.id, { debitAccountId: event.target.value })}
            >
              <option value="">Select debit account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.fullPath}
                </option>
              ))}
            </select>
          </label>
          <label>
            Amount
            <input
              data-testid={`split-amount-${index}`}
              value={line.amount}
              inputMode="decimal"
              onChange={(event) => onLineChange(line.id, { amount: event.target.value })}
              placeholder="0.00"
            />
          </label>
          <label>
            Memo
            <input
              value={line.memo}
              onChange={(event) => onLineChange(line.id, { memo: event.target.value })}
              placeholder="Optional split memo"
            />
          </label>
          <Button type="button" onClick={() => onRemoveLine(line.id)} disabled={lines.length === 1}>
            Remove split line
          </Button>
        </fieldset>
      ))}

      <Button type="button" onClick={onAddLine} data-testid="add-split-line">
        Add split line
      </Button>
      <p data-testid="split-imbalance-label">{imbalanceLabel}</p>
    </section>
  );
};
