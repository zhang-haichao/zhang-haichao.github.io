import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

const requiredAssets = [
  'public/images/portrait-haichao.png',
  'public/images/papers/cragru.png',
  'public/images/papers/teaching-to-forget.png',
  'public/images/papers/regen.png',
  'public/images/papers/pcdr.png',
  'public/images/papers/ceu.png',
  'public/images/papers/drumrec.png',
  'public/images/institutions/xjtlu.svg',
  'public/images/institutions/liverpool.svg',
  'public/images/institutions/ecjtu.svg',
  'public/images/institutions/alibaba.svg',
  'public/images/institutions/dingfu.svg',
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
  assert.ok(data.publications.length >= 6);
  assert.equal(new Set(data.publications.map((item) => item.title.toLowerCase())).size, data.publications.length);
  for (const publication of data.publications) {
    assert.ok(publication.title);
    assert.ok(publication.authors);
    assert.ok(Number.isInteger(publication.year));
    assert.match(publication.url, /^https:\/\//);
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

