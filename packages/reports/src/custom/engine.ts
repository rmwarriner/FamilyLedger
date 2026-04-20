import type { LedgerState } from '@familyledger/accounting-engine';
import type { ReportOutput } from '../types';
import type { CustomReportDefinition } from './types';

export const evaluateCustomReport = (
  definition: CustomReportDefinition,
  ledger: LedgerState
): ReportOutput => {
  const rows = ledger.entries.map((entry, index) => ({
    id: `${definition.id}:${index + 1}`,
    values: {
      date: entry.date.toISOString().slice(0, 10),
      description: entry.description,
      postings: entry.postings.length,
      tags: entry.tags.join(',')
    }
  }));

  return {
    title: definition.name,
    subtitle: `Custom query: ${definition.query}`,
    columns: [
      { id: 'date', label: 'Date' },
      { id: 'description', label: 'Description' },
      { id: 'postings', label: 'Postings' },
      { id: 'tags', label: 'Tags' }
    ],
    rows,
    totals: {
      id: 'totals',
      values: {
        date: 'Total',
        description: '',
        postings: rows.reduce((sum, row) => sum + Number(row.values.postings), 0),
        tags: ''
      }
    },
    generatedAt: new Date(),
    parameters: { query: definition.query }
  };
};
