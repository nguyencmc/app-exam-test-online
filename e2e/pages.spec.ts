import { test, expect } from '@playwright/test';

test.describe('Exams Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/exams');
        await page.waitForLoadState('networkidle');
    });

    test('should display exams page', async ({ page }) => {
        // Page should load successfully
        await expect(page).toHaveTitle(/AI-Exam/i);
    });

    test('should have main content area', async ({ page }) => {
        // Main content should be visible
        const main = page.locator('main').or(page.locator('[role="main"]'));
        await expect(main.first()).toBeVisible();
    });
});

test.describe('Courses Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/courses');
        await page.waitForLoadState('networkidle');
    });

    test('should display courses page', async ({ page }) => {
        // Page should load
        await expect(page).toHaveTitle(/AI-Exam/i);
    });

    test('should have main content', async ({ page }) => {
        // Main content should be visible
        const content = page.locator('main').or(page.locator('div.container'));
        await expect(content.first()).toBeVisible();
    });
});

test.describe('Flashcards Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/flashcards');
        await page.waitForLoadState('networkidle');
    });

    test('should display flashcards page', async ({ page }) => {
        await expect(page).toHaveTitle(/AI-Exam/i);
    });

    test('should have content area', async ({ page }) => {
        const content = page.locator('main').or(page.locator('div').first());
        await expect(content.first()).toBeVisible();
    });
});

test.describe('404 Page', () => {
    test('should display 404 for non-existent routes', async ({ page }) => {
        await page.goto('/this-page-does-not-exist-12345');
        await page.waitForLoadState('networkidle');

        // Should show 404 message
        const notFoundText = page.getByText(/404|not found|không tìm thấy/i);
        await expect(notFoundText.first()).toBeVisible();
    });

    test('should have navigation back to home', async ({ page }) => {
        await page.goto('/non-existent-page');
        await page.waitForLoadState('networkidle');

        // Should have a way to go back
        const homeLink = page.getByRole('link', { name: /home|trang chủ|quay lại/i });
        await expect(homeLink.first()).toBeVisible();
    });
});

test.describe('Dashboard Page', () => {
    test('should load dashboard page', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        // Dashboard or redirect to auth should happen
        const url = page.url();
        expect(url).toMatch(/dashboard|auth/);
    });
});
