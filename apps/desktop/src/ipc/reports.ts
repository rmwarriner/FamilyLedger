import { invoke } from '@tauri-apps/api/core';
import type { ReportOutput } from '@familyledger/reports';

export const runReport = async (id: string): Promise<ReportOutput> =>
  invoke<ReportOutput>('run_report', { id });
