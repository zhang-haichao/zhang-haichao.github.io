# Content sources

This file records the public sources used to seed publication metadata and institutional links. The scheduled Scholar updater remains the long-term source for the Publications list.

- Google Scholar profile: https://scholar.google.com/citations?user=zRvnGK0AAAAJ&hl=en
- CRAGRU: https://arxiv.org/abs/2511.05494
- CRAGRU project page: https://zhang-haichao.github.io/CRAGRU-Page/
- CRAGRU framework provenance: Figure 2 on page 4 of the author preprint https://arxiv.org/pdf/2511.05494, extracted to `public/images/papers/auto/cragru.png` and recorded in `src/data/frameworks.json`.
- Perovskite quantum dots article: https://doi.org/10.1021/acsnano.5c20211
- Perovskite quantum dots project page: https://zhang-haichao.github.io/S2-SOFS-Page/
- Perovskite quantum dots implementation: https://github.com/GDragon126651/Perovskite_Octahedral_Reconstruction
- Uncertainty-Aware Semantic Decoding: https://arxiv.org/abs/2508.07210
- Clustering-based incremental learning: https://doi.org/10.1016/j.knosys.2024.111612
- Counterfactual Contrastive Learning: https://doi.org/10.1007/978-3-031-72341-4_12
- Two-branch bloodstain network: https://doi.org/10.1109/CSCWD61410.2024.10580800. Framework provenance: Figure 2 (“Overall architecture of FTIR-Net”) from IEEE Xplore's public figures endpoint at https://ieeexplore.ieee.org/document/10580800/figures, selected by caption and saved as `public/images/papers/auto/two-branch-bloodstain.png`; the IEEE document ID, figure ID, caption, dimensions, and digest are recorded in `src/data/frameworks.json`.
- XJTLU School of AI and Advanced Computing: https://www.xjtlu.edu.cn/en/study/departments/school-of-ai-and-advanced-computing/
- XJTLU header logo: https://www.xjtlu.edu.cn/wp-content/uploads/2024/01/en-header-logo.svg
- University of Liverpool header logo: https://www.liverpool.ac.uk/ (the inline `rb-header__logo` SVG was archived without changing its paths or proportions)
- East China Jiaotong University identifier: user-provided local asset from `PAPER_FIGURES/ecjtu.png`, published as `public/images/institutions/ecjtu-user.png`.
- Alibaba identifier: user-provided local asset from `PAPER_FIGURES/alilogo.png`, published as `public/images/institutions/alibaba-user.png`.
- Dingfu Data company profile and archived logo: https://pitchhub.36kr.com/project/2316725606435333
- Previous homepage archive: rendered pages from https://zhang-haichao.github.io/ and static assets from remote commit `1dc77dd` on the former `master` branch; Gitalk credential configuration is intentionally excluded.

The publication-code audit on 2026-08-11 found no author-verifiable repository URL in the UASD arXiv paper, the CIL and CCL publisher pages, the bloodstain paper record, exact-title GitHub code search, or method-name repository search. Those papers therefore remain without a Code link rather than pointing to a cited method or third-party reproduction.

The local copies are used only to identify the corresponding education or employment record. The ECJTU and Alibaba files are the user-provided versions requested for this homepage. All trademarks remain the property of their owners; the page does not imply endorsement. The Dingfu Data website listed by its company profile (`http://www.dingfudata.com/`) was unavailable during implementation, so the exact-company 36Kr profile image is retained as a documented archival fallback rather than presented as a current official download. If an employer-supplied original becomes available, replace that one file before publication.
