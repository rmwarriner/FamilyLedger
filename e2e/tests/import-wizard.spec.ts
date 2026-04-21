import { expect, test } from '@playwright/test';

const unlock = async (page: import('@playwright/test').Page): Promise<void> => {
  const gate = page.getByTestId('vault-gate');
  if ((await gate.count()) > 0) {
    await page.getByTestId('vault-passphrase').fill('familyledger');
    await page.getByTestId('vault-unlock-button').click();
    await expect(page.getByTestId('vault-gate')).toHaveCount(0);
  }
};

test('Import wizard handles source selection, preview, mapping, dedup review, and confirmation', async ({ page }) => {
  await page.goto('/import');
  await unlock(page);
  await expect(page.getByTestId('import-wizard')).toBeVisible();

  await page.getByTestId('import-source-type').selectOption('CSV');
  await page.getByTestId('import-payload').fill('fail');
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByTestId('import-preview-step')).toBeVisible();
  await page.getByRole('button', { name: 'Run Preview' }).click();
  await expect(page.getByTestId('import-inline-error')).toContainText('Preview failed');

  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByTestId('import-payload').fill(
    'date,payee,amount\n2026-04-01,Coffee,-4.50\n2026-04-02,Groceries,-22.10'
  );

  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Run Preview' }).click();
  await expect(page.getByTestId('import-preview-summary')).toContainText('Transactions: 2');
  await page.getByRole('button', { name: 'Next' }).click();

  await expect(page.getByTestId('import-mapping-step')).toBeVisible();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByTestId('import-dedup-step')).toBeVisible();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByTestId('import-confirm-step')).toBeVisible();

  await page.getByRole('button', { name: 'Confirm Import' }).click();
  await expect(page.getByTestId('import-final-summary')).toContainText('Imported 2 transactions');
});
