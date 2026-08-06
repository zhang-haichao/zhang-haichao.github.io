import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('renders the confirmed English academic profile by default', async ({ page }) => {
  await expect(page).toHaveTitle('Haichao Zhang · Academic Homepage');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Haichao');
  await expect(page.getByRole('link', { name: 'Download CV' })).toHaveAttribute('href', '/cv/haichao-zhang-en.pdf');
  await expect(page.locator('.ongoing-item')).toHaveCount(5);
  await expect(page.locator('#opensource .project-item')).toHaveCount(2);
  await expect(page.locator('#opensource')).toContainText('senpai-skill');
  await expect(page.locator('#opensource')).toContainText('PaperReader');
  await expect(page.locator('#opensource')).not.toContainText('CRAGRU');

  const widths = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth
  }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client);
});

test('switches language, CV, title, and persists the preference', async ({ page }) => {
  await page.getByRole('button', { name: '中文' }).click();
  await expect(page).toHaveTitle('张海超 · 学术主页');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('张海超');
  await expect(page.getByRole('link', { name: '下载简历' })).toHaveAttribute('href', '/cv/haichao-zhang-zh.pdf');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('张海超');
});

test('opens and closes a framework figure dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Enlarge CRAGRU framework figure' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('img')).toHaveAttribute('src', '/images/papers/cragru.png');
  await expect(dialog).toContainText('CRAGRU framework');
  await dialog.getByRole('button', { name: 'Close figure' }).click();
  await expect(dialog).not.toBeVisible();
});

test('mobile navigation is usable and the page does not overflow', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile-only interaction');
  const menu = page.locator('.menu-toggle');
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#mobile-menu')).toBeVisible();
  await expect(page.locator('#mobile-menu').getByRole('link', { name: 'Research' })).toBeVisible();

  const widths = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth
  }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client);
});

test('reduced-motion users receive visible content without entrance delays', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.locator('.reveal').first()).toHaveCSS('opacity', '1');
});
