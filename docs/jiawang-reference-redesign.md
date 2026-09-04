# Jia Wang Reference Redesign

## Goal

Rebuild Haichao Zhang's academic homepage using the supplied Jia Wang homepage source as the visual and structural reference, while keeping every biographical, publication, project, contact, and research detail specific to Haichao Zhang.

## Reference mapping

- Keep the reference site's restrained white academic layout, sticky masthead, compact typography, blue links, circular profile portrait, desktop sidebar, and responsive single-column mobile profile.
- Replace the current full-bleed editorial hero with a two-column academic composition: profile sidebar on the left and sectioned content on the right.
- Follow the reference publication pattern: framework figure on the left, venue badge and scholarly metadata on the right, with compact separators instead of decorative cards.
- Preserve Haichao's English-first interface and Chinese switch, Google Scholar publication sync, downloadable CVs, GitHub Pages workflow, image dialog, institutional logos, and open-source projects.

## Content structure

1. Sticky navigation: name, About, News, Experience & Education, Publications, Collaborative Work, Ongoing Research, Open Source, Intellectual Property, EN/中文.
2. Sidebar: portrait, name, role, affiliation, research interests, location, University of Liverpool email, Google Scholar, GitHub, and language-aware CV.
3. Main column: About Me, News, Experience & Education, Publications, Collaborative Publications, Ongoing Research, Open Source, Intellectual Property, Selected Awards.
4. Manually curated accepted papers appear first with supplied framework figures, code links, and a preprint placeholder until publication. CRAGRU remains in Publications. The perovskite study, CIL, CCL, UASD, and the bloodstain study appear in Collaborative Publications using the same card treatment, framework figures, links, and citation metadata.
5. Ongoing manuscripts use only the supplied framework figures and intentionally high-level descriptions.
6. Open Source highlights `axiom-quant`, `senpai-skill`, and `PaperReader`; paper implementation repositories remain attached to their publication entries.

## Responsive and visual acceptance

- Desktop content width stays near the reference's 1200px maximum, with a 220–240px sidebar and readable 16px body copy.
- The first heading remains compact (approximately 30px, never a promotional hero scale).
- At mobile widths the sidebar becomes a horizontal identity block, navigation collapses, publication figures stack above text, and no horizontal overflow occurs.
- Motion is limited to sticky-header refinement, mobile-menu disclosure, and short reveal transitions; reduced-motion users receive immediate content.
- All existing functional and Scholar-sync tests remain passing, with new browser assertions for the reference-style composition.

## Known asset boundary

The bloodstain deposition paper is rendered as a full Collaborative Publications entry. Its FTIR-Net framework is selected automatically from IEEE Xplore's public figures metadata using the Figure 2 caption, downloaded through IEEE's signed figure URL, converted to PNG, and recorded with provenance in `src/data/frameworks.json`.
