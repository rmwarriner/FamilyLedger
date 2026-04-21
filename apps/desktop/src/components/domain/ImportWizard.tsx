import { useMemo, useState } from 'react';
import { importData } from '../../ipc/imports';
import { Button } from '../primitives/Button';

type Step = 0 | 1 | 2 | 3 | 4;
type SourceType = 'CSV' | 'QIF' | 'OFX';

const labels = ['Select Source', 'Preview', 'Map Accounts', 'Review Duplicates', 'Confirm'];

const examplePayload: Record<SourceType, string> = {
  CSV: 'date,payee,amount\n2026-04-01,Coffee,-4.50\n2026-04-02,Groceries,-52.10',
  QIF: '!Type:Bank\nD04/01/2026\nTCoffee\nT-4.50\n^',
  OFX: 'OFXHEADER:100\n<OFX><BANKMSGSRSV1><STMTTRNRS><STMTRS><BANKTRANLIST><STMTTRN></STMTTRN></BANKTRANLIST></STMTRS></STMTTRNRS></BANKMSGSRSV1></OFX>'
};

export const ImportWizard = (): JSX.Element => {
  const [step, setStep] = useState<Step>(0);
  const [sourceType, setSourceType] = useState<SourceType>('CSV');
  const [payload, setPayload] = useState(examplePayload.CSV);
  const [mappedAccount, setMappedAccount] = useState('Assets:Checking');
  const [duplicatePolicy, setDuplicatePolicy] = useState<'skip' | 'import'>('skip');
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ accountsImported: number; transactionsImported: number; errors: string[] } | null>(
    null
  );
  const [finalResult, setFinalResult] = useState<{ accountsImported: number; transactionsImported: number; errors: string[] } | null>(
    null
  );
  const [isPending, setIsPending] = useState(false);

  const canGoBack = step > 0;
  const canGoForward = step < 4;
  const heading = useMemo(() => labels[step], [step]);

  const recoverableFailure = (): boolean => payload.trim().toLowerCase() === 'fail';

  const runPreview = async (): Promise<boolean> => {
    setInlineError(null);
    setIsPending(true);
    try {
      if (recoverableFailure()) {
        throw new Error('Preview failed. Edit the payload and retry.');
      }
      const result = await importData(payload);
      setPreview(result);
      if (result.errors.length > 0) {
        setInlineError(result.errors.join(' '));
        return false;
      }
      return true;
    } catch (error) {
      setInlineError(String(error));
      return false;
    } finally {
      setIsPending(false);
    }
  };

  const confirmImport = async (): Promise<void> => {
    setInlineError(null);
    setIsPending(true);
    try {
      if (recoverableFailure()) {
        throw new Error('Import failed. You can go back, fix input, and retry.');
      }
      const result = await importData(payload);
      setFinalResult(result);
      if (result.errors.length > 0) {
        setInlineError(result.errors.join(' '));
      }
    } catch (error) {
      setInlineError(String(error));
    } finally {
      setIsPending(false);
    }
  };

  const next = async (): Promise<void> => {
    if (step === 0) {
      if (!payload.trim()) {
        setInlineError('Source payload is required before preview.');
        return;
      }
      setInlineError(null);
      setStep(1);
      return;
    }
    if (step === 1) {
      const ok = await runPreview();
      if (!ok) return;
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!mappedAccount.trim()) {
        setInlineError('Select an account mapping before continuing.');
        return;
      }
      setInlineError(null);
      setStep(3);
      return;
    }
    if (step === 3) {
      setInlineError(null);
      setStep(4);
    }
  };

  const previous = (): void => {
    if (step > 0) {
      setInlineError(null);
      setStep((step - 1) as Step);
    }
  };

  return (
    <section data-testid="import-wizard" style={{ display: 'grid', gap: 'var(--space-3)', maxWidth: 760 }}>
      <h3>Import Wizard</h3>
      <p>
        Step {step + 1} of 5: {heading}
      </p>

      {step === 0 ? (
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          <label>
            Source type
            <select
              data-testid="import-source-type"
              value={sourceType}
              onChange={(event) => {
                const nextType = event.target.value as SourceType;
                setSourceType(nextType);
                setPayload(examplePayload[nextType]);
              }}
            >
              <option value="CSV">CSV</option>
              <option value="QIF">QIF</option>
              <option value="OFX">OFX</option>
            </select>
          </label>
          <label>
            Payload
            <textarea
              data-testid="import-payload"
              value={payload}
              onChange={(event) => setPayload(event.target.value)}
              rows={8}
              style={{ fontFamily: 'monospace' }}
            />
          </label>
          <p>Type `fail` as payload to simulate a recoverable import failure.</p>
        </div>
      ) : null}

      {step === 1 ? (
        <div data-testid="import-preview-step">
          <p>Preview validates format and estimates imported row counts.</p>
          <Button type="button" onClick={() => void runPreview()} disabled={isPending}>
            {isPending ? 'Validating...' : 'Run Preview'}
          </Button>
          {preview ? (
            <p data-testid="import-preview-summary">
              Accounts: {preview.accountsImported} | Transactions: {preview.transactionsImported}
            </p>
          ) : null}
        </div>
      ) : null}

      {step === 2 ? (
        <div data-testid="import-mapping-step">
          <label>
            Destination account mapping
            <select value={mappedAccount} onChange={(event) => setMappedAccount(event.target.value)}>
              <option value="Assets:Checking">Assets:Checking</option>
              <option value="Liabilities:Credit Card">Liabilities:Credit Card</option>
              <option value="Assets:Savings">Assets:Savings</option>
            </select>
          </label>
        </div>
      ) : null}

      {step === 3 ? (
        <div data-testid="import-dedup-step">
          <label>
            Duplicate policy
            <select value={duplicatePolicy} onChange={(event) => setDuplicatePolicy(event.target.value as 'skip' | 'import')}>
              <option value="skip">Skip duplicates</option>
              <option value="import">Import all rows</option>
            </select>
          </label>
        </div>
      ) : null}

      {step === 4 ? (
        <div data-testid="import-confirm-step">
          <p>Ready to import with mapping `{mappedAccount}` and duplicate policy `{duplicatePolicy}`.</p>
          <Button type="button" onClick={() => void confirmImport()} disabled={isPending}>
            {isPending ? 'Importing...' : 'Confirm Import'}
          </Button>
          {finalResult ? (
            <p data-testid="import-final-summary">
              Imported {finalResult.transactionsImported} transactions ({finalResult.accountsImported} accounts).
            </p>
          ) : null}
        </div>
      ) : null}

      {inlineError ? (
        <p role="alert" data-testid="import-inline-error" style={{ color: 'var(--color-danger, #b00020)' }}>
          {inlineError}
        </p>
      ) : null}

      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <Button type="button" onClick={previous} disabled={!canGoBack || isPending}>
          Back
        </Button>
        <Button type="button" onClick={() => void next()} disabled={!canGoForward || isPending}>
          Next
        </Button>
      </div>
    </section>
  );
};
