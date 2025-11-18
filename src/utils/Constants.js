import { Check } from "lucide-react";

// nodes
export const nodes = [
    { id: 'core', position: { x: 600, y: 320 }, data: { label: 'QBMS Core\n(Bank • Rules • Versions • Search)' }, style: { width: 260 }, type: 'default' },
  
    // Inbound
    { id: 'authoring', position: { x: 240, y: 180 }, data: { label: 'Authoring UI' } },
    { id: 'import',    position: { x: 180, y: 320 }, data: { label: 'Bulk Import\n(DOCX/CSV/XLSX)' } },
    // { id: 'api',       position: { x: 240, y: 460 }, data: { label: 'API Ingest' } },
  
    // Processing ring
    { id: 'normalize', position: { x: 480, y: 180 }, data: { label: 'Normalization & Tagging' } },
    { id: 'dedup',     position: { x: 540, y: 90  }, data: { label: 'Similarity & De-dup' } },
    { id: 'validate',  position: { x: 720, y: 90  }, data: { label: 'Validation' } },
    { id: 'version',   position: { x: 820, y: 180 }, data: { label: 'Version Control' } },
  
    // Collaboration
    { id: 'review',    position: { x: 600, y: 20  }, data: { label: 'Review & Approvals' } },
    { id: 'roles',     position: { x: 780, y: 20  }, data: { label: 'Roles & Permissions' } },
  
    // Assembly
    { id: 'blueprint', position: { x: 960, y: 260 }, data: { label: 'Blueprint Rules' } },
    { id: 'builder',   position: { x: 1040, y: 360 }, data: { label: 'Exam Builder' } },
  
    // Outbound
    { id: 'exports',   position: { x: 900, y: 520 }, data: { label: 'Exports\nPDF • DOCX • CSV • JSON' } },
    { id: 'integrate', position: { x: 1080, y: 520 }, data: { label: 'Integrations\nLMS • Proctoring • APIs' } },
  
    // Feedback
    { id: 'analytics', position: { x: 520, y: 540 }, data: { label: 'Analytics\nItem & Paper Stats' } },
    { id: 'revise',    position: { x: 360, y: 540 }, data: { label: 'Revise Items' } },
  ];
  
  // edges
  export const edges = [
    // inbound -> processing/core
    { id: 'a-core', source: 'authoring', target: 'normalize' },
    { id: 'i-core', source: 'import',    target: 'normalize' },
    { id: 'api-core', source: 'api',     target: 'normalize' },
  
    // processing ring -> core
    { id: 'n-d', source: 'normalize', target: 'dedup' },
    { id: 'd-v', source: 'dedup',     target: 'validate' },
    { id: 'v-ver', source: 'validate', target: 'version' },
    { id: 'ver-core', source: 'version', target: 'core' },
  
    // collaboration
    { id: 'core-review', source: 'core', target: 'review' },
    { id: 'review-core', source: 'review', target: 'core', animated: true },
    { id: 'roles-review', source: 'roles', target: 'review' },
  
    // assembly
    { id: 'core-blue', source: 'core', target: 'blueprint' },
    { id: 'blue-build', source: 'blueprint', target: 'builder' },
    { id: 'build-core', source: 'builder', target: 'core' },
  
    // outbound
    { id: 'core-exports', source: 'core', target: 'exports' },
    { id: 'core-integrate', source: 'core', target: 'integrate' },
  
    // feedback loop
    { id: 'integrate-analytics', source: 'integrate', target: 'analytics' },
    { id: 'exports-analytics', source: 'exports', target: 'analytics' },
    { id: 'analytics-revise', source: 'analytics', target: 'revise' },
    { id: 'revise-author', source: 'revise', target: 'authoring' },
  ];

export const text1 = 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. At, laboriosam ducimus cumque perspiciatis maiores quaerat aliquid optio officiis perferendis nulla voluptatum porro error recusandae ullam illum fugiat! Fuga, veritatis ipsa.'
export const text2 = 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. At, laboriosam ducimus cumque perspiciatis maiores quaerat aliquid optio officiis perferendis nulla voluptatum porro error recusandae ullam illum fugiat! Fuga, veritatis ipsa.'
export const text3 = 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. At, laboriosam ducimus cumque perspiciatis maiores quaerat aliquid optio officiis perferendis nulla voluptatum porro error recusandae ullam illum fugiat! Fuga, veritatis ipsa.'

export const features = [
   
  {
    name: 'Multi-Tenant (Schools, Programs, Batches)',
    description: 'Run multiple universities/schools, programs, departments, and batches in one instance with clean data isolation and easy switching.'
  },
  {
    name: 'Question Version Control',
    description: 'Branch, compare, and restore question versions with full edit history, reviewers’ comments, and change logs.'
  },
  {
    name: 'Rich Authoring (Math, Media, Diagrams)',
    description: 'Author MCQ/MSQ/TF/Fill-in/Subjective/Comprehension with LaTeX/MathJax, images, tables, and code blocks—no formatting headaches.'
  },
  {
    name: 'Bulk Import (DOCX/CSV/XLSX)',
    description: 'Ingest legacy banks at scale with smart parsing, auto-field mapping, duplicate detection, and error reports.'
  },
  {
    name: 'AI Assist (Tagging & Generation)',
    description: 'Auto-tag topics, difficulty, Bloom level; generate plausible distractors; summarize stems; and suggest variants securely.'
  },
  {
    name: 'Normalization & Taxonomy',
    description: 'Enforce consistent metadata (course → subject → unit → topic), difficulty bands, marks, time, and outcome tags.'
  },
  {
    name: 'Review & Approval Workflow',
    description: 'Configurable states—Draft → SME Review → HOD Approval → Published—with inline comments and assignment queues.'
  },
  {
    name: 'Semantic Search & Advanced Filters',
    description: 'Find the right item fast with keyword + semantic search across tags, outcomes, difficulty, marks, usage history, and more.'
  },
  {
    name: 'Blueprint-Driven Paper Generator',
    description: 'Generate balanced papers using constraints (marks mix, difficulty distribution, CO/PO coverage, section rules, topic quotas).'
  },
  {
    name: 'Reusable Paper Templates',
    description: 'Save headers, instructions, section formats, mark schemes, and randomization rules; reuse them across events and sessions.'
  },
  {
    name: 'Usage Tracking & Exposure Control',
    description: 'Prevent over-exposure by tracking where/when items were used; rotate variants automatically for fairness.'
  },
  {
    name: 'CBCS / Non-CBCS Support',
    description: 'Model credits, outcomes, electives, and assessment patterns for CBCS as well as traditional annual/semester systems.'
  },
  {
    name: 'Item Analytics (Post-Exam)',
    description: 'Import results to compute difficulty index, discrimination, distractor effectiveness, and recommendations to retire or revise items.'
  },
  {
    name: 'Roles & Granular Permissions',
    description: 'Fine-grained access for Authors, Reviewers, Approvers, Paper Setters, Invigilators, and External Auditors per org/program.'
  },
  {
    name: 'Integrations & APIs',
    description: 'Connect LMS/ERP/exam engines; export PDF/DOCX/CSV/QTI; hooks for DigiLocker pipelines and AI-proctored delivery.'
  },
  {
    name: 'Localization & Multilingual',
    description: 'Author and store items in multiple languages (e.g., English/Hindi) with per-language variants and unified analytics.'
  },
  {
    name: 'Security & Audit',
    description: 'Org-scoped encryption at rest, watermarking, download controls, IP-based access rules, and immutable activity trails.'
  },
  {
      name: 'CO–PO Mapping & Coverage',
      description: 'Map every question to Course Outcomes (CO) and Program Outcomes (PO), auto-calc coverage heatmaps, and enforce blueprint targets during paper generation.'
  },
];

  
export const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Blueprint Generator", href: "/#blueprints" },
      { label: "CO–PO Mapping", href: "/#copo" },
      { label: "Analytics", href: "/#analytics" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Universities", href: "/solutions/university" },
      { label: "Colleges", href: "/solutions/college" },
      { label: "Institutes", href: "/solutions/institute" },
      { label: "Exam Cells", href: "/solutions/exam-cell" },
    ],
  },
  // {
  //   title: "Resources",
  //   links: [
  //     { label: "Docs", href: "/docs" },
  //     { label: "Guides", href: "/guides" },
  //     { label: "API", href: "/api" },
  //     { label: "Status", href: "/status" },
  //   ],
  // },
  // {
  //   title: "Company",
  //   links: [
  //     { label: "About", href: "/about" },
  //     { label: "Careers", href: "/careers" },
  //     { label: "Contact", href: "/contact" },
  //     { label: "Press", href: "/press" },
  //   ],
  // },
  // {
  //   title: "Legal",
  //   links: [
  //     { label: "Privacy", href: "/privacy" },
  //     { label: "Terms", href: "/terms" },
  //     { label: "Security", href: "/security" },
  //     { label: "DPA", href: "/dpa" },
  //   ],
  // },
];

export const Privacyitems = [
  {
    icon: Check,
    title: "Data Encryption",
    desc: "AES-256 at rest, TLS 1.2+ in transit. Keys rotated and stored securely.",
    bullets: ["AES-256 at rest", "TLS 1.2+ in transit", "Key rotation policy"]
  },
  {
    icon: Check,
    title: "Access Control",
    desc: "RBAC with least-privilege defaults. SSO/OAuth support. IP allowlists for critical routes.",
    bullets: ["RBAC & least privilege", "SSO/OAuth", "IP allowlists"]
  },
  {
    icon: Check,
    title: "Secure Authoring",
    desc: "Granular roles for authors/reviewers/approvers. Draft/Publish workflow with audit logs.",
    bullets: ["Granular roles", "Two-person approval", "Immutable logs"]
  },
  {
    icon: Check,
    title: "Compliance Posture",
    desc: "Privacy by design, DPIA on major releases, export/delete on request.",
    bullets: ["Privacy by design", "DPIA on releases", "Export/Delete requests"]
  },
  {
    icon: Check,
    title: "Data Minimization",
    desc: "We collect only what’s needed. No third-party selling. Strict cookie hygiene.",
    bullets: ["Minimal PII", "No selling data", "Strict cookies"]
  },
  {
    icon: Check,
    title: "Data Residency",
    desc: "Region-aware hosting and backups. Organization-level isolation by design.",
    bullets: ["Region selection", "Isolated tenants", "Encrypted backups"]
  },
  {
    icon: Check,
    title: "Incident Response",
    desc: "24×7 monitoring, runbooks, and customer notification SLAs for notifiable events.",
    bullets: ["24×7 monitoring", "IR runbooks", "Notification SLAs"]
  },
  {
    icon: Check,
    title: "Secure SDLC",
    desc: "Static analysis, dependency scanning, code reviews, and pre-prod pen tests.",
    bullets: ["SAST/DAST", "Dep scanning", "Pen tests"]
  }
];

export const SideBarData = [
  {
    name: 'Home',
    href: ''
  },
  {
    name: 'Add Programs',
    href: 'add-programs'
  },
  {
    name: 'Add Batches',
    href: 'add-batches'
  },
  {
    name: 'Add Questions',
    href: 'add-questions'
  },
  {
    name: 'Question Paper Generator',
    href: 'question-paper-generator'
  }
]

export const SideBarSupportData = [
  {
    name: 'Manage Programs',
    href: 'manage-programs'
  },
  {
    name: 'Manage Batches',
    href: 'manage-batches'
  },
  {
    name: 'Manage Questions',
    href: 'manage-questions'
  }
]

export const Schools = [
  {
    id: 1,
    name: "Engineering School",
    code: "eng-001",
    level: "PG",
    duration_semsters: 8,
  },
  {
    id: 2,
    name: "Management School",
    code: "mg-001",
    level: "PG",
    duration_semsters: 4,
  },
  {
    id: 3,
    name: "Law School",
    code: "law-001",
    level: "UG",
    duration_semsters: 12,
  },
  {
    id: 4,
    name: "SEDA",
    code: "seda-001",
    level: "UG",
    duration_semsters: 8,
  },
  {
    id: 5,
    name: "Commerce School",
    code: "com-001",
    level: "UG",
    duration_semsters: 6,
  },
]

export const ProgramData = [
  {
    id: 'prog-btech-cse',
    name: "B.Tech Computer Science",
    code: "BTECH-CSE-01",
    level: "UG",
    duration_semsters: 8,
    schoolName: "Engineering School",
  },
  {
    id: 'prog-mba-fin',
    name: "MBA (Finance)",
    code: "MBA-FIN-01",
    level: "PG",
    duration_semsters: 4,
    schoolName: "Management School",
  },
  {
    id: 'prog-bba',
    name: "BBA",
    code: "BBA-GEN-01",
    level: "UG",
    duration_semsters: 6,
    schoolName: "Management School",
  },
  {
    id: 4,
    name: "LLB",
    code: "LLB-REG-01",
    level: "UG",
    duration_semsters: 6,
    schoolName: "Law School",
  },
]

export const BatchData = [
  {
    id: 1,
    name: "B.Tech CSE 2024-28",
    year: 2024,
    schoolName: "School of Engineering",
    programName: "B.Tech Computer Science"
  }  
]

export const ProgramOutcomeData = [
  // B.Tech CSE Program Outcomes
  {
    id: "po-btech-1",
    programId: "prog-btech-cse",
    code: "PO1",
    statement:
      "Apply knowledge of mathematics, science, and computer science fundamentals to solve complex computing problems.",
  },
  {
    id: "po-btech-2",
    programId: "prog-btech-cse",
    code: "PO2",
    statement:
      "Design and develop efficient software systems and algorithms that meet specified functional and non-functional requirements.",
  },
  {
    id: "po-btech-3",
    programId: "prog-btech-cse",
    code: "PO3",
    statement:
      "Use modern tools, platforms, and engineering practices to build, test, and maintain reliable computing solutions.",
  },

  // MBA (Finance) Program Outcomes
  {
    id: "po-mba-1",
    programId: "prog-mba-fin",
    code: "PO1",
    statement:
      "Apply core financial and management concepts to analyze business scenarios and support strategic decisions.",
  },
  {
    id: "po-mba-2",
    programId: "prog-mba-fin",
    code: "PO2",
    statement:
      "Interpret and analyze financial statements to evaluate the financial health and performance of organizations.",
  },
];


export const CourseSubjects = [
  {
    id: "sub-dsa",
    programId: "prog-btech-cse",
    code: "CSE-201",
    name: "Data Structures & Algorithms",
  },
  {
    id: "sub-dbms",
    programId: "prog-btech-cse",
    code: "CSE-203",
    name: "Database Management Systems",
  },
  {
    id: "sub-accounting",
    programId: "prog-mba-fin",
    code: "FIN-101",
    name: "Financial Accounting",
  },
];

// initial dummy COs
export const CourseSubjectCO = [
  {
    id: "co-dsa-1",
    course_subject_id: "sub-dsa",
    code: "CO1",
    statement: "Apply basic data structures to solve computational problems.",
    bloom_level: "Apply",
    target_pct: 70,
  },
  {
    id: "co-dsa-2",
    course_subject_id: "sub-dsa",
    code: "CO2",
    statement: "Analyze time and space complexity of algorithms.",
    bloom_level: "Analyze",
    target_pct: 65,
  },
  {
    id: "co-dbms-1",
    course_subject_id: "sub-dbms",
    code: "CO1",
    statement: "Design normalized relational database schemas for real-world applications.",
    bloom_level: "Create",
    target_pct: 75,
  },
  {
    id: "co-acc-1",
    course_subject_id: "sub-accounting",
    code: "CO1",
    statement:
      "Explain fundamental accounting principles and prepare basic financial statements for business entities.",
    bloom_level: "Understand",
    target_pct: 70,
  },
];



export const CourseCoProgramPoMap = [
  // DSA COs ↔ B.Tech CSE POs
  {
    id: "map-dsa-co1-po1",
    co_id: "co-dsa-1",      // Uses data structures => applying CS fundamentals
    po_id: "po-btech-1",
    correlation: 2,         // Medium
  },
  {
    id: "map-dsa-co1-po2",
    co_id: "co-dsa-1",      // Strongly supports design/development
    po_id: "po-btech-2",
    correlation: 3,         // High
  },
  {
    id: "map-dsa-co2-po1",
    co_id: "co-dsa-2",      // Complexity analysis = strong fundamentals
    po_id: "po-btech-1",
    correlation: 3,         // High
  },
  {
    id: "map-dsa-co2-po2",
    co_id: "co-dsa-2",      // Also helps with better design choices
    po_id: "po-btech-2",
    correlation: 2,         // Medium
  },

  // DBMS CO ↔ B.Tech CSE POs
  {
    id: "map-dbms-co1-po2",
    co_id: "co-dbms-1",     // Designing schemas = core design outcome
    po_id: "po-btech-2",
    correlation: 3,         // High
  },
  {
    id: "map-dbms-co1-po3",
    co_id: "co-dbms-1",     // Tools/practices for DB design & maintenance
    po_id: "po-btech-3",
    correlation: 2,         // Medium
  },

  // Financial Accounting CO ↔ MBA (Finance) POs
  {
    id: "map-acc-co1-po-mba1",
    co_id: "co-acc-1",
    po_id: "po-mba-1",
    correlation: 2,         // Medium: concepts + scenarios
  },
  {
    id: "map-acc-co1-po-mba2",
    co_id: "co-acc-1",
    po_id: "po-mba-2",
    correlation: 3,         // High: directly on financial statements
  },
];

