import { expect, test } from '@playwright/test';

test('Vault unlock flow validates passphrase and opens dashboard', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('vault-gate')).toBeVisible();
  await page.getByTestId('vault-passphrase').fill('wrong-passphrase');
  await page.getByTestId('vault-unlock-button').click();
  await expect(page.getByTestId('vault-error')).toContainText('Could not unlock vault');

  await page.getByTestId('vault-passphrase').fill('familyledger');
  await page.getByTestId('vault-unlock-button').click();
  await expect(page.getByTestId('vault-gate')).toHaveCount(0);
  await expect(page.getByText('Dashboard Page')).toBeVisible();
});
