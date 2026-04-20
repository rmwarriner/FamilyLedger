import { invoke } from '@tauri-apps/api/core';

export interface ReportColumnDto {
  id: string;
  label: string;
}

export interface ReportRowDto {
  id: string;
  values: Record<string, string | number | boolean | null>;
}

export interface ReportOutputDto {
  title: string;
  subtitle: string;
  columns: ReportColumnDto[];
  rows: ReportRowDto[];
  totals: ReportRowDto | null;
  generatedAt: string;
  parameters: Record<string, string | number | boolean | null>;
}

export const runReport = async (id: string): Promise<ReportOutputDto> =>
  invoke<ReportOutputDto>('run_report', { id });
