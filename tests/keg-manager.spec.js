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

  test('should navigate to Recipes section', async ({ page }) => {
    await page.getByRole('button', { name: 'Recipes' }).click();
    await expect(page.locator('#recipesSection')).toBeInViewport();
  });

  test('should upload a recipe XML', async ({ page }) => {
    await page.getByRole('button', { name: 'Recipes' }).click();
    const fileInput = page.locator('#uploadRecipe');
    await fileInput.setInputFiles('Sierra Nevada Pale Ale.xml');
    await expect(page.locator('.recipe-item')).toContainText('Sierra Nevada Pale Ale');
  });

  test('should associate recipe with keg', async ({ page }) => {
    await page.getByRole('button', { name: 'Recipes' }).click();
    const fileInput = page.locator('#uploadRecipe');
    await fileInput.setInputFiles('Sierra Nevada Pale Ale.xml');
    await page.getByRole('button', { name: 'Keg Management' }).click();
    await page.getByRole('button', { name: 'Add a new keg' }).click();
    await page.locator('select#kegRecipe').selectOption({ label: 'Sierra Nevada Pale Ale' });
    await expect(page.getByRole('textbox', { name: 'Beer name/Keg name:' })).toHaveValue('Sierra Nevada Pale Ale');
    await expect(page.getByRole('spinbutton', { name: 'ABV (%):' })).toHaveValue('5.2');
  });

  test('should remove a keg', async ({ page }) => {
    await page.getByRole('button', { name: 'Add a new keg' }).click();
    await page.getByRole('textbox', { name: 'Beer name/Keg name:' }).fill('Keg to Remove');
    await page.getByRole('spinbutton', { name: 'Weight of the keg (lbs):' }).fill('50');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.locator('select#kegSelector')).toContainText('Keg to Remove');
    // The keg is selected by default
    // Click remove and accept dialog
    page.on('dialog', dialog => dialog.accept());
    await page.locator('.remove-keg-btn').click();
    await expect(page.locator('select#kegSelector')).not.toContainText('Keg to Remove');
  });

  test('should prepopulate edit keg form with current data', async ({ page }) => {
    await page.getByRole('button', { name: 'Add a new keg' }).click();
    await page.getByRole('textbox', { name: 'Beer name/Keg name:' }).fill('Edit Test');
    await page.getByRole('spinbutton', { name: 'Weight of the keg (lbs):' }).fill('48');
    await page.getByRole('spinbutton', { name: 'ABV (%):' }).fill('5.8');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByRole('button', { name: 'Edit Keg' }).click();
    await expect(page.locator('#editKegForm')).toBeVisible();
    await expect(page.locator('#editKegName')).toHaveValue('Edit Test');
    await expect(page.locator('#editKegWeight')).toHaveValue('48.00');
    await expect(page.locator('#editKegAbv')).toHaveValue('5.8');
  });

  test('should delete a recipe', async ({ page }) => {
    await page.getByRole('button', { name: 'Recipes' }).click();
    const fileInput = page.locator('#uploadRecipe');
    await fileInput.setInputFiles('Sierra Nevada Pale Ale.xml');
    await expect(page.locator('.recipe-item')).toBeTruthy();
    
    // Delete the recipe
    page.on('dialog', dialog => dialog.accept());
    await page.locator('.recipe-btn-delete').click();
    
    // Verify it's deleted
    await expect(page.locator('#recipeList')).toContainText('No recipes uploaded yet');
  });

  test('should filter recipes by search', async ({ page }) => {
    await page.getByRole('button', { name: 'Recipes' }).click();
    const fileInput = page.locator('#uploadRecipe');
    await fileInput.setInputFiles('Sierra Nevada Pale Ale.xml');
    
    // Search for the recipe
    await page.locator('#recipeSearch').fill('Sierra');
    await expect(page.locator('.recipe-item')).toContainText('Sierra Nevada Pale Ale');
    
    // Search for non-existent recipe
    await page.locator('#recipeSearch').fill('NonExistent');
    await expect(page.locator('#recipeList')).toContainText('No recipes match your search');
  });
});