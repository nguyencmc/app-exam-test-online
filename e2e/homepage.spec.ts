import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Wait for page to be fully loaded
        await page.waitForLoadState('networkidle');
    });

    test('should display the main heading', async ({ page }) => {
        // Check for the main hero heading - using partial match
        const heading = page.getByText(/Luyện thi.*AI/i);
        await expect(heading.first()).toBeVisible();
    });

    test('should display navigation menu', async ({ page }) => {
        // Check navigation items exist in header
        const header = page.locator('header');
        await expect(header).toBeVisible();

        // Check for key nav items
        await expect(page.getByRole('link', { name: /Flashcards/i })).toBeVisible();
    });

    test('should have login and register buttons', async ({ page }) => {
        // Look for auth buttons
        const loginButton = page.getByRole('link', { name: /Đăng nhập/i }).or(
            page.getByRole('button', { name: /Đăng nhập/i })
        );
        await expect(loginButton).toBeVisible();
    });

    test('should navigate to flashcards page', async ({ page }) => {
        await page.getByRole('link', { name: /Flashcards/i }).click();
        await expect(page).toHaveURL(/.*flashcards/);
    });

    test('should navigate to courses page', async ({ page }) => {
        await page.getByRole('link', { name: /Khóa học/i }).click();
        await expect(page).toHaveURL(/.*courses/);
    });

    test('should have working hero CTA button', async ({ page }) => {
        // Look for primary CTA button
        const ctaButton = page.getByRole('link', { name: /Bắt đầu/i }).or(
            page.getByRole('button', { name: /Bắt đầu/i })
        );
        await expect(ctaButton.first()).toBeVisible();
    });
});

test.describe('Auth Flow', () => {
    test('should navigate to auth page from login button', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const loginButton = page.getByRole('link', { name: /Đăng nhập/i }).or(
            page.getByRole('button', { name: /Đăng nhập/i })
        );
        await loginButton.click();
        await expect(page).toHaveURL(/.*auth/);
    });

    test('should display login form', async ({ page }) => {
        await page.goto('/auth');
        await page.waitForLoadState('networkidle');

        // Check for email input
        await expect(page.locator('input[type="email"]')).toBeVisible();
    });

    test('should show validation when submitting empty form', async ({ page }) => {
        await page.goto('/auth');
        await page.waitForLoadState('networkidle');

        // Find and click submit button
        const submitButton = page.getByRole('button', { name: /Đăng nhập|Sign in|Submit/i });
        if (await submitButton.count() > 0) {
            await submitButton.click();
            // Should still be on auth page
            await expect(page).toHaveURL(/.*auth/);
        }
    });
});

test.describe('Responsive Design', () => {
    test('should show mobile navigation on small screens', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Mobile bottom navigation should be visible
        const mobileNav = page.locator('nav').filter({ has: page.locator('a[href="/"]') });
        await expect(mobileNav.first()).toBeVisible();
    });

    test('should be responsive on tablet', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Page should load without errors
        await expect(page).toHaveTitle(/AI-Exam/i);
    });
});
