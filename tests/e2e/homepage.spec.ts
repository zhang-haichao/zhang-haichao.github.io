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
  await expect(page.locator('#opensource .project-item')).toHaveCount(3);
  await expect(page.locator('#opensource')).toContainText('axiom-quant');
  await expect(page.locator('#opensource')).toContainText('senpai-skill');
  await expect(page.locator('#opensource')).toContainText('PaperReader');
  await expect(page.locator('#opensource')).not.toContainText('CRAGRU');

  await expect(page.locator('.academic-sidebar')).toBeVisible();
  await expect(page.locator('.academic-main')).toBeVisible();
  await expect(page.locator('.profile-avatar')).toBeVisible();
  await expect(page.locator('.publication-paper')).toHaveCount(5);
  const bloodstain = page.locator('[data-publication-title*="Time Since Deposition Estimation"]');
  await expect(bloodstain).toBeVisible();
  await expect(bloodstain).toContainText('CSCWD');
  await expect(bloodstain.getByText('Cited by 3', { exact: true })).toBeVisible();
  await expect(bloodstain.getByText('Framework pending public PDF', { exact: true })).toBeVisible();

  const perovskite = page.locator('[data-publication-title^="Machine Vision-Enabled"]');
  await expect(perovskite.locator('a[href="https://zhang-haichao.github.io/S2-SOFS-Page/"]')).toBeVisible();
  await expect(perovskite.locator('a[href="https://github.com/GDragon126651/Perovskite_Octahedral_Reconstruction"]')).toBeVisible();
  const cragru = page.locator('[data-publication-title^="Customized Retrieval-Augmented"]');
  await expect(cragru.locator('a[href="https://zhang-haichao.github.io/CRAGRU-Page/"]')).toBeVisible();

  const publicationTitles = await page.locator('.publication-paper h3').allTextContents();
  expect(publicationTitles).toEqual([
    'Customized Retrieval-Augmented Generation with LLM for Debiasing Recommendation Unlearning',
    'Machine Vision-Enabled Octahedral Network Reconstruction and Structural Analysis of Perovskite Quantum Dots',
    'Clustering-based incremental learning for imbalanced data classification',
    'Counterfactual Contrastive Learning for Fine Grained Image Classification',
    'Uncertainty-Aware Semantic Decoding for LLM-Based Sequential Recommendation'
  ]);

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
  const bloodstain = page.locator('[data-publication-title*="Time Since Deposition Estimation"]');
  await expect(bloodstain.getByText('引用 3', { exact: true })).toBeVisible();
  await expect(bloodstain.getByText('框架图等待公开 PDF', { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.locator('.profile-identity').getByRole('heading')).toContainText('张海超');
});

test('opens and closes a framework figure dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Enlarge CRAGRU framework figure' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('img')).toHaveAttribute('src', '/images/papers/auto/cragru.png');
  await expect(dialog).toContainText('CRAGRU framework');
  await dialog.getByRole('button', { name: 'Close figure' }).click();
  await expect(dialog).not.toBeVisible();
});

test('stacks readable XJTLU and Liverpool logos in the PhD education entry', async ({ page, isMobile }) => {
  const logoGroup = page.locator('#experience-education .timeline-item').first().locator('.institution-logos');
  const logos = logoGroup.locator('img');

  await expect(logos).toHaveCount(2);
  await logoGroup.scrollIntoViewIfNeeded();
  await expect(logos.first()).toBeVisible();
  const layout = await logoGroup.evaluate((element) => {
    const images = Array.from(element.querySelectorAll('img')).map((image) => image.getBoundingClientRect());
    return {
      direction: getComputedStyle(element).flexDirection,
      firstWidth: images[0]?.width ?? 0,
      firstBottom: images[0]?.bottom ?? 0,
      secondTop: images[1]?.top ?? 0
    };
  });

  expect(layout.direction).toBe('column');
  expect(layout.firstBottom).toBeLessThanOrEqual(layout.secondTop);
  expect(layout.firstWidth).toBeGreaterThanOrEqual(isMobile ? 72 : 110);
});

test('uses the supplied ECJTU and Alibaba logo assets', async ({ page }) => {
  const ecjtuLogo = page.locator('#experience-education img[alt="ECJTU"]');
  const alibabaLogo = page.locator('#experience-education img[alt="Alibaba"]');

  await expect(ecjtuLogo).toHaveAttribute('src', '/images/institutions/ecjtu-user.png');
  await expect(alibabaLogo).toHaveAttribute('src', '/images/institutions/alibaba-user.png');
  await ecjtuLogo.scrollIntoViewIfNeeded();
  await expect(ecjtuLogo).toBeVisible();
  await alibabaLogo.scrollIntoViewIfNeeded();
  await expect(alibabaLogo).toBeVisible();
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

test('serves the unlisted legacy homepage from its archived index file', async ({ page }) => {
  await page.goto('/legacy/index.html', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle('张海超的个人博客');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i);
  await expect(page.locator('link[href="/legacy/css/bootstrap.min.css"]')).toHaveCount(1);
});
