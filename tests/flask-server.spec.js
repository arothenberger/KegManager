import { test, expect } from '@playwright/test';

test('serves the Keg Manager frontend on port 5002', async ({ page }) => {
  const response = await page.goto('http://127.0.0.1:5002/');

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Keg Beer Manager/);
  await expect(page.getByRole('button', { name: 'Keg Management' })).toBeVisible();
  expect(
    await page.locator('link[href="style.css"]').evaluate((link) => link.sheet !== null)
  ).toBe(true);
});
