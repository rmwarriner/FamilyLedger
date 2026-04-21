import { expect, test } from '@playwright/test';

const unlock = async (page: import('@playwright/test').Page): Promise<void> => {
  const gate = page.getByTestId('vault-gate');
  if ((await gate.count()) > 0) {
    await page.getByTestId('vault-passphrase').fill('familyledger');
    await page.getByTestId('vault-unlock-button').click();
    await expect(page.getByTestId('vault-gate')).toHaveCount(0);
  }
};

test('Transaction entry supports split reconciliation and keyboard save shortcut', async ({ page }) => {
  await page.goto('/transactions');
  await unlock(page);
  await expect(page.getByTestId('transaction-form')).toBeVisible();

  await page.getByLabel('Description').fill('Split grocery + rent');
  await page.getByTestId('transaction-amount').fill('60');
  await page.getByTestId('split-mode-toggle').check();
  await page.getByTestId('split-source-account').selectOption('acct-checking');

  await page.getByTestId('split-account-0').selectOption('acct-groceries');
  await page.getByTestId('split-amount-0').fill('40');
  await page.getByTestId('add-split-line').click();
  await page.getByTestId('split-account-1').selectOption('acct-rent');
  await page.getByTestId('split-amount-1').fill('10');
  await expect(page.getByTestId('split-imbalance-label')).toContainText('Remaining to balance: 10.00');

  await page.getByTestId('split-amount-1').fill('20');
  await expect(page.getByTestId('split-imbalance-label')).toContainText('Balanced');

  await page.getByPlaceholder('Optional details').fill('cmd-enter save');
  await page.getByPlaceholder('Optional details').press('Control+Enter');

  await expect(page.getByTestId('transaction-error')).toHaveCount(0);
  await expect(page.getByText('No transactions yet.')).toHaveCount(0);
  await expect(page.getByRole('cell', { name: 'Split grocery + rent' }).first()).toBeVisible();
});
