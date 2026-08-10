import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

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

test('publication data matches the Scholar contract', async () => {
  const raw = await readFile(new URL('src/data/publications.json', root), 'utf8');
  const data = JSON.parse(raw);

  assert.equal(data.scholarId, 'zRvnGK0AAAAJ');
  assert.ok(data.publications.length >= 5);
  assert.equal(new Set(data.publications.map((item) => item.title.toLowerCase())).size, data.publications.length);
  assert.ok(!data.publications.some((item) => item.title.includes('Time Since Deposition Estimation of Bloodstains')));
  for (const publication of data.publications) {
    assert.ok(publication.title);
    assert.ok(publication.authors);
    assert.ok(Number.isInteger(publication.year));
    assert.match(publication.url, /^https:\/\//);
    assert.doesNotMatch(publication.venue, /…|\.{3}/);
  }
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
