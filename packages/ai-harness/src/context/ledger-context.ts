export interface LedgerContextInput {
  payees: string[];
  amounts: number[];
  categories: string[];
}

export const buildScrubbedLedgerContext = (input: LedgerContextInput): string => {
  const rounded = input.amounts.map((amount) => Math.round(amount / 10) * 10);
  const payeeCategories = input.payees.map((_payee, index) => input.categories[index] ?? 'Uncategorized');

  return [
    'Ledger Context (Scrubbed):',
    `AmountsRoundedToNearest10: ${rounded.join(', ')}`,
    `PayeeCategoriesOnly: ${payeeCategories.join(', ')}`,
    'PIIExcluded: account numbers, institution names, and direct payee names removed'
  ].join('\n');
};
