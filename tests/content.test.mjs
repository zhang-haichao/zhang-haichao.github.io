import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const root = new URL('../', import.meta.url);
const execFileAsync = promisify(execFile);

const requiredAssets = [
  'public/images/portrait-haichao.png',
  'public/images/papers/cragru.png',
  'public/images/papers/perovskite-qds.png',
  'public/images/papers/cil.png',
  'public/images/papers/ccl.png',
  'public/images/papers/uasd.png',
  'public/images/papers/teaching-to-forget.png',
  'public/images/papers/regen.png',
  'public/images/papers/pcdr.png',
  'public/images/papers/ceu.png',
  'public/images/papers/cosrec.png',
  'public/images/papers/tipl.png',
  'public/images/papers/drumrec.png',
  'public/images/papers/auto/cragru.png',
  'public/images/papers/auto/two-branch-bloodstain.png',
  'public/images/institutions/xjtlu-official.svg',
  'public/images/institutions/liverpool-official.svg',
  'public/images/institutions/ecjtu-user.png',
  'public/images/institutions/alibaba-user.png',
  'public/images/institutions/dingfu-archive.png',
  'public/images/intellectual-property/cn117312675a.jpg',
  'public/images/intellectual-property/copyright-pcdr.jpg',
  'public/images/intellectual-property/copyright-yibu.jpg',
  'public/images/intellectual-property/copyright-rail-android.jpg',
  'public/images/intellectual-property/copyright-rail-web.jpg',
  'public/cv/haichao-zhang-en.pdf',
  'public/cv/haichao-zhang-zh.pdf'
];

test('all homepage assets exist and are non-empty', async () => {
  for (const asset of requiredAssets) {
    const details = await stat(new URL(asset, root));
    assert.ok(details.isFile(), `${asset} must be a file`);
    assert.ok(details.size > 0, `${asset} must not be empty`);
  }
});

test('all homepage assets are tracked for deployment', async () => {
  await execFileAsync('git', ['ls-files', '--error-unmatch', '--', ...requiredAssets], {
    cwd: fileURLToPath(root)
  });
});

test('publication data matches the Scholar contract', async () => {
  const raw = await readFile(new URL('src/data/publications.json', root), 'utf8');
  const data = JSON.parse(raw);

  assert.equal(data.scholarId, 'zRvnGK0AAAAJ');
  assert.ok(data.publications.length >= 6);
  assert.equal(new Set(data.publications.map((item) => item.title.toLowerCase())).size, data.publications.length);
  const bloodstain = data.publications.find((item) => item.title.includes('Time Since Deposition Estimation of Bloodstains'));
  assert.ok(bloodstain, 'the Scholar-listed bloodstain paper must remain visible');
  assert.equal(bloodstain.year, 2024);
  assert.match(bloodstain.venue, /CSCWD/);
  assert.ok(Number.isInteger(bloodstain.citations) && bloodstain.citations >= 0);
  for (const publication of data.publications) {
    assert.ok(publication.title);
    assert.ok(publication.authors);
    assert.ok(Number.isInteger(publication.year));
    assert.match(publication.url, /^https:\/\//);
    assert.doesNotMatch(publication.venue, /…|\.{3}/);
  }
});

test('framework sync records real extraction provenance from PDFs and publisher figures', async () => {
  const raw = await readFile(new URL('src/data/frameworks.json', root), 'utf8');
  const data = JSON.parse(raw);
  const cragru = data.frameworks.find((item) => item.title.startsWith('Customized Retrieval-Augmented'));
  const bloodstain = data.frameworks.find((item) => item.title.includes('Time Since Deposition Estimation'));

  assert.equal(cragru.status, 'synced');
  assert.equal(cragru.image, '/images/papers/auto/cragru.png');
  assert.match(cragru.pdfUrl, /^https:\/\/arxiv\.org\/pdf\//);
  assert.match(cragru.caption, /framework of CRAGRU/i);
  assert.equal(bloodstain.status, 'synced');
  assert.equal(bloodstain.image, '/images/papers/auto/two-branch-bloodstain.png');
  assert.equal(bloodstain.source, 'IEEE Xplore figures API');
  assert.equal(bloodstain.figureId, 'fig2');
  assert.match(bloodstain.caption, /overall architecture of FTIR-Net/i);
});

test('homepage keeps every Scholar work visible and consumes synced frameworks', async () => {
  const page = await readFile(new URL('src/pages/index.astro', root), 'utf8');

  assert.match(page, /import frameworkData from ['"]\.\.\/data\/frameworks\.json['"]/);
  assert.match(page, /syncedFramework\?\.image \?\? presentation\.image/);
  assert.match(page, /Cited by \{publication\.citations\}/);
  assert.match(page, /autoDiscoveredPublications/);
  assert.match(page, /collaborativeAutoDiscoveredPublications/);
  assert.doesNotMatch(page, /Additional publications/);
  assert.doesNotMatch(page, /Framework pending public PDF/);
  assert.doesNotMatch(page, /Figure source/);
});

test('specified co-authored papers are grouped under Collaborative Publications', async () => {
  const page = await readFile(new URL('src/pages/index.astro', root), 'utf8');

  assert.match(page, /id="collaborative-publications"/);
  assert.match(page, /Collaborative Publications/);
  assert.match(page, /合作论文/);
  assert.match(page, /collaborativeCuratedPublications\.map/);
  assert.match(page, /collaborativeAutoDiscoveredPublications\.map/);

  for (const title of [
    'Machine Vision-Enabled Octahedral Network Reconstruction and Structural Analysis of Perovskite Quantum Dots',
    'Clustering-based incremental learning for imbalanced data classification',
    'Counterfactual Contrastive Learning for Fine Grained Image Classification',
    'Uncertainty-Aware Semantic Decoding for LLM-Based Sequential Recommendation',
    'Two-branch Network with Feature Fusion for Time Since Deposition Estimation of Bloodstains'
  ]) {
    assert.match(page, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('news and ongoing research expose the requested bilingual publication statuses', async () => {
  const site = await readFile(new URL('src/data/site.ts', root), 'utf8');
  const page = await readFile(new URL('src/pages/index.astro', root), 'utf8');

  assert.doesNotMatch(site, /date: '2026\.02'/);
  assert.doesNotMatch(site, /钙钛矿量子点机器视觉研究发表于 ACS Nano/);
  assert.match(site, /en: 'ACM Transactions on Information Systems · Major Revision'/);
  assert.match(site, /zh: 'ACM Transactions on Information Systems · 大修'/);
  assert.doesNotMatch(site, /TOIS Major Revision|TOIS 大修/);
  assert.match(site, /en: 'Our DPU framework received a major revision decision from ACM Transactions on Information Systems\.'/);
  assert.match(site, /zh: '我们的 DPU 框架收到 ACM Transactions on Information Systems 的大修意见。'/);
  assert.match(site, /href: 'https:\/\/dl\.acm\.org\/journal\/tois\/reviewers'/);
  assert.match(site, /International Journal of Machine Learning and Cybernetics \(JMLC\) · Under Review/);
  assert.match(site, /International Journal of Machine Learning and Cybernetics（JMLC）· 审稿中/);
  assert.match(site, /en: 'AAAI 2026 · Under Review'/);
  assert.match(site, /zh: 'AAAI 2026 · 审稿中'/);
  assert.match(page, /paper\.status\.en/);
  assert.match(page, /paper\.status\.zh/);
});

test('ICDM 2026 acceptances are promoted from ongoing work to Publications', async () => {
  const site = await readFile(new URL('src/data/site.ts', root), 'utf8');
  const page = await readFile(new URL('src/pages/index.astro', root), 'utf8');
  const acceptedBlock = site.match(/export const acceptedPublications[^=]*= \[([\s\S]*?)\];/)?.[1] ?? '';
  const ongoingBlock = site.match(/export const ongoingResearch = \[([\s\S]*?)\] as const;/)?.[1] ?? '';

  assert.match(site, /date: '2026\.08'/);
  assert.doesNotMatch(site, /date: '2026\.08\.17'/);
  assert.match(acceptedBlock, /Controllable Generative Recommendation via Guided Token Refinement/);
  assert.match(acceptedBlock, /Explain-then-Forget: Causal Explanation-based Unlearning/);
  assert.match(acceptedBlock, /https:\/\/github\.com\/zhang-haichao\/ReGen/);
  assert.match(acceptedBlock, /https:\/\/github\.com\/zhang-haichao\/Explain-and-Forget/);
  assert.match(acceptedBlock, /preprintUrl: null/g);
  assert.doesNotMatch(ongoingBlock, /key: 'regen'|key: 'ceu'/);
  assert.match(page, /acceptedPublications\.map/);
  assert.match(page, /Preprint coming soon/);
});

test('ICONIP 2026 acceptances appear last in Publications with supplied figures and placeholders', async () => {
  const site = await readFile(new URL('src/data/site.ts', root), 'utf8');
  const page = await readFile(new URL('src/pages/index.astro', root), 'utf8');
  const lowerPriorityBlock = site.match(/export const lowerPriorityAcceptedPublications[^=]*= \[([\s\S]*?)\];/)?.[1] ?? '';

  assert.match(site, /Two papers on explainable graph recommendation and topology-aware inverse preference learning were accepted by ICONIP 2026 in Melbourne\./);
  assert.match(site, /两篇关于图推荐解释与拓扑感知逆偏好学习的论文被 ICONIP 2026 接收，会议将在墨尔本举行。/);
  assert.match(lowerPriorityBlock, /Explaining Graph Recommendations via Counterfactual Support Sets/);
  assert.match(lowerPriorityBlock, /Haichao Zhang, Chong Zhang, Can Wang, Shi Qiu, Jia Wang/);
  assert.match(lowerPriorityBlock, /https:\/\/github\.com\/zhang-haichao\/CoSRec/);
  assert.match(lowerPriorityBlock, /Topology-Aware Inverse Preference Learning for Robust Hybrid Voting Systems/);
  assert.match(lowerPriorityBlock, /Can Wang, Shi Qiu, Haichao Zhang/);
  assert.equal((lowerPriorityBlock.match(/preprintUrl: null/g) ?? []).length, 2);
  assert.match(lowerPriorityBlock, /image: '\/images\/papers\/cosrec\.png'/);
  assert.match(lowerPriorityBlock, /image: '\/images\/papers\/tipl\.png'/);
  assert.match(page, /primaryAutoDiscoveredPublications\.map[\s\S]*lowerPriorityAcceptedPublications\.map/);
});

test('every main content heading includes a decorative icon', async () => {
  const page = await readFile(new URL('src/pages/index.astro', root), 'utf8');

  for (const id of ['about-title', 'news-title', 'journey-title', 'publications-title', 'collaborative-title', 'ongoing-title', 'opensource-title', 'ip-title', 'awards-title']) {
    assert.match(page, new RegExp(`id=["']${id}["'][^>]*>[^<]*<span class=["']heading-icon["'] aria-hidden=["']true["']>`));
  }
});

test('intellectual property records match the supplied patent and copyright certificates', async () => {
  const site = await readFile(new URL('src/data/site.ts', root), 'utf8');
  const page = await readFile(new URL('src/pages/index.astro', root), 'utf8');
  const ipBlock = site.match(/export const intellectualProperty = \[([\s\S]*?)\] as const;/)?.[1] ?? '';

  for (const identifier of ['CN117312675A', '2025SR0516629', '2018SR047738', '2018SR717297', '2018SR643652']) {
    assert.match(ipBlock, new RegExp(identifier));
  }
  assert.match(ipBlock, /Invention Patent Application/);
  assert.match(ipBlock, /kind: 'copyright'/);
  assert.match(page, /id="intellectual-property"/);
  assert.match(page, /intellectualProperty\.map/);
});

test('scheduled Scholar workflow validates and commits metadata plus framework artifacts', async () => {
  const workflow = await readFile(new URL('.github/workflows/scholar-sync.yml', root), 'utf8');

  assert.match(workflow, /python -m unittest discover[^\n]+test_\*\.py/);
  assert.match(workflow, /python scripts\/sync_framework_figures\.py/);
  assert.match(workflow, /skip_scholar:/);
  assert.match(workflow, /if: \$\{\{ !inputs\.skip_scholar \}\}/);
  assert.match(workflow, /git status --porcelain -- src\/data\/publications\.json src\/data\/frameworks\.json public\/images\/papers\/auto/);
  assert.match(workflow, /git add src\/data\/publications\.json src\/data\/frameworks\.json public\/images\/papers\/auto/);
  assert.match(workflow, /permissions:\s+contents: write/);
});

test('documentation describes complete Scholar sync and reviewed framework sources', async () => {
  const readme = await readFile(new URL('README.md', root), 'utf8');
  const homepageSpec = await readFile(new URL('docs/homepage-spec.md', root), 'utf8');
  const redesignSpec = await readFile(new URL('docs/jiawang-reference-redesign.md', root), 'utf8');
  const sources = await readFile(new URL('docs/sources.md', root), 'utf8');
  const documentation = [readme, homepageSpec, redesignSpec].join('\n');

  assert.doesNotMatch(documentation, /bloodstain deposition paper is intentionally excluded/i);
  assert.doesNotMatch(documentation, /Exclude [“"]Two-branch Network/i);
  assert.match(readme, /framework-sources\.json/);
  assert.match(readme, /publisher figures API/i);
  assert.match(readme, /citation counts/i);
  assert.match(sources, /10\.1109\/CSCWD61410\.2024\.10580800/);
  assert.match(sources, /Overall architecture of FTIR-Net/);
  assert.doesNotMatch(sources, /awaiting-author-pdf/);
  assert.match(sources, /arxiv\.org\/pdf\/2511\.05494/);
});

test('public page source excludes private contact data and removed work', async () => {
  const files = ['src/data/site.ts', 'src/pages/index.astro', 'src/styles/global.css'];
  const source = (await Promise.all(files.map((file) => readFile(new URL(file, root), 'utf8')))).join('\n');

  assert.doesNotMatch(source, /18279159611/);
  assert.doesNotMatch(source, /zhang_haichao@163\.com/i);
  assert.doesNotMatch(source, /haichao\.zhang22@student\.xjtlu\.edu\.cn/i);
  assert.match(source, /zhc@liverpool\.ac\.uk/i);
  assert.doesNotMatch(source, /clientSecret/i);
  assert.doesNotMatch(source, /\bDURE\b/);
});

test('analytics stays private, optional, and privacy-aware', async () => {
  const page = await readFile(new URL('src/pages/index.astro', root), 'utf8');
  const workflow = await readFile(new URL('.github/workflows/pages.yml', root), 'utf8');

  assert.match(page, /import\.meta\.env\.PUBLIC_GOATCOUNTER_CODE/);
  assert.match(page, /data-goatcounter=\{goatCounterEndpoint\}/);
  assert.match(page, /gc\.zgo\.at\/count\.v5\.js/);
  assert.match(page, /navigator\.doNotTrack === '1'/);
  assert.match(page, /no_events: true/);
  assert.doesNotMatch(page, /visit_count|counter\//);
  assert.match(workflow, /PUBLIC_GOATCOUNTER_CODE: \$\{\{ vars\.PUBLIC_GOATCOUNTER_CODE \}\}/);
});

test('production metadata and project links use the custom domain', async () => {
  const config = await readFile(new URL('astro.config.mjs', root), 'utf8');
  const page = await readFile(new URL('src/pages/index.astro', root), 'utf8');
  const site = await readFile(new URL('src/data/site.ts', root), 'utf8');
  const productionSource = [config, page, site].join('\n');

  assert.match(config, /site: 'https:\/\/zhanghaichao\.loc\.cc'/);
  assert.match(page, /<link rel="canonical" href="https:\/\/zhanghaichao\.loc\.cc\/" \/>/);
  assert.match(page, /<meta property="og:url" content="https:\/\/zhanghaichao\.loc\.cc\/" \/>/);
  assert.doesNotMatch(productionSource, /https:\/\/zhang-haichao\.github\.io/);
});

test('private analytics portal embeds GoatCounter without exposing credentials', async () => {
  const portal = await readFile(new URL('src/pages/uv.astro', root), 'utf8');

  assert.match(portal, /<meta name="robots" content="noindex, nofollow, noarchive" \/>/);
  assert.match(portal, /src=\{dashboardUrl\}/);
  assert.match(portal, /https:\/\/zhanghaichao\.goatcounter\.com\/\?embed=uv/);
  assert.match(portal, /GoatCounter login required/);
  assert.match(portal, /window\.history\.replaceState\(null, '', `\/uv/);
  assert.doesNotMatch(portal, /access-token|api\/v0|data-goatcounter/);
});

test('verified publication resources and selected open-source projects are explicit', async () => {
  const site = await readFile(new URL('src/data/site.ts', root), 'utf8');

  for (const url of [
    'https://zhanghaichao.loc.cc/S2-SOFS-Page/',
    'https://github.com/GDragon126651/Perovskite_Octahedral_Reconstruction',
    'https://github.com/ybyangjing/CTA',
    'https://zhanghaichao.loc.cc/CRAGRU-Page/',
    'https://github.com/zhang-haichao/axiom-quant'
  ]) {
    assert.match(site, new RegExp(url.replaceAll('.', '\\.').replaceAll('/', '\\/')));
  }

  const openSourceBlock = site.match(/export const openSource = \[([\s\S]*?)\] as const;/)?.[1] ?? '';
  assert.match(openSourceBlock, /name: 'axiom-quant'/);
  assert.match(openSourceBlock, /name: 'senpai-skill'/);
  assert.match(openSourceBlock, /name: 'PaperReader'/);
});

test('timeline uses traceable institution assets and the user-provided Alibaba identifier', async () => {
  const site = await readFile(new URL('src/data/site.ts', root), 'utf8');
  const sources = await readFile(new URL('docs/sources.md', root), 'utf8');
  const readme = await readFile(new URL('README.md', root), 'utf8');

  for (const asset of [
    'xjtlu-official.svg',
    'liverpool-official.svg',
    'ecjtu-user.png',
    'alibaba-user.png',
    'dingfu-archive.png'
  ]) {
    assert.match(site, new RegExp(asset.replace('.', '\\.')));
  }

  for (const origin of [
    'xjtlu.edu.cn/wp-content/uploads/2024/01/en-header-logo.svg',
    'liverpool.ac.uk/',
    'pitchhub.36kr.com/project/2316725606435333'
  ]) {
    assert.match(sources, new RegExp(origin.replaceAll('.', '\\.')));
  }

  assert.doesNotMatch(site, /institutions\/(?:xjtlu|liverpool|ecjtu|alibaba|dingfu)\.svg/);
  assert.doesNotMatch(site, /wordmark:/);
  assert.match(sources, /PAPER_FIGURES\/alilogo\.png/);
  assert.match(sources, /PAPER_FIGURES\/ecjtu\.png/);
  assert.match(sources, /user-provided/i);
  assert.doesNotMatch(readme, /monograms?/i);
});

test('experience and education follows news before publications', async () => {
  const page = await readFile(new URL('src/pages/index.astro', root), 'utf8');
  const newsPosition = page.indexOf('id="news"');
  const journeyPosition = page.indexOf('id="experience-education"');
  const publicationsPosition = page.indexOf('id="publications"');

  assert.ok(newsPosition >= 0);
  assert.ok(journeyPosition > newsPosition);
  assert.ok(publicationsPosition > journeyPosition);
});

test('legacy homepage is archived at an unlisted noindex path without old comment credentials', async () => {
  const homepage = await readFile(new URL('src/pages/index.astro', root), 'utf8');
  const legacy = await readFile(new URL('public/legacy/index.html', root), 'utf8');
  const robots = await readFile(new URL('public/robots.txt', root), 'utf8');

  assert.match(legacy, /张海超的个人博客/);
  assert.match(legacy, /name=["']robots["'][^>]+noindex/i);
  assert.doesNotMatch(legacy, /clientSecret|new\s+Gitalk/i);
  assert.match(robots, /Disallow:\s*\/legacy\//i);
  assert.doesNotMatch(homepage, /href=["']\/legacy\//i);
});
