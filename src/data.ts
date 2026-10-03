export type DiagramId = "ai-assistant" | "rcs";

export interface CaseStudy {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  metric: { value: string; label: string };
  stack: string[];
  /** Where the work lives, e.g. "Live on client site" */
  access: string;
  /** Public page where visitors can see or try it */
  live?: { href: string; label: string; shortLabel: string };
  diagram: DiagramId;
  /** Earlier, separate work for the same client — framing, not this project */
  background?: { label: string; text: string };
  context: string;
  role: string[];
  build: string;
  outcome: string[];
}

// Client names are deliberately described rather than named.
export const caseStudies: CaseStudy[] = [
  {
    id: "ai-assistant",
    eyebrow: "AI · In production",
    title: "Ellie, an AI assistant for Edelweiss Mutual Fund",
    summary:
      "A custom AI assistant on Edelweiss Mutual Fund's public website, answering customer questions every day. I owned the frontend end to end and worked across the backend that powers it.",
    metric: { value: "100s", label: "customer queries handled every week" },
    stack: ["React", "Python · FastAPI", "Gemini", "Tool calling", "Redis"],
    access: "Live on client site",
    live: {
      href: "https://www.edelweissmf.com",
      label: "Try Ellie on edelweissmf.com",
      shortLabel: "Try Ellie live",
    },
    diagram: "ai-assistant",
    background: {
      label: "Earlier project with Edelweiss",
      text: "Before the AI assistant, Edelweiss had already brought us challenging requirements: highly specific, non-standard UI needs that posed significant challenges for our implementation and CSM teams. I unblocked that go-live by engineering customizations in custom JavaScript and CSS that hadn't been attempted before.",
    },
    context:
      "The AI assistant was a whole new kind of requirement: a custom AI assistant on their public website, so customers could get answers to their questions directly on the site. A different problem, from a client with the same high bar.",
    role: [
      "Owned the entire frontend end to end: requirements gathering with Edelweiss, design, implementation and review.",
      "Worked on the Python FastAPI backend, integrating Gemini model calls, tool calling and Redis caching.",
    ],
    build:
      "The React chat interface talks to a FastAPI service that orchestrates Gemini. The model can call tools to fetch what it needs to answer, and Redis caches responses so repeat questions come back fast.",
    outcome: [
      "Live on Edelweiss Mutual Fund's public website, handling hundreds of customer queries a week.",
    ],
  },
  {
    id: "rcs",
    eyebrow: "Launch · Google partnership",
    title: "Landing Engati's RCS channel",
    summary:
      "Pulled in at short notice to land a Google-facing channel launch, then turned the rush job into reusable architecture the product still builds on.",
    metric: { value: "~10 days", label: "from being pulled in to launch" },
    stack: ["React", "TypeScript", "State management", "REST APIs"],
    access: "Inside the Engati product",
    live: {
      href: "https://www.engati.ai/rcs-business",
      label: "Explore RCS on engati.ai",
      shortLabel: "Explore RCS live",
    },
    diagram: "rcs",
    context:
      "RCS (Rich Communication Services) opened up new use cases and a new revenue stream for Engati. The launch was time-bound and high-visibility, with external dependencies and expectations from Google. It had to go live quickly and establish credibility with Google.",
    role: [
      "Pulled in at short notice ahead of the launch, and shipped a working frontend in about ten days.",
      "Went on to own the frontend architecture and state management for the channel.",
      "Worked closely with backend engineers to align API contracts and reduce integration friction.",
    ],
    build:
      "Rather than building each flow separately, RCS rendering and state live in one shared layer. Broadcast campaigns and the template-message node consume it, and template creation was designed to plug into it, so new RCS capabilities land once and show up everywhere.",
    outcome: [
      "Delivered the launch in about ten days.",
      "The shared architecture carried new RCS features and improvements after launch.",
    ],
  },
];

export interface EarlierWork {
  id: string;
  title: string;
  org: string;
  description: string;
  stack: string[];
  tag: "Professional" | "Personal";
  link?: string;
  access?: string;
}

export const earlierWork: EarlierWork[] = [
  {
    id: "infinitybox",
    title: "Partner dashboard & customer flows",
    org: "InfinityBox · 2022–2024",
    description:
      "Owned the frontend of InfinityBox's operations dashboard and its mobile-first customer opt-in and feedback flows, used by teams at Swiggy and Zomato during partner collaborations. Built directly with the CTO and founders.",
    stack: ["React", "TypeScript", "Redux Toolkit", "Material UI"],
    tag: "Professional",
    access: "Internal product",
  },
];

export interface Experience {
  id: number;
  role: string;
  company: string;
  location: string;
  period: string;
  points: string[];
  stack: string[];
}

export const experience: Experience[] = [
  {
    id: 0,
    role: "UI Developer → Senior UI Developer",
    company: "Engati Technologies",
    location: "Bengaluru, India",
    period: "Mar 2024 — Present",
    points: [
      "Pulled in at short notice to land Engati's RCS channel — a Google-facing launch on a hard external deadline that opened a new revenue stream — and shipped a working frontend in about 10 days; went on to own its architecture and the reusable component structures behind broadcast, template-message and template-creation flows.",
      "Unblocked the go-live of Edelweiss, a high-value enterprise account, by engineering complex, previously unattempted UI customizations with custom JavaScript and CSS, and acting as the technical point of contact for implementation and CSM teams.",
      "Owned the entire frontend of Ellie, a custom AI assistant live on Edelweiss's website and handling hundreds of customer queries a week — end to end from requirements gathering through design and implementation to review — and worked on its Python FastAPI backend: Gemini model calls, tool calling and Redis caching.",
      "Promoted to Senior UI Developer in 10 months and selected for the company's bar-raisers program; on a small, high-ownership team, I'm the go-to engineer for frontend architecture decisions, code reviews and unblocking teammates.",
      "Expanded beyond UI into full-stack delivery — shipping backend work in Java (Spring Boot) and Python (FastAPI), aligning API contracts, and contributing to end-to-end architecture decisions on a conversational-AI platform.",
    ],
    stack: [
      "React",
      "TypeScript",
      "Java · Spring Boot",
      "Python · FastAPI",
      "Gemini",
      "Redis",
      "Conversational AI",
    ],
  },
  {
    id: 1,
    role: "Software Engineer — Frontend",
    company: "InfinityBox",
    location: "Bengaluru, India",
    period: "Aug 2022 — Jan 2024",
    points: [
      "Owned the frontend of InfinityBox's platform — including the operations dashboard and customer-facing flows that teams at Swiggy and Zomato used during partner collaborations — working directly with the CTO and founders.",
      "Owned frontend delivery across web (React) and mobile (React Native) — from Figma handoff to production deploys on AWS.",
      "Translated intricate UI designs into responsive, user-friendly interfaces across multiple external client projects under strict timelines.",
    ],
    stack: ["React", "React Native", "TypeScript", "Redux Toolkit", "AWS"],
  },
  {
    id: 2,
    role: "Software Engineer Intern",
    company: "Privafy Technologies",
    location: "Bengaluru, India",
    period: "Sep 2021 — Mar 2022",
    points: [
      "Built a feature-rich e-commerce frontend with React, Context API and REST API integration.",
      "Developed a faceted-search dashboard table with custom filter chips and specialised display logic.",
    ],
    stack: ["React", "Context API", "REST APIs"],
  },
];

export interface SkillGroup {
  title: string;
  blurb: string;
  skills: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    title: "Frontend Core",
    blurb: "What I ship with every day",
    skills: [
      "React",
      "TypeScript",
      "JavaScript",
      "Redux Toolkit",
      "HTML/CSS",
      "Tailwind CSS",
      "Material UI",
      "Framer Motion",
    ],
  },
  {
    title: "Mobile",
    blurb: "Cross-platform apps, store to store",
    skills: ["React Native", "Android Studio", "Xcode"],
  },
  {
    title: "AI Engineering",
    blurb: "Building the AI, not just using it",
    skills: [
      "AI Agents",
      "Gemini",
      "LLM Tool Calling",
      "CX Automation",
      "Prompt Engineering",
    ],
  },
  {
    title: "AI-Assisted Development",
    blurb: "Shipping faster with AI in the loop",
    skills: ["Claude Code", "Codex", "AI pair programming"],
  },
  {
    title: "Backend & Cloud",
    blurb: "Real backend work, shipped at Engati",
    skills: [
      "Java · Spring Boot",
      "Python · FastAPI",
      "Redis",
      "AWS",
      "SQL",
      "MongoDB",
    ],
  },
  {
    title: "Design & Tooling",
    blurb: "From handoff to polish",
    skills: ["Git", "Figma", "Photoshop", "Responsive Design"],
  },
];

export const socials = {
  linkedin: "https://www.linkedin.com/in/advaith-praveen",
  github: "https://github.com/advp7",
  twitter: "https://twitter.com/advp007",
  email: "advaith1601@gmail.com",
};

export interface Stat {
  value: number;
  prefix?: string;
  suffix?: string;
  /** Rendered smaller, after the number ("days", "yr") */
  unit?: string;
  /** Short context line above the label */
  tag: string;
  /** Reads as a continuation of the number: "~10 days" + "to ship…" */
  label: string;
  /** Where the proof lives: a case study, or a page section */
  proof: { caseStudy: string } | { section: string };
}

// All figures verifiable from the case studies / experience above.
export const stats: Stat[] = [
  {
    value: 10,
    prefix: "~",
    unit: "days",
    tag: "Engati · RCS",
    label: "to ship a Google-partnered launch",
    proof: { caseStudy: "rcs" },
  },
  {
    value: 100,
    suffix: "s",
    tag: "Edelweiss · Ellie",
    label: "of customer queries a week, answered by an AI I built",
    proof: { caseStudy: "ai-assistant" },
  },
  {
    value: 1,
    prefix: "<",
    unit: "yr",
    tag: "2024 → 2025",
    label: "from UI Developer to Senior",
    proof: { section: "experience" },
  },
  {
    value: 100,
    suffix: "+",
    tag: "Engati",
    label: "businesses on the platform I build",
    proof: { section: "experience" },
  },
];

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];
