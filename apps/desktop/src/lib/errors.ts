export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface RecoveryAction {
  label: string;
  action: () => void;
}

export interface AppError {
  code: string;
  severity: ErrorSeverity;
  title: string;
  message: string;
  recovery: string;
  recoveryActions?: RecoveryAction[];
  technicalDetail?: string;
}

const dismissAction: RecoveryAction = { label: 'Dismiss', action: () => {} };

export const APP_ERRORS: Record<string, AppError> = {
  VAULT_UNLOCK_FAILURE: {
    code: 'VAULT_UNLOCK_FAILURE',
    severity: 'error',
    title: 'Could not unlock vault',
    message: 'The passphrase did not unlock this vault.',
    recovery: 'Re-enter your passphrase and verify keyboard layout.',
    recoveryActions: [dismissAction]
  },
  VAULT_FILE_MISSING_OR_CORRUPT: {
    code: 'VAULT_FILE_MISSING_OR_CORRUPT',
    severity: 'critical',
    title: 'Vault file unavailable',
    message: 'The vault file is missing or unreadable.',
    recovery: 'Restore the vault from backup or choose a different vault file.',
    recoveryActions: [dismissAction]
  },
  LEDGER_IMBALANCED: {
    code: 'LEDGER_IMBALANCED',
    severity: 'error',
    title: 'Transaction is not balanced',
    message: 'Postings do not sum to zero.',
    recovery: "The postings don't balance yet — the remaining amount is shown below.",
    recoveryActions: [dismissAction]
  },
  IMPORT_FORMAT_UNRECOGNIZED: {
    code: 'IMPORT_FORMAT_UNRECOGNIZED',
    severity: 'warning',
    title: 'Import format not recognized',
    message: 'The selected file format could not be identified.',
    recovery: 'Choose a supported source type or verify the file is not corrupted.',
    recoveryActions: [dismissAction]
  },
  IMPORT_DUPLICATE_DETECTED: {
    code: 'IMPORT_DUPLICATE_DETECTED',
    severity: 'info',
    title: 'Possible duplicate detected',
    message: 'One or more imported transactions match existing ledger entries.',
    recovery: 'Review duplicates and choose which items to skip before import.',
    recoveryActions: [dismissAction]
  },
  SYNC_CONFLICT_DETECTED: {
    code: 'SYNC_CONFLICT_DETECTED',
    severity: 'warning',
    title: 'Sync conflict detected',
    message: 'The same data was modified on multiple devices.',
    recovery: 'Open conflict resolution and confirm the preferred merged version.',
    recoveryActions: [dismissAction]
  },
  SIMPLEFIN_CONNECTION_FAILURE: {
    code: 'SIMPLEFIN_CONNECTION_FAILURE',
    severity: 'error',
    title: 'SimpleFIN connection failed',
    message: 'FamilyLedger could not connect to the SimpleFIN Bridge endpoint.',
    recovery: 'Validate your SimpleFIN access URL claim and retry the connection.',
    recoveryActions: [dismissAction]
  },
  AI_PROVIDER_UNAVAILABLE: {
    code: 'AI_PROVIDER_UNAVAILABLE',
    severity: 'warning',
    title: 'AI provider unavailable',
    message: 'The selected AI provider cannot be reached right now.',
    recovery: 'Check provider configuration and network access, then retry.',
    recoveryActions: [dismissAction]
  },
  DATABASE_MIGRATION_FAILURE: {
    code: 'DATABASE_MIGRATION_FAILURE',
    severity: 'critical',
    title: 'Database migration failed',
    message: 'FamilyLedger could not apply a required schema update.',
    recovery: 'Review migration logs and restore from a known-good backup before retrying.',
    recoveryActions: [dismissAction]
  },
  SCHEDULED_TRANSACTION_OVERDUE: {
    code: 'SCHEDULED_TRANSACTION_OVERDUE',
    severity: 'info',
    title: 'Scheduled transaction overdue',
    message: 'A scheduled transaction was not posted on time.',
    recovery: 'Review pending scheduled transactions and post or skip as needed.',
    recoveryActions: [dismissAction]
  }
};

export const mapUnknownError = (code: string): AppError =>
  APP_ERRORS[code] ?? {
    code: 'UNEXPECTED_ERROR',
    severity: 'error',
    title: 'Something went wrong',
    message: 'An unexpected application error occurred.',
    recovery: 'Try again. If the issue persists, open diagnostics and share details with support.',
    recoveryActions: [dismissAction]
  };
