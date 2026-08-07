import { test, expect } from '@playwright/test';

test('login page has correct heading and text', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');

  // Assert that the login title/heading "Institute ERP" is visible
  const heading = page.getByRole('heading', { name: 'Institute ERP' });
  await expect(heading).toBeVisible();

  // Assert that "Sign in to your account" paragraph is visible
  const subHeading = page.getByText('Sign in to your account');
  await expect(subHeading).toBeVisible();
});
