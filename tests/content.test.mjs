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
  'public/images/papers/drumrec.png',
  'public/images/papers/auto/cragru.png',
  'public/images/institutions/xjtlu-official.svg',
  'public/images/institutions/liverpool-official.svg',
  'public/images/institutions/ecjtu-user.png',
  'public/images/institutions/alibaba-user.png',
  'public/images/institutions/dingfu-archive.png',
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

test('framework sync records real extraction provenance and closed-access fallback', async () => {
  const raw = await readFile(new URL('src/data/frameworks.json', root), 'utf8');
  const data = JSON.parse(raw);
  const cragru = data.frameworks.find((item) => item.title.startsWith('Customized Retrieval-Augmented'));
  const bloodstain = data.frameworks.find((item) => item.title.includes('Time Since Deposition Estimation'));

  assert.equal(cragru.status, 'synced');
  assert.equal(cragru.image, '/images/papers/auto/cragru.png');
  assert.match(cragru.pdfUrl, /^https:\/\/arxiv\.org\/pdf\//);
  assert.match(cragru.caption, /framework of CRAGRU/i);
  assert.equal(bloodstain.status, 'awaiting-author-pdf');
  assert.ok(!('image' in bloodstain), 'closed-access papers must not receive a fabricated figure');
});

test('homepage consumes synced frameworks and exposes citation plus source-status metadata', async () => {
  const page = await readFile(new URL('src/pages/index.astro', root), 'utf8');

  assert.match(page, /import frameworkData from ['"]\.\.\/data\/frameworks\.json['"]/);
  assert.match(page, /syncedFramework\?\.image \?\? presentation\.image/);
  assert.match(page, /Cited by \{publication\.citations\}/);
  assert.match(page, /Framework pending public PDF/);
  assert.match(page, /framework\?\.status === 'synced'/);
});

test('scheduled Scholar workflow validates and commits metadata plus framework artifacts', async () => {
  const workflow = await readFile(new URL('.github/workflows/scholar-sync.yml', root), 'utf8');

  assert.match(workflow, /python -m unittest discover[^\n]+test_\*\.py/);
  assert.match(workflow, /python scripts\/sync_framework_figures\.py/);
  assert.match(workflow, /git status --porcelain -- src\/data\/publications\.json src\/data\/frameworks\.json public\/images\/papers\/auto/);
  assert.match(workflow, /git add src\/data\/publications\.json src\/data\/frameworks\.json public\/images\/papers\/auto/);
  assert.match(workflow, /permissions:\s+contents: write/);
});

test('documentation describes complete Scholar sync and the public-PDF framework boundary', async () => {
  const readme = await readFile(new URL('README.md', root), 'utf8');
  const homepageSpec = await readFile(new URL('docs/homepage-spec.md', root), 'utf8');
  const redesignSpec = await readFile(new URL('docs/jiawang-reference-redesign.md', root), 'utf8');
  const sources = await readFile(new URL('docs/sources.md', root), 'utf8');
  const documentation = [readme, homepageSpec, redesignSpec].join('\n');

  assert.doesNotMatch(documentation, /bloodstain deposition paper is intentionally excluded/i);
  assert.doesNotMatch(documentation, /Exclude [“"]Two-branch Network/i);
  assert.match(readme, /framework-sources\.json/);
  assert.match(readme, /publicly accessible PDF/i);
  assert.match(readme, /citation counts/i);
  assert.match(sources, /10\.1109\/CSCWD61410\.2024\.10580800/);
  assert.match(sources, /arxiv\.org\/pdf\/2511\.05494/);
});

test('public page source excludes private contact data and removed work', async () => {
  const files = ['src/data/site.ts', 'src/pages/index.astro', 'src/styles/global.css'];
  const source = (await Promise.all(files.map((file) => readFile(new URL(file, root), 'utf8')))).join('\n');

  assert.doesNotMatch(source, /18279159611/);
  assert.doesNotMatch(source, /zhang_haichao@163\.com/i);
  assert.doesNotMatch(source, /clientSecret/i);
  assert.doesNotMatch(source, /\bDURE\b/);
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
