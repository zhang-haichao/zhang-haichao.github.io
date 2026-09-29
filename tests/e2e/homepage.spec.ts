import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('renders the confirmed English academic profile by default', async ({ page, isMobile }) => {
  await expect(page).toHaveTitle('Haichao Zhang · Academic Homepage');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.profile-identity').getByRole('heading')).toContainText('Haichao');
  await expect(page.getByRole('link', { name: 'Download CV' })).toHaveAttribute('href', '/cv/haichao-zhang-en.pdf');
  await expect(page.locator('.ongoing-item')).toHaveCount(3);
  await expect(page.locator('#opensource .project-item')).toHaveCount(3);
  await expect(page.locator('#opensource')).toContainText('axiom-quant');
  await expect(page.locator('#opensource')).toContainText('senpai-skill');
  await expect(page.locator('#opensource')).toContainText('PaperReader');
  await expect(page.locator('#opensource')).not.toContainText('CRAGRU');
  await expect(page.locator('#intellectual-property .ip-item')).toHaveCount(5);
  await expect(page.locator('#intellectual-property')).toContainText('CN117312675A');
  await expect(page.locator('#intellectual-property')).toContainText('2025SR0516629');

  await expect(page.locator('.academic-sidebar')).toBeVisible();
  await expect(page.locator('.academic-main')).toBeVisible();
  await expect(page.locator('.profile-avatar')).toBeVisible();
  await expect(page.locator('.publication-paper')).toHaveCount(8);
  await expect(page.locator('#publications .publication-paper')).toHaveCount(3);
  await expect(page.locator('#collaborative-publications .publication-paper')).toHaveCount(5);
  await expect(page.locator('#collaborative-publications')).toContainText('Collaborative Publications');
  await expect(page.getByText('Additional publications', { exact: true })).toHaveCount(0);
  await expect(page.locator('a[href="mailto:haichao.zhang22@student.xjtlu.edu.cn"]')).toHaveCount(0);
  await expect(page.locator('a[href="mailto:zhc@liverpool.ac.uk"]')).toBeVisible();
  const bloodstain = page.locator('[data-publication-title*="Time Since Deposition Estimation"]');
  await expect(bloodstain).toBeVisible();
  await expect(bloodstain).toContainText('CSCWD');
  await expect(bloodstain.getByText('Cited by 3', { exact: true })).toBeVisible();
  await expect(bloodstain.getByRole('button', { name: 'Enlarge Two-branch Network with Feature Fusion for Time Since Deposition Estimation of Bloodstains framework figure' })).toBeVisible();
  await expect(bloodstain.locator('img')).toHaveAttribute('src', '/images/papers/auto/two-branch-bloodstain.png');

  const perovskite = page.locator('[data-publication-title^="Machine Vision-Enabled"]');
  await expect(page.locator('#collaborative-publications').locator('[data-publication-title^="Machine Vision-Enabled"]')).toBeVisible();
  await expect(page.locator('#publications').locator('[data-publication-title^="Machine Vision-Enabled"]')).toHaveCount(0);
  await expect(perovskite.locator('a[href="https://zhanghaichao.loc.cc/S2-SOFS-Page/"]')).toBeVisible();
  await expect(perovskite.locator('a[href="https://github.com/GDragon126651/Perovskite_Octahedral_Reconstruction"]')).toBeVisible();
  const cragru = page.locator('[data-publication-title^="Customized Retrieval-Augmented"]');
  await expect(cragru.locator('a[href="https://zhanghaichao.loc.cc/CRAGRU-Page/"]')).toBeVisible();
  const regen = page.locator('[data-publication-title^="Controllable Generative Recommendation"]');
  await expect(regen.getByText('Preprint coming soon', { exact: true })).toBeVisible();
  await expect(regen.locator('a[href="https://github.com/zhang-haichao/ReGen"]')).toBeVisible();
  const explainThenForget = page.locator('[data-publication-title^="Explain-then-Forget"]');
  await expect(explainThenForget.getByText('Preprint coming soon', { exact: true })).toBeVisible();
  await expect(explainThenForget.locator('a[href="https://github.com/zhang-haichao/Explain-and-Forget"]')).toBeVisible();
  const cil = page.locator('[data-publication-title^="Clustering-based incremental learning"]');
  await expect(cil.locator('a[href="https://github.com/ybyangjing/CTA"]')).toBeVisible();
  await expect(page.locator('#collaborative-publications')).toContainText('Counterfactual Contrastive Learning for Fine Grained Image Classification');
  await expect(page.locator('#collaborative-publications')).toContainText('Uncertainty-Aware Semantic Decoding for LLM-Based Sequential Recommendation');
  await expect(page.locator('#collaborative-publications')).toContainText('Two-branch Network with Feature Fusion for Time Since Deposition Estimation of Bloodstains');
  await expect(page.getByText('Figure source', { exact: true })).toHaveCount(0);
  await expect(page.locator('#news')).not.toContainText('2026.02');
  await expect(page.locator('#news').getByRole('link', { name: 'Our DPU framework received a major revision decision from ACM Transactions on Information Systems.' })).toHaveAttribute('href', 'https://dl.acm.org/journal/tois/reviewers');
  await expect(perovskite.locator('a[href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12947740/"]').first()).toBeVisible();
  await expect(page.locator('.ongoing-item').filter({ hasText: 'Teaching to Forget' })).toContainText('ACM Transactions on Information Systems · Major Revision');
  await expect(page.locator('.ongoing-item').filter({ hasText: 'Personalized Conformity Disentanglement' })).toContainText('International Journal of Machine Learning and Cybernetics (JMLC) · Under Review');
  await expect(page.locator('.ongoing-item').filter({ hasText: 'Dual-Rate User Semantic Memory' })).toContainText('AAAI 2026 · Under Review');

  const publicationTitles = await page.locator('.publication-paper h3').allTextContents();
  expect(publicationTitles).toEqual([
    'Controllable Generative Recommendation via Guided Token Refinement',
    'Explain-then-Forget: Causal Explanation-based Unlearning for Efficient and Precise Recommendation',
    'Customized Retrieval-Augmented Generation with LLM for Debiasing Recommendation Unlearning',
    'Machine Vision-Enabled Octahedral Network Reconstruction and Structural Analysis of Perovskite Quantum Dots',
    'Clustering-based incremental learning for imbalanced data classification',
    'Counterfactual Contrastive Learning for Fine Grained Image Classification',
    'Uncertainty-Aware Semantic Decoding for LLM-Based Sequential Recommendation',
    'Two-branch Network with Feature Fusion for Time Since Deposition Estimation of Bloodstains'
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
  await expect(bloodstain.locator('img')).toHaveAttribute('src', '/images/papers/auto/two-branch-bloodstain.png');
  await expect(page.locator('#news')).not.toContainText('2026.02');
  await expect(page.locator('#news').getByRole('link', { name: '我们的 DPU 框架收到 ACM Transactions on Information Systems 的大修意见。' })).toHaveAttribute('href', 'https://dl.acm.org/journal/tois/reviewers');
  await expect(page.locator('.ongoing-item').filter({ hasText: 'Teaching to Forget' })).toContainText('ACM Transactions on Information Systems · 大修');
  await expect(page.locator('.ongoing-item').filter({ hasText: 'Personalized Conformity Disentanglement' })).toContainText('International Journal of Machine Learning and Cybernetics（JMLC）· 审稿中');
  await expect(page.locator('.ongoing-item').filter({ hasText: 'Dual-Rate User Semantic Memory' })).toContainText('AAAI 2026 · 审稿中');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.locator('.profile-identity').getByRole('heading')).toContainText('张海超');
});

test('opens and closes a framework figure dialog', async ({ page }) => {
  const cragruFigure = page.getByRole('button', { name: 'Enlarge CRAGRU framework figure' });
  await cragruFigure.scrollIntoViewIfNeeded();
  await expect(cragruFigure).toBeVisible();
  await cragruFigure.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('img')).toHaveAttribute('src', '/images/papers/auto/cragru.png');
  await expect(dialog).toContainText('CRAGRU framework');
  await dialog.getByRole('button', { name: 'Close figure' }).click();
  await expect(dialog).not.toBeVisible();
});

test('opens an intellectual property document preview', async ({ page }) => {
  await page.getByRole('button', { name: 'Enlarge CN117312675A document preview' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('img')).toHaveAttribute('src', '/images/intellectual-property/cn117312675a.jpg');
  await expect(dialog).toContainText('CN117312675A');
  await dialog.getByRole('button', { name: 'Close figure' }).click();
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
  await expect(page.locator('#mobile-menu').getByRole('link', { name: 'Collaborative Work' })).toBeVisible();

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

test('serves the private analytics portal without exposing a dashboard token', async ({ page }) => {
  await page.goto('/uv/');

  await expect(page).toHaveTitle('Visitor Analytics · Haichao Zhang');
  await expect(page.getByRole('heading', { name: 'Visitor Analytics · 访客统计' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to homepage · 返回主页' })).toHaveAttribute('href', '/');
  await expect(page.locator('iframe[title="Private GoatCounter visitor analytics dashboard"]')).toHaveAttribute(
    'src',
    'https://zhanghaichao.goatcounter.com/'
  );
  await expect(page.locator('html')).not.toContainText('access-token');
});
