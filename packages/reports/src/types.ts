import type { LedgerState } from '@familyledger/accounting-engine';

export interface ReportParameter {
  id: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'select';
  required: boolean;
}

export type ReportParams = Record<string, string | number | boolean | null>;

export interface ReportColumn {
  id: string;
  label: string;
}

export interface ReportRow {
  id: string;
  values: Record<string, string | number>;
}

export interface ReportOutput {
  title: string;
  subtitle: string;
  columns: ReportColumn[];
  rows: ReportRow[];
  totals: ReportRow | null;
  generatedAt: Date;
  parameters: ReportParams;
}

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  parameters: ReportParameter[];
  run(params: ReportParams, ledger: LedgerState): ReportOutput;
}
