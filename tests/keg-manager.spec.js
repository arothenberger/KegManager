import { test, expect } from '@playwright/test';

test.describe('Keg Beer Manager', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/index.html');
  });

  test('should load the page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Keg Beer Manager');
  });

  test('should display header with navigation buttons', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Keg Beer Manager');
    await expect(page.getByRole('button', { name: 'Keg Management' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ABV Calculator' })).toBeVisible();
  });

  test('should add a new keg', async ({ page }) => {
    await page.getByRole('button', { name: 'Add a new keg' }).click();
    await page.getByRole('textbox', { name: 'Beer name/Keg name:' }).fill('Test Keg');
    await page.getByRole('spinbutton', { name: 'Weight of the keg (lbs):' }).fill('50');
    await page.getByRole('spinbutton', { name: 'ABV (%):' }).fill('5.0');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.locator('select#kegSelector')).toContainText('Test Keg');
    await expect(page.locator('#selectedKegInfo')).toContainText('Name: Test Keg');
  });

  test('should calculate ABV', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Hydrometer Adjustment' }).fill('0.004');
    await page.getByRole('textbox', { name: 'Original Gravity' }).fill('1.050');
    await page.getByRole('textbox', { name: 'Final Gravity' }).fill('1.010');
    await page.getByRole('button', { name: 'Calculate ABV' }).click();
    await expect(page.locator('#result')).toContainText('4.72%');
  });

  test('should clear inputs in ABV calculator', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Original Gravity' }).fill('1.060');
    await page.locator('button:has-text("Clear")').nth(1).click();
    await expect(page.getByRole('textbox', { name: 'Original Gravity' })).toHaveValue('');
  });

  test('should navigate to ABV Calculator section', async ({ page }) => {
    await page.getByRole('button', { name: 'ABV Calculator' }).click();
    await expect(page.locator('#abvCalcSection')).toBeInViewport();
  });

  test('should show tooltip on hover', async ({ page }) => {
    await page.getByRole('button', { name: 'Add a new keg' }).click();
    await page.locator('.tooltip-trigger').first().hover();
    await expect(page.locator('.tooltip')).toBeVisible();
  });
});