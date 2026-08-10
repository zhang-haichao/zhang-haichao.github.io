import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('renders the confirmed English academic profile by default', async ({ page, isMobile }) => {
  await expect(page).toHaveTitle('Haichao Zhang · Academic Homepage');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.profile-identity').getByRole('heading')).toContainText('Haichao');
  await expect(page.getByRole('link', { name: 'Download CV' })).toHaveAttribute('href', '/cv/haichao-zhang-en.pdf');
  await expect(page.locator('.ongoing-item')).toHaveCount(5);
  await expect(page.locator('#opensource .project-item')).toHaveCount(2);
  await expect(page.locator('#opensource')).toContainText('senpai-skill');
  await expect(page.locator('#opensource')).toContainText('PaperReader');
  await expect(page.locator('#opensource')).not.toContainText('CRAGRU');

  await expect(page.locator('.academic-sidebar')).toBeVisible();
  await expect(page.locator('.academic-main')).toBeVisible();
  await expect(page.locator('.profile-avatar')).toBeVisible();
  await expect(page.locator('.paper-box')).toHaveCount(1);

  const composition = await page.evaluate(() => {
    const sidebar = document.querySelector('.academic-sidebar')?.getBoundingClientRect();
    const main = document.querySelector('.academic-main')?.getBoundingClientRect();
    const heading = document.querySelector('h1');
    return {
      sidebarRight: sidebar?.right ?? 0,
      mainLeft: main?.left ?? 0,
      headingSize: heading ? Number.parseFloat(getComputedStyle(heading).fontSize) : 999
    };
  });
  if (!isMobile) expect(composition.sidebarRight).toBeLessThanOrEqual(composition.mainLeft + 1);
  expect(composition.headingSize).toBeLessThanOrEqual(34);

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
  await expect(page.locator('.profile-identity').getByRole('heading')).toContainText('张海超');
  await expect(page.getByRole('link', { name: '下载简历' })).toHaveAttribute('href', '/cv/haichao-zhang-zh.pdf');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.locator('.profile-identity').getByRole('heading')).toContainText('张海超');
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
  await expect(page.locator('#mobile-menu').getByRole('link', { name: 'Publications' })).toBeVisible();

  const profileLayout = await page.locator('.profile-card').evaluate((element) => getComputedStyle(element).display);
  expect(profileLayout).toBe('grid');

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
