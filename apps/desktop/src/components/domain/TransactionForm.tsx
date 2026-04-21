import { useMemo, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useAccounts } from '../../hooks/useAccounts';
import { useTransactions } from '../../hooks/useTransactions';
import { Button } from '../primitives/Button';
import { Input } from '../primitives/Input';
import { SplitEditor, type SplitLine } from './SplitEditor';

interface FormState {
  date: string;
  description: string;
  payee: string;
  amount: string;
  debitAccountId: string;
  creditAccountId: string;
  memo: string;
}

const todayIsoDate = (): string => new Date().toISOString().slice(0, 10);

const initialFormState = (): FormState => ({
  date: todayIsoDate(),
  description: '',
  payee: '',
  amount: '',
  debitAccountId: '',
  creditAccountId: '',
  memo: ''
});

const newSplitLine = (): SplitLine => ({
  id: `split-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  debitAccountId: '',
  amount: '',
  memo: ''
});

const isPositiveAmount = (value: string): boolean => {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) && parsed > 0;
};

export const TransactionForm = (): JSX.Element => {
  const [state, setState] = useState<FormState>(initialFormState());
  const [accountQuery, setAccountQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [useSplitMode, setUseSplitMode] = useState(false);
  const [splitSourceAccountId, setSplitSourceAccountId] = useState('');
  const [splitLines, setSplitLines] = useState<SplitLine[]>([newSplitLine()]);

  const { data: accounts = [], isLoading: isAccountsLoading } = useAccounts();
  const { data: transactions = [], create } = useTransactions();

  const filteredAccounts = useMemo(() => {
    if (!accountQuery.trim()) {
      return accounts;
    }

    const query = accountQuery.trim().toLowerCase();
    return accounts.filter((account) =>
      account.fullPath.toLowerCase().includes(query) ||
      account.name.toLowerCase().includes(query)
    );
  }, [accounts, accountQuery]);

  const payeeSuggestions = useMemo(() => {
    const seen = new Set<string>();
    const values: string[] = [];

    for (const transaction of transactions) {
      const payee = transaction.payee?.trim();
      if (!payee || seen.has(payee.toLowerCase())) {
        continue;
      }
      seen.add(payee.toLowerCase());
      values.push(payee);
    }

    return values.slice(0, 20);
  }, [transactions]);

  const resetForm = (): void => {
    setState(initialFormState());
    setErrorMessage(null);
    setAccountQuery('');
    setUseSplitMode(false);
    setSplitSourceAccountId('');
    setSplitLines([newSplitLine()]);
  };

  const totalAmount = Number(state.amount) || 0;
  const splitTotal = splitLines.reduce((sum, line) => {
    const parsed = Number(line.amount);
    return sum + (Number.isFinite(parsed) ? parsed : 0);
  }, 0);
  const splitImbalance = Number((totalAmount - splitTotal).toFixed(2));
  const splitImbalanceLabel =
    splitImbalance === 0
      ? 'Balanced: split amounts match transaction amount.'
      : `Remaining to balance: ${splitImbalance.toFixed(2)}`;

  const validate = (): string | null => {
    if (!state.description.trim()) {
      return 'Description is required.';
    }
    if (!isPositiveAmount(state.amount)) {
      return 'Amount must be a positive number.';
    }
    if (useSplitMode) {
      if (!splitSourceAccountId) {
        return 'Select a split source account.';
      }
      if (splitLines.some((line) => !line.debitAccountId || !isPositiveAmount(line.amount))) {
        return 'Each split line needs a debit account and positive amount.';
      }
      if (splitLines.some((line) => line.debitAccountId === splitSourceAccountId)) {
        return 'Split debit account cannot match source account.';
      }
      if (splitImbalance !== 0) {
        return `Split amounts are imbalanced by ${splitImbalance.toFixed(2)}.`;
      }
      return null;
    }
    if (!state.debitAccountId) {
      return 'Select a debit account.';
    }
    if (!state.creditAccountId) {
      return 'Select a credit account.';
    }
    if (state.debitAccountId === state.creditAccountId) {
      return 'Debit and credit accounts must be different.';
    }
    return null;
  };

  const submit = async (event?: FormEvent): Promise<void> => {
    event?.preventDefault();
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      if (useSplitMode) {
        for (const line of splitLines) {
          await create.mutateAsync({
            date: state.date,
            description: state.description,
            payee: state.payee.trim() || null,
            amount: line.amount,
            debitAccountId: line.debitAccountId,
            creditAccountId: splitSourceAccountId,
            memo: line.memo.trim() || state.memo.trim() || null
          });
        }
      } else {
        await create.mutateAsync({
          date: state.date,
          description: state.description,
          payee: state.payee.trim() || null,
          amount: state.amount,
          debitAccountId: state.debitAccountId,
          creditAccountId: state.creditAccountId,
          memo: state.memo.trim() || null
        });
      }
      resetForm();
    } catch (error) {
      setErrorMessage(String(error));
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>): void => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      void submit();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      resetForm();
    }
  };

  return (
    <section data-testid="transaction-form">
      <h3>Transaction Entry</h3>
      <p>Save with Cmd/Ctrl+Enter. Reset with Escape.</p>
      <form onSubmit={(event) => void submit(event)} onKeyDown={handleKeyDown}>
        <div style={{ display: 'grid', gap: 'var(--space-2)', maxWidth: '40rem' }}>
          <label>
            Date
            <Input
              type="date"
              value={state.date}
              onChange={(event) => setState((previous) => ({ ...previous, date: event.target.value }))}
            />
          </label>

          <label>
            Description
            <Input
              value={state.description}
              onChange={(event) =>
                setState((previous) => ({ ...previous, description: event.target.value }))
              }
              placeholder="What happened?"
            />
          </label>

          <label>
            Payee
            <Input
              value={state.payee}
              list="payee-suggestions"
              onChange={(event) => setState((previous) => ({ ...previous, payee: event.target.value }))}
              placeholder="Start typing to see recent payees"
            />
            <datalist id="payee-suggestions">
              {payeeSuggestions.map((payee) => (
                <option key={payee} value={payee} />
              ))}
            </datalist>
          </label>

          <label>
            Amount
            <Input
              data-testid="transaction-amount"
              inputMode="decimal"
              value={state.amount}
              onChange={(event) => setState((previous) => ({ ...previous, amount: event.target.value }))}
              placeholder="0.00"
            />
          </label>

          <label>
            <input
              data-testid="split-mode-toggle"
              type="checkbox"
              checked={useSplitMode}
              onChange={(event) => setUseSplitMode(event.target.checked)}
            />
            Use split editor
          </label>

          <label>
            Account Search
            <Input
              value={accountQuery}
              onChange={(event) => setAccountQuery(event.target.value)}
              placeholder="Filter account tree paths"
            />
          </label>

          {!useSplitMode ? (
            <>
              <label>
                Debit Account
                <select
                  value={state.debitAccountId}
                  onChange={(event) =>
                    setState((previous) => ({ ...previous, debitAccountId: event.target.value }))
                  }
                  disabled={isAccountsLoading}
                  data-testid="debit-account"
                >
                  <option value="">Select debit account</option>
                  {filteredAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.fullPath}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Credit Account
                <select
                  value={state.creditAccountId}
                  onChange={(event) =>
                    setState((previous) => ({ ...previous, creditAccountId: event.target.value }))
                  }
                  disabled={isAccountsLoading}
                  data-testid="credit-account"
                >
                  <option value="">Select credit account</option>
                  {filteredAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.fullPath}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            <SplitEditor
              lines={splitLines}
              accounts={filteredAccounts}
              sourceAccountId={splitSourceAccountId}
              onSourceAccountChange={(value) => setSplitSourceAccountId(value)}
              onLineChange={(lineId, patch) =>
                setSplitLines((previous) =>
                  previous.map((line) => (line.id === lineId ? { ...line, ...patch } : line))
                )
              }
              onAddLine={() => setSplitLines((previous) => [...previous, newSplitLine()])}
              onRemoveLine={(lineId) =>
                setSplitLines((previous) =>
                  previous.length > 1 ? previous.filter((line) => line.id !== lineId) : previous
                )
              }
              imbalanceLabel={splitImbalanceLabel}
            />
          )}

          <label>
            Memo
            <Input
              value={state.memo}
              onChange={(event) => setState((previous) => ({ ...previous, memo: event.target.value }))}
              placeholder="Optional details"
            />
          </label>
        </div>

        {errorMessage ? (
          <p role="alert" data-testid="transaction-error" style={{ color: 'var(--color-danger, #b00020)' }}>
            {errorMessage}
          </p>
        ) : null}

        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? 'Saving...' : 'Save Transaction'}
          </Button>
          <Button type="button" onClick={resetForm}>
            Cancel
          </Button>
        </div>
      </form>
    </section>
  );
};
