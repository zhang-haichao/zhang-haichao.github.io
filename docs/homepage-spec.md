# Haichao Zhang Academic Homepage — Implementation Specification

## Goal

Build a polished, single-page academic homepage for GitHub Pages. English is the default language and all visible content can be switched to Chinese without navigating to a second page.

## Identity and positioning

- Haichao Zhang / 张海超
- Ph.D. Student, School of AI and Advanced Computing (AIAC), Xi'an Jiaotong-Liverpool University (XJTLU)
- Ph.D. in Computer Science and Software Engineering at XJTLU, degree awarded by the University of Liverpool, 2024–Present
- Research positioning: Trustworthy and Controllable Recommender Systems
- Research topics: Recommender Systems, Large Language Models, Retrieval-Augmented Generation, Machine Unlearning, and Model Editing
- Supervisor: Prof. Jia Wang, linking to https://jiawang-sz.github.io/

## Public contact and privacy

- Show only `zhc@liverpool.ac.uk`; do not render the XJTLU student address.
- Do not display phone number or private email on the webpage.
- Provide the original English and Chinese CV PDF files as downloads without editing or redaction.

## Page composition

1. Full-bleed opening composition with name, role, research statement, two calls to action, and the approved academic portrait.
2. About and research focus.
3. News highlights.
4. Selected Research with framework figures, concise contributions, and Paper/Code/Project links.
5. Publications sourced from Google Scholar and rendered from repository data, including “Two-branch Network with Feature Fusion for Time Since Deposition Estimation of Bloodstains”. Manually curated accepted papers may appear before publication with a clearly marked preprint placeholder.
6. Ongoing Research with public-safe summaries only. Include Teaching to Forget, PCDR, and DRUMRec. Exclude DURE. ReGen and Explain-then-Forget moved to Publications after their IEEE ICDM 2026 acceptance on 2026-08-17.
7. Experience and Education with institution/company logos.
8. Open Source containing `axiom-quant`, `senpai-skill`, and `PaperReader`.
9. Intellectual Property with one published invention patent application and four registered software copyrights. Use compressed previews of the supplied official documents, but do not publish the original PDFs for download.
10. Awards and contact/footer.

## Publication and automation rules

- Google Scholar profile ID: `zRvnGK0AAAAJ`.
- Scholar-listed works belong in Publications.
- CRAGRU is an academic paper implementation and appears with the published paper, not in Open Source.
- A scheduled GitHub Action updates publication data safely: pinned/current actions, explicit permissions, concurrency control, validation before replacement, commit only when changed, and no force-push.
- If Scholar is temporarily inaccessible, keep the last valid publication data and fail without erasing content.
- The Action may extract framework figures only from reviewed public PDFs, Scholar e-prints, or reviewed publisher figure APIs. Papers without an accessible source remain visible; no figure is fabricated.

## Visual direction

- Editorial academic design: warm ivory paper, deep ink/navy text, restrained amber and teal accents, expressive serif display type paired with a humanist sans serif.
- The first viewport reads as one composition, not a dashboard; no hero cards, floating badges, or stat strips.
- Framework figures are visual anchors for research sections, with restrained borders and spacious typography rather than generic card grids.
- Include subtle hero entrance, scroll reveal, and active navigation motion; honor `prefers-reduced-motion`.
- Responsive at desktop, tablet, and mobile widths; accessible focus states, semantic landmarks, alt text, and sufficient contrast.

## Delivery constraints

- Static site suitable for the `zhang-haichao.github.io` repository.
- Local project path: `C:\Users\zhang\OneDrive\Desktop\zhang-haichao-academic-homepage`.
- Do not delete or modify the existing remote homepage repository without separate authorization.
- Do not copy the credential-like Gitalk configuration found in the old repository.
