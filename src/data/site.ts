export type Language = 'en' | 'zh';

export type LocalizedText = Record<Language, string>;

export type Link = {
  label: LocalizedText;
  href: string;
};

export type AcceptedPublication = {
  key: string;
  shortName: string;
  title: string;
  authors: string;
  venueLabel: string;
  venue: string;
  description: LocalizedText;
  image: string;
  imageAlt: LocalizedText;
  preprintUrl: string | null;
  codeUrl: string | null;
  correspondingAuthor?: string;
};

export const profile = {
  name: {
    en: 'Haichao Zhang',
    zh: '张海超'
  },
  role: {
    en: 'Ph.D. Student · AIAC · XJTLU',
    zh: '博士研究生 · AIAC · 西交利物浦大学'
  },
  headline: {
    en: 'Trustworthy systems. Controllable recommendations.',
    zh: '让推荐系统更可信，也更可控。'
  },
  statement: {
    en: 'I study trustworthy and controllable recommender systems at the intersection of large language models, retrieval-augmented generation, machine unlearning, and model editing.',
    zh: '我的研究聚焦可信与可控推荐系统，探索大语言模型、检索增强生成、机器遗忘和模型编辑的交叉问题。'
  },
  location: {
    en: 'Suzhou, China',
    zh: '中国 · 苏州'
  },
  portrait: '/images/portrait-haichao.png',
  scholarId: 'zRvnGK0AAAAJ',
  email: 'zhc@liverpool.ac.uk',
  links: {
    github: 'https://github.com/zhang-haichao',
    scholar: 'https://scholar.google.com/citations?user=zRvnGK0AAAAJ&hl=en',
    supervisor: 'https://jiawang-sz.github.io/',
    cvEn: '/cv/haichao-zhang-en.pdf',
    cvZh: '/cv/haichao-zhang-zh.pdf'
  }
} as const;

export const about = {
  eyebrow: { en: 'About', zh: '关于我' },
  title: {
    en: 'Building recommendation models that can explain, adapt, and forget.',
    zh: '构建能够解释、适应与遗忘的推荐模型。'
  },
  body: {
    en: 'I am a Ph.D. student in the School of AI and Advanced Computing at Xi\'an Jiaotong-Liverpool University, advised by Prof. Jia Wang. My work asks how recommendation systems can use foundation models while remaining efficient, privacy-aware, and controllable in practice.',
    zh: '我是西交利物浦大学人工智能与先进计算学院博士研究生，导师为王佳教授。我的研究关注推荐系统如何在利用基础模型能力的同时，在真实应用中保持高效、隐私友好与可控。'
  }
} as const;

export const researchThemes = [
  {
    index: '01',
    title: { en: 'Recommendation Unlearning', zh: '推荐遗忘' },
    description: {
      en: 'Removing selected data influence precisely, without rebuilding the entire recommender.',
      zh: '精确移除指定数据的影响，同时避免完整重训推荐模型。'
    }
  },
  {
    index: '02',
    title: { en: 'LLMs for Recommendation', zh: '大模型推荐' },
    description: {
      en: 'Making language-model semantics useful for ranking while keeping online serving efficient.',
      zh: '让大模型语义真正服务于排序，同时保持在线推理高效。'
    }
  },
  {
    index: '03',
    title: { en: 'Responsible Personalization', zh: '负责任的个性化' },
    description: {
      en: 'Separating genuine user intent from bias, popularity, and unwanted behavioral influence.',
      zh: '区分真实用户意图与偏差、流行度及非期望行为影响。'
    }
  }
] as const;

export const news = [
  {
    date: '2026.08',
    text: {
      en: 'Two papers on explainable graph recommendation and topology-aware inverse preference learning were accepted by ICONIP 2026 in Melbourne.',
      zh: '两篇关于图推荐解释与拓扑感知逆偏好学习的论文被 ICONIP 2026 接收，会议将在墨尔本举行。'
    },
    href: '#publications'
  },
  {
    date: '2026.08',
    text: {
      en: 'Our DPU framework received a major revision decision from ACM Transactions on Information Systems.',
      zh: '我们的 DPU 框架收到 ACM Transactions on Information Systems 的大修意见。'
    },
    href: 'https://dl.acm.org/journal/tois/reviewers'
  },
  {
    date: '2026.08',
    text: {
      en: 'Two papers on controllable generative recommendation and recommendation unlearning were accepted by IEEE ICDM 2026.',
      zh: '两篇关于可控生成式推荐与推荐遗忘的论文被 IEEE ICDM 2026 接收。'
    },
    href: '#publications'
  },
  {
    date: '2025.11',
    text: {
      en: 'CRAGRU was accepted by IEEE ICDM 2025.',
      zh: 'CRAGRU 被 IEEE ICDM 2025 接收。'
    },
    href: 'https://arxiv.org/abs/2511.05494'
  },
  {
    date: '2024.05',
    text: {
      en: 'Our incremental learning work appeared in Knowledge-Based Systems.',
      zh: '增量学习研究发表于 Knowledge-Based Systems。'
    },
    href: 'https://doi.org/10.1016/j.knosys.2024.111612'
  }
] as const;

export const acceptedPublications: AcceptedPublication[] = [
  {
    key: 'regen',
    shortName: 'ReGen',
    title: 'Controllable Generative Recommendation via Guided Token Refinement',
    authors: 'Haichao Zhang, Zhixuan Liang, Chong Zhang, Zixi Chen, Wen Wang, Jia Wang',
    venueLabel: 'IEEE ICDM 2026',
    venue: '2026 IEEE International Conference on Data Mining (ICDM), accepted',
    description: {
      en: 'A controllable generative recommendation framework that refines semantic tokens under explicit guidance for more reliable alignment with user intent.',
      zh: '一种可控生成式推荐框架，通过显式引导细化语义 token，使生成结果与用户意图更加可靠地对齐。'
    },
    image: '/images/papers/regen.png',
    imageAlt: {
      en: 'ReGen framework for controllable generative recommendation via guided token refinement',
      zh: '基于引导式 token 细化的 ReGen 可控生成式推荐框架图'
    },
    preprintUrl: null,
    codeUrl: 'https://github.com/zhang-haichao/ReGen'
  },
  {
    key: 'explain-then-forget',
    shortName: 'Explain-then-Forget',
    title: 'Explain-then-Forget: Causal Explanation-based Unlearning for Efficient and Precise Recommendation',
    authors: 'Haichao Zhang, Chong Zhang, Wen Wang, Shi Qiu, Peiyu Hu, Jia Wang',
    venueLabel: 'IEEE ICDM 2026',
    venue: '2026 IEEE International Conference on Data Mining (ICDM), accepted',
    description: {
      en: 'An efficient recommendation unlearning framework that uses causal explanations to localize and precisely remove the influence of target interactions.',
      zh: '一种高效推荐遗忘框架，利用因果解释定位并精确移除目标交互产生的影响。'
    },
    image: '/images/papers/ceu.png',
    imageAlt: {
      en: 'Explain-then-Forget framework for causal explanation-based recommendation unlearning',
      zh: '基于因果解释的 Explain-then-Forget 推荐遗忘框架图'
    },
    preprintUrl: null,
    codeUrl: 'https://github.com/zhang-haichao/Explain-and-Forget'
  }
];

export const lowerPriorityAcceptedPublications: AcceptedPublication[] = [
  {
    key: 'cosrec',
    shortName: 'CoSRec',
    title: 'Explaining Graph Recommendations via Counterfactual Support Sets',
    authors: 'Haichao Zhang, Chong Zhang, Can Wang, Shi Qiu, Jia Wang',
    venueLabel: 'ICONIP 2026',
    venue: '33rd International Conference on Neural Information Processing (ICONIP 2026), accepted',
    description: {
      en: 'A counterfactual explanation framework that identifies compact support sets whose removal changes a target user\'s recommendation without retraining the graph recommender.',
      zh: '一种反事实图推荐解释框架，在无需重训练图推荐模型的情况下，识别能够改变目标用户推荐结果的紧凑支持集。'
    },
    image: '/images/papers/cosrec.png',
    imageAlt: {
      en: 'CoSRec framework for explaining graph recommendations through counterfactual support sets',
      zh: '通过反事实支持集解释图推荐的 CoSRec 框架图'
    },
    preprintUrl: null,
    codeUrl: 'https://github.com/zhang-haichao/CoSRec'
  },
  {
    key: 'tipl',
    shortName: 'TIPL',
    title: 'Topology-Aware Inverse Preference Learning for Robust Hybrid Voting Systems',
    authors: 'Can Wang, Shi Qiu, Haichao Zhang',
    venueLabel: 'ICONIP 2026',
    venue: '33rd International Conference on Neural Information Processing (ICONIP 2026), accepted',
    description: {
      en: 'A topology-aware inverse preference learning framework for reconstructing latent crowd preferences and auditing robustness, conflict, and merit alignment in hybrid voting systems.',
      zh: '一种面向混合投票系统的拓扑感知逆偏好学习框架，用于重建潜在人群偏好，并分析鲁棒性、拓扑冲突与能力对齐。'
    },
    image: '/images/papers/tipl.png',
    imageAlt: {
      en: 'TIPL framework for topology-aware inverse preference learning in hybrid voting systems',
      zh: '面向混合投票系统的 TIPL 拓扑感知逆偏好学习框架图'
    },
    preprintUrl: null,
    codeUrl: null,
    correspondingAuthor: 'Haichao Zhang'
  }
];

export const publicationPresentation = [
  {
    shortName: 'CRAGRU',
    title: 'Customized Retrieval-Augmented Generation with LLM for Debiasing Recommendation Unlearning',
    venueLabel: 'IEEE ICDM 2025',
    image: '/images/papers/cragru.png',
    imageAlt: {
      en: 'CRAGRU framework showing retrieval, augmentation, and generation stages',
      zh: 'CRAGRU 的检索、增强与生成三阶段框架图'
    },
    description: {
      en: 'A retrieval-augmented generation framework for user-level recommendation unlearning that limits collateral effects on non-target users while preserving recommendation quality.',
      zh: '面向用户级推荐遗忘的检索增强生成框架，在保留推荐质量的同时，减少遗忘操作对非目标用户的连带影响。'
    },
    extraLinks: [
      {
        label: { en: 'Preprint', zh: '预印本' },
        href: 'https://arxiv.org/abs/2511.05494'
      },
      {
        label: { en: 'Code', zh: '代码' },
        href: 'https://github.com/zhang-haichao/LLM_rec_unlearning'
      },
      {
        label: { en: 'Project', zh: '项目' },
        href: 'https://zhanghaichao.loc.cc/CRAGRU-Page/'
      }
    ] satisfies Link[]
  },
  {
    shortName: 'Perovskite QDs',
    title: 'Machine Vision-Enabled Octahedral Network Reconstruction and Structural Analysis of Perovskite Quantum Dots',
    venueLabel: 'ACS Nano 2026',
    image: '/images/papers/perovskite-qds.png',
    imageAlt: {
      en: 'Machine-vision framework for octahedral network reconstruction and structural analysis of perovskite quantum dots',
      zh: '钙钛矿量子点八面体网络重建与结构分析的机器视觉框架图'
    },
    description: null,
    extraLinks: [
      {
        label: { en: 'Code', zh: '代码' },
        href: 'https://github.com/GDragon126651/Perovskite_Octahedral_Reconstruction'
      },
      {
        label: { en: 'Project', zh: '项目' },
        href: 'https://zhanghaichao.loc.cc/S2-SOFS-Page/'
      }
    ] satisfies Link[]
  },
  {
    shortName: 'CIL',
    title: 'Clustering-based incremental learning for imbalanced data classification',
    venueLabel: 'Knowledge-Based Systems 2024',
    image: '/images/papers/cil.png',
    imageAlt: {
      en: 'Clustering-based data reorganization and incremental learning framework for imbalanced classification',
      zh: '面向不平衡分类的聚类数据重组与增量学习框架图'
    },
    description: null,
    extraLinks: [
      {
        label: { en: 'Code', zh: '代码' },
        href: 'https://github.com/ybyangjing/CTA'
      }
    ] satisfies Link[]
  },
  {
    shortName: 'CCL',
    title: 'Counterfactual Contrastive Learning for Fine Grained Image Classification',
    venueLabel: 'ICANN 2024',
    image: '/images/papers/ccl.png',
    imageAlt: {
      en: 'Counterfactual contrastive learning framework for fine-grained image classification',
      zh: '面向细粒度图像分类的反事实对比学习框架图'
    },
    description: null,
    extraLinks: [] satisfies Link[]
  },
  {
    shortName: 'UASD',
    title: 'Uncertainty-Aware Semantic Decoding for LLM-Based Sequential Recommendation',
    venueLabel: 'APWeb-WAIM 2025',
    image: '/images/papers/uasd.png',
    imageAlt: {
      en: 'Uncertainty-aware semantic clustering and adaptive decoding framework for sequential recommendation',
      zh: '面向序列推荐的不确定性感知语义聚类与自适应解码框架图'
    },
    description: null,
    extraLinks: [] satisfies Link[]
  }
] as const;

export const ongoingResearch = [
  {
    key: 'teaching-to-forget',
    title: 'Teaching to Forget: Dual-Teacher Distilled Prompt-Tuning for Efficient Recommendation Unlearning',
    status: {
      en: 'ACM Transactions on Information Systems · Major Revision',
      zh: 'ACM Transactions on Information Systems · 大修'
    },
    description: {
      en: 'A lightweight study of on-demand recommendation unlearning that aims to preserve utility for unaffected users.',
      zh: '一项轻量级按需推荐遗忘研究，目标是在移除指定影响的同时保留未受影响用户的推荐效用。'
    },
    image: '/images/papers/teaching-to-forget.png'
  },
  {
    key: 'pcdr',
    title: 'Personalized Conformity Disentanglement for Debiased Recommendations',
    status: {
      en: 'International Journal of Machine Learning and Cybernetics (JMLC) · Under Review',
      zh: 'International Journal of Machine Learning and Cybernetics（JMLC）· 审稿中'
    },
    description: {
      en: 'A debiasing study that distinguishes personal preference signals from conformity effects for more faithful personalization.',
      zh: '一项推荐去偏研究，通过区分个体偏好与从众效应，实现更忠实的个性化。'
    },
    image: '/images/papers/pcdr.png'
  },
  {
    key: 'drumrec',
    title: 'Dual-Rate User Semantic Memory for LLM-Enhanced Sequential Recommendation',
    status: {
      en: 'AAAI 2026 · Under Review',
      zh: 'AAAI 2026 · 审稿中'
    },
    description: {
      en: 'A dual-rate semantic memory for efficient LLM-enhanced sequential recommendation, designed to retain rich user semantics with lightweight online serving.',
      zh: '一种面向高效大模型增强序列推荐的双速率语义记忆，在轻量在线服务中保留丰富用户语义。'
    },
    image: '/images/papers/drumrec.png'
  }
] as const;

export const education = [
  {
    period: '2024–Present',
    institution: {
      en: "Xi'an Jiaotong-Liverpool University",
      zh: '西交利物浦大学'
    },
    degree: {
      en: 'Ph.D. in Computer Science and Software Engineering',
      zh: '计算机科学与软件工程博士'
    },
    note: {
      en: 'School of AI and Advanced Computing · Degree awarded by the University of Liverpool',
      zh: '人工智能与先进计算学院 · 学位由利物浦大学授予'
    },
    logo: '/images/institutions/xjtlu-official.svg',
    logoAlt: 'XJTLU',
    secondaryLogo: '/images/institutions/liverpool-official.svg',
    secondaryLogoAlt: 'University of Liverpool',
    href: 'https://www.xjtlu.edu.cn/en/study/departments/school-of-ai-and-advanced-computing/'
  },
  {
    period: '2022–2024',
    institution: {
      en: "Xi'an Jiaotong-Liverpool University",
      zh: '西交利物浦大学'
    },
    degree: {
      en: 'M.Res. in Computer Science',
      zh: '计算机科学研究型硕士'
    },
    note: {
      en: 'Distinction · Top 1%',
      zh: 'Distinction · 专业前 1%'
    },
    logo: '/images/institutions/xjtlu-official.svg',
    logoAlt: 'XJTLU',
    secondaryLogo: null,
    secondaryLogoAlt: null,
    href: 'https://www.xjtlu.edu.cn/'
  },
  {
    period: '2014–2018',
    institution: {
      en: 'East China Jiaotong University',
      zh: '华东交通大学'
    },
    degree: {
      en: 'B.Eng. in Computer Science and Technology',
      zh: '计算机科学与技术工学学士'
    },
    note: {
      en: 'GPA 87/100',
      zh: 'GPA 87/100'
    },
    logo: '/images/institutions/ecjtu-user.png',
    logoAlt: 'ECJTU',
    secondaryLogo: null,
    secondaryLogoAlt: null,
    href: 'https://www.ecjtu.edu.cn/'
  }
] as const;

export const experience = [
  {
    period: '2018.11–2022.08',
    organization: {
      en: 'Alibaba · Beijing',
      zh: '阿里巴巴 · 北京'
    },
    role: {
      en: 'Development Engineer',
      zh: '开发工程师'
    },
    description: {
      en: 'Built audience and recommendation data infrastructure for the DMP platform, including engine control, observability, and large-scale inspection and attribution systems.',
      zh: '参与 DMP 人群与推荐数据平台建设，负责计算引擎管控、可观测性及大规模巡检归因系统。'
    },
    logo: '/images/institutions/alibaba-user.png',
    logoAlt: 'Alibaba',
    href: 'https://www.alibabagroup.com/'
  },
  {
    period: '2018.07–2018.11',
    organization: {
      en: 'Dingfu Data Technology · Beijing',
      zh: '鼎富智能科技 · 北京'
    },
    role: {
      en: 'Development Engineer',
      zh: '开发工程师'
    },
    description: {
      en: 'Worked on computer-vision algorithms and image-processing pipelines, with a focus on watermark removal.',
      zh: '从事计算机视觉算法与图像处理流程研发，主要研究图像水印去除。'
    },
    logo: '/images/institutions/dingfu-archive.png',
    logoAlt: 'Dingfu Data',
    href: '#experience'
  }
] as const;

export const openSource = [
  {
    name: 'axiom-quant',
    description: {
      en: 'A local-first open-source A-share quantitative research and batch backtesting platform.',
      zh: '本地优先的开源 A 股量化研究与批量回测平台。'
    },
    language: 'Python',
    href: 'https://github.com/zhang-haichao/axiom-quant'
  },
  {
    name: 'senpai-skill',
    description: {
      en: 'An open-source AI research mentor skill for shaping topics, planning experiments, and improving academic work.',
      zh: '开源 AI 科研导师 Skill，支持选题打磨、实验规划与学术工作改进。'
    },
    language: 'Python',
    href: 'https://github.com/zhang-haichao/senpai-skill'
  },
  {
    name: 'PaperReader',
    description: {
      en: 'A compact home for structured paper reading, research notes, and reusable academic insights.',
      zh: '用于结构化论文阅读、研究笔记与学术知识沉淀的轻量开源项目。'
    },
    language: 'TypeScript',
    href: 'https://github.com/zhang-haichao/PaperReader'
  }
] as const;

export const intellectualProperty = [
  {
    key: 'cn117312675a',
    kind: 'patent',
    year: '2023',
    type: {
      en: 'Invention Patent Application',
      zh: '发明专利申请'
    },
    title: {
      en: 'A Debiasing Method and Recommendation System Based on Personalized Causal Decomposition',
      zh: '一种基于个性化因果分解的去偏方法及推荐系统'
    },
    number: 'CN117312675A',
    detail: {
      en: 'Co-inventor · Published on December 29, 2023',
      zh: '共同发明人 · 2023 年 12 月 29 日公开'
    },
    image: '/images/intellectual-property/cn117312675a.jpg',
    imageAlt: {
      en: 'First page of the CN117312675A invention patent application',
      zh: 'CN117312675A 发明专利申请首页'
    }
  },
  {
    key: 'copyright-pcdr',
    kind: 'copyright',
    year: '2025',
    type: {
      en: 'Software Copyright',
      zh: '计算机软件著作权'
    },
    title: {
      en: 'Unbiased Recommendation Algorithm System Based on Personalized Conformity Disentanglement V1.0',
      zh: '基于个性化从众解耦的无偏推荐算法系统 V1.0'
    },
    number: '2025SR0516629',
    detail: {
      en: 'Registered software copyright',
      zh: '计算机软件著作权登记证书'
    },
    image: '/images/intellectual-property/copyright-pcdr.jpg',
    imageAlt: {
      en: 'Software copyright certificate 2025SR0516629',
      zh: '软件著作权登记证书 2025SR0516629'
    }
  },
  {
    key: 'copyright-yibu',
    kind: 'copyright',
    year: '2018',
    type: {
      en: 'Software Copyright',
      zh: '计算机软件著作权'
    },
    title: {
      en: 'Large-Scale Road-Network Taxi Dynamic Dispatching Platform for Mobile Internet Ridesharing (YiBu) V1.0',
      zh: '移动互联网+拼车模式下大规模路网出租车动态调度组织平台［简称：易步］V1.0'
    },
    number: '2018SR047738',
    detail: {
      en: 'Registered software copyright',
      zh: '计算机软件著作权登记证书'
    },
    image: '/images/intellectual-property/copyright-yibu.jpg',
    imageAlt: {
      en: 'Software copyright certificate 2018SR047738',
      zh: '软件著作权登记证书 2018SR047738'
    }
  },
  {
    key: 'copyright-rail-android',
    kind: 'copyright',
    year: '2018',
    type: {
      en: 'Software Copyright',
      zh: '计算机软件著作权'
    },
    title: {
      en: 'Android-Based Railway Equipment Inspection System (Railway Inspection Equipment APP) V1.0',
      zh: '基于安卓的铁路设备巡检系统［简称：铁路巡检设备 APP］V1.0'
    },
    number: '2018SR717297',
    detail: {
      en: 'Registered software copyright',
      zh: '计算机软件著作权登记证书'
    },
    image: '/images/intellectual-property/copyright-rail-android.jpg',
    imageAlt: {
      en: 'Software copyright certificate 2018SR717297',
      zh: '软件著作权登记证书 2018SR717297'
    }
  },
  {
    key: 'copyright-rail-web',
    kind: 'copyright',
    year: '2018',
    type: {
      en: 'Software Copyright',
      zh: '计算机软件著作权'
    },
    title: {
      en: 'Web-Based Railway Equipment Inspection System (Railway Inspection Equipment System) V1.0',
      zh: '基于 WEB 端的铁路设备巡检系统［简称：铁路巡检设备系统］V1.0'
    },
    number: '2018SR643652',
    detail: {
      en: 'Registered software copyright',
      zh: '计算机软件著作权登记证书'
    },
    image: '/images/intellectual-property/copyright-rail-web.jpg',
    imageAlt: {
      en: 'Software copyright certificate 2018SR643652',
      zh: '软件著作权登记证书 2018SR643652'
    }
  }
] as const;

export const awards = [
  {
    year: '2016',
    title: {
      en: 'First Prize, National Railway Transportation Student Thesis Competition',
      zh: '全国轨道交通高校学生优秀论文一等奖'
    }
  },
  {
    year: '2016',
    title: {
      en: 'Second Prize, Jiangxi Computer Works and Internet Innovation Competition',
      zh: '江西省计算机作品赛暨“互联网+”创新创业大赛二等奖'
    }
  },
  {
    year: '2016',
    title: {
      en: 'Third Prize, National Internet Transportation Innovation Competition',
      zh: '全国高校“互联网交通”创新创业大赛三等奖'
    }
  },
  {
    year: '2015',
    title: {
      en: 'First Prize, ECJTU ACM Programming Competition',
      zh: '华东交通大学 ACM 程序设计竞赛一等奖'
    }
  }
] as const;
