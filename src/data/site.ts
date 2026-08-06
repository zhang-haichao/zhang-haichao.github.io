export type Language = 'en' | 'zh';

export type LocalizedText = Record<Language, string>;

export type Link = {
  label: LocalizedText;
  href: string;
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
  emailPrimary: 'haichao.zhang22@student.xjtlu.edu.cn',
  emailSecondary: 'zhc@liverpool.ac.uk',
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
    date: '2026.02',
    text: {
      en: 'Our machine-vision study of perovskite quantum dots was published in ACS Nano.',
      zh: '钙钛矿量子点机器视觉研究发表于 ACS Nano。'
    },
    href: 'https://doi.org/10.1021/acsnano.5c20211'
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

export const selectedResearch = [
  {
    shortName: 'CRAGRU',
    title: {
      en: 'Customized Retrieval-Augmented Generation with LLM for Debiasing Recommendation Unlearning',
      zh: '基于定制检索增强生成的去偏推荐遗忘'
    },
    venue: 'IEEE ICDM 2025',
    description: {
      en: 'A retrieval-augmented generation framework for user-level recommendation unlearning that limits collateral effects on non-target users while preserving recommendation quality.',
      zh: '面向用户级推荐遗忘的检索增强生成框架，在保留推荐质量的同时，减少遗忘操作对非目标用户的连带影响。'
    },
    image: '/images/papers/cragru.png',
    imageAlt: {
      en: 'CRAGRU framework showing retrieval, augmentation, and generation stages',
      zh: 'CRAGRU 的检索、增强与生成三阶段框架图'
    },
    links: [
      {
        label: { en: 'Paper', zh: '论文' },
        href: 'https://arxiv.org/abs/2511.05494'
      },
      {
        label: { en: 'Code', zh: '代码' },
        href: 'https://github.com/zhang-haichao/LLM_rec_unlearning'
      },
      {
        label: { en: 'Project', zh: '项目' },
        href: 'https://github.com/zhang-haichao/CRAGRU-Page'
      }
    ] satisfies Link[]
  }
] as const;

export const ongoingResearch = [
  {
    key: 'teaching-to-forget',
    title: 'Teaching to Forget: Dual-Teacher Distilled Prompt-Tuning for Efficient Recommendation Unlearning',
    description: {
      en: 'A lightweight study of on-demand recommendation unlearning that aims to preserve utility for unaffected users.',
      zh: '一项轻量级按需推荐遗忘研究，目标是在移除指定影响的同时保留未受影响用户的推荐效用。'
    },
    image: '/images/papers/teaching-to-forget.png'
  },
  {
    key: 'regen',
    title: 'Controllable Generative Recommendation via Guided Token Refinement',
    description: {
      en: 'A controllable generative recommendation study focused on more reliable alignment between user intent and generated recommendations.',
      zh: '一项可控生成式推荐研究，关注用户意图与生成推荐结果之间更可靠的对齐。'
    },
    image: '/images/papers/regen.png'
  },
  {
    key: 'pcdr',
    title: 'Personalized Conformity Disentanglement for Debiased Recommendations',
    description: {
      en: 'A debiasing study that distinguishes personal preference signals from conformity effects for more faithful personalization.',
      zh: '一项推荐去偏研究，通过区分个体偏好与从众效应，实现更忠实的个性化。'
    },
    image: '/images/papers/pcdr.png'
  },
  {
    key: 'ceu',
    title: 'Explain-then-Forget: Causal Explanation-based Unlearning for Efficient and Precise Recommendation',
    description: {
      en: 'An efficient recommendation unlearning study investigating how causal explanations can guide precise forgetting.',
      zh: '一项高效推荐遗忘研究，探索因果解释如何指导更加精确的遗忘。'
    },
    image: '/images/papers/ceu.png'
  },
  {
    key: 'drumrec',
    title: 'Dual-Rate User Semantic Memory for LLM-Enhanced Sequential Recommendation',
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
    logo: '/images/institutions/xjtlu.svg',
    logoAlt: 'XJTLU',
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
    logo: '/images/institutions/xjtlu.svg',
    logoAlt: 'XJTLU',
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
    logo: '/images/institutions/ecjtu.svg',
    logoAlt: 'ECJTU',
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
    logo: '/images/institutions/alibaba.svg',
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
    logo: '/images/institutions/dingfu.svg',
    logoAlt: 'Dingfu Data',
    href: '#experience'
  }
] as const;

export const openSource = [
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

