# Haichao Zhang · Academic Homepage

A bilingual, single-page academic homepage for GitHub Pages. English is the default language; Chinese can be enabled from the header without leaving the page.

## What is included

- Jia Wang-inspired academic layout with a compact profile sidebar and readable main column
- English/Chinese content with a persisted language preference
- Selected Research and public-safe Ongoing Research framework previews
- Google Scholar-backed papers with citation counts, grouped into Publications and Collaborative Publications without dropping automatically discovered work
- Intellectual Property with one patent-application preview and four software-copyright certificate previews
- Curated publication ordering with zoomable framework figures and automatic publisher-figure support
- Education and industry timelines with locally archived, source-documented institution logos
- Open Source featuring `axiom-quant`, `senpai-skill`, and `PaperReader`
- Original English and Chinese CV PDFs
- Unlisted, noindex archive of the previous Jekyll homepage at `/legacy/`
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
| Reviewed PDF or publisher-figure sources | `src/data/framework-sources.json` |
| Framework extraction manifest | `src/data/frameworks.json` |
| Research figures | `public/images/papers/` (automatic output is under `auto/`) |
| Portrait | `public/images/portrait-haichao.png` |
| Institution identifiers and logos | `public/images/institutions/` |
| Downloadable CVs | `public/cv/` |
| Previous homepage archive | `public/legacy/` |
| Visual system | `src/styles/global.css` |

The original source folders `PHOTO/`, `PAPER_FIGURES/`, and `CV/` remain local and are intentionally ignored by Git. The deployable copies in `public/` are tracked.

Ongoing Research descriptions should stay concise and public-safe. When adding or removing an item, update both languages and run `npm run test:all`.

## Google Scholar sync

`.github/workflows/scholar-sync.yml` runs every Monday at 03:17 UTC (11:17 China Standard Time) and can also be started manually from the Actions tab. It uses Scholar profile ID `zRvnGK0AAAAJ`.

For a manual framework-only retry when Google Scholar is rate-limited, start the workflow with **Use cached publication data and sync framework figures only** enabled. The weekly schedule keeps the default off and still refreshes Scholar metadata before framework extraction.

The workflow:

1. fetches the public Scholar profile;
2. normalizes titles, authors, venues, links, years, and citation counts;
3. rejects empty, malformed, duplicate, or suspiciously truncated results;
4. writes atomically only after validation;
5. attempts framework extraction from a Scholar public e-print, a reviewed public PDF, or a reviewed publisher figures API listed in `src/data/framework-sources.json`;
6. keeps the last valid image if a source becomes temporarily unavailable or extraction fails;
7. runs content tests and builds the site; and
8. commits only changed publication metadata, the framework manifest, and automatic framework images.

All valid works returned by the configured Scholar profile are rendered across Publications and Collaborative Publications; automatic discovery never creates an “Additional publications” category or omits a work. Submitted and early-stage manuscripts are maintained separately in Ongoing Research. A paper without a reviewed figure source still appears with its publication metadata and citation count. The workflow never invents a PDF URL or substitutes an unrelated image.

If Google Scholar rate-limits a run, the workflow fails without replacing the last valid publication file. Likewise, a failed automatic extraction does not delete the previous valid figure. No API key or repository secret is required.

To exercise the safe offline path:

```bash
python scripts/update_scholar.py \
  --fixture tests/fixtures/scholar-profile.json \
  --output .mission/publications-fixture.json
```

The updater rejects any decrease in publication count by default, so a partial or rate-limited Scholar response cannot silently remove existing work. For an intentional, reviewed deletion, add `--allow-removals`; the scheduled Action never enables this override.

To approve a framework source, add either its HTTPS `pdfUrl` with optional page/crop guidance or a reviewed `ieeeDocumentId` with caption keywords to `src/data/framework-sources.json`, then run:

```bash
python scripts/sync_framework_figures.py
```

Only use an author manuscript, preprint, or other PDF that may be downloaded and republished for this purpose. Closed-access publisher PDFs are not bypassed. For the bloodstain paper, the workflow reads IEEE Xplore's public figure metadata, selects the framework by its caption, requests IEEE's signed image URL, and stores the resulting PNG with provenance in the manifest.

## Archived previous homepage

The previous Jekyll blog is preserved at `https://zhang-haichao.github.io/legacy/`. It is intentionally absent from the new homepage navigation and marked `noindex, nofollow, noarchive`; `public/robots.txt` also asks crawlers not to visit the path. This is an unlisted public URL, not password protection.

The archived HTML is generated from the rendered legacy site and the `origin/master` static assets. Historical Gitalk credential configuration and service-worker registration are removed before files are written. To rebuild the archive locally:

```powershell
npm run archive:legacy -- -Proxy http://127.0.0.1:7897
```

## Deploying to `zhang-haichao.github.io`

1. Put these files on the `main` branch of `zhang-haichao/zhang-haichao.github.io` while retaining the previous `master` history.
2. In the repository, open **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push `main` or manually run **Build and deploy GitHub Pages**.

The Pages workflow runs content, Scholar-safety, build, and browser tests before uploading `dist/`. It uses the GitHub Pages artifact/deployment actions with the minimum required permissions.

## Privacy and assets

The webpage exposes only the University of Liverpool academic email address. The XJTLU student address, phone number, and private email are not rendered. The downloadable PDFs are the original user-provided files and are intentionally unmodified.

The education and industry timelines use locally archived, source-documented identifiers. The ECJTU and Alibaba images are user-provided assets selected for this homepage; Dingfu Data uses an exact-company historical profile image because its former official site was unavailable during implementation. All marks remain the property of their owners, and the timeline does not imply endorsement. Exact sources and usage notes are recorded in `docs/sources.md`.
