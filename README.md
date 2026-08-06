# Haichao Zhang · Academic Homepage

A bilingual, single-page academic homepage for GitHub Pages. English is the default language; Chinese can be enabled from the header without leaving the page.

## What is included

- Full-bleed academic portrait and a responsive editorial layout
- English/Chinese content with a persisted language preference
- Selected Research and public-safe Ongoing Research framework previews
- Google Scholar-backed Publications with citation counts
- Education and industry timelines with locally archived, source-documented institution logos
- Open Source featuring only `senpai-skill` and `PaperReader`
- Original English and Chinese CV PDFs
- Automated Scholar updates and GitHub Pages deployment

## Local development

Requirements: Node.js 24+, npm 11+, and Python 3.12+.

```bash
npm ci
npm run dev
```

Open `http://127.0.0.1:4321/`. A production build is created with:

```bash
npm run build
npm run preview
```

## Validation

Install the Chromium browser used by Playwright once:

```bash
npx playwright install chromium
```

Then run the full local gate:

```bash
npm run test:all
```

The gate checks local assets and privacy boundaries, Scholar normalization and failure preservation, Astro type/build diagnostics, desktop/mobile bilingual flows, the framework dialog, mobile navigation, overflow, and reduced-motion behavior.

## Updating content

| Content | File or directory |
| --- | --- |
| Bio, research, news, journey, projects, awards | `src/data/site.ts` |
| Scholar publication cache | `src/data/publications.json` |
| Research figures | `public/images/papers/` |
| Portrait | `public/images/portrait-haichao.png` |
| Institution identifiers and logos | `public/images/institutions/` |
| Downloadable CVs | `public/cv/` |
| Visual system | `src/styles/global.css` |

The original source folders `PHOTO/`, `PAPER_FIGURES/`, and `CV/` remain local and are intentionally ignored by Git. The deployable copies in `public/` are tracked.

Ongoing Research descriptions should stay concise and public-safe. When adding or removing an item, update both languages and run `npm run test:all`.

## Google Scholar sync

`.github/workflows/scholar-sync.yml` runs every Monday at 03:17 UTC (11:17 China Standard Time) and can also be started manually from the Actions tab. It uses Scholar profile ID `zRvnGK0AAAAJ`.

The updater:

1. fetches the public Scholar profile;
2. normalizes titles, authors, venues, links, years, and citation counts;
3. rejects empty, malformed, duplicate, or suspiciously truncated results;
4. writes atomically only after validation;
5. builds the site; and
6. commits only when publication data changed.

If Google Scholar rate-limits a run, the workflow fails without replacing the last valid publication file. No API key or repository secret is required.

To exercise the safe offline path:

```bash
python scripts/update_scholar.py \
  --fixture tests/fixtures/scholar-profile.json \
  --output .mission/publications-fixture.json
```

The updater rejects any decrease in publication count by default, so a partial or rate-limited Scholar response cannot silently remove existing work. For an intentional, reviewed deletion, add `--allow-removals`; the scheduled Action never enables this override.

## Deploying to `zhang-haichao.github.io`

This directory is an independent local Git repository; it has not been pushed automatically and does not delete the existing remote homepage.

1. Put these files on the `main` branch of `zhang-haichao/zhang-haichao.github.io`.
2. In the repository, open **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push `main` or manually run **Build and deploy GitHub Pages**.

The Pages workflow runs content, Scholar-safety, build, and browser tests before uploading `dist/`. It uses the GitHub Pages artifact/deployment actions with the minimum required permissions.

## Privacy and assets

The webpage exposes only the XJTLU and University of Liverpool academic email addresses. Phone number and private email are not rendered. The downloadable PDFs are the original user-provided files and are intentionally unmodified.

The education timeline uses locally archived, source-documented university logos. Dingfu Data uses an exact-company historical profile image because its former official site was unavailable during implementation. Alibaba is rendered as neutral HTML text instead of copying the restricted official media-library artwork. All marks remain the property of their owners, and the timeline does not imply endorsement. Exact sources and usage notes are recorded in `docs/sources.md`.
