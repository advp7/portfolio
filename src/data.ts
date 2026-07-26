import professionalOne from "./assets/professional1.png";
import webOne from "./assets/webOne.jpg";
import professionalTwo from "./assets/professional2.png";
import webThree from "./assets/webThree.png";
import personalOne from "./assets/personal1.png";
import personalTwo from "./assets/personal2.png";
import ellieCover from "./assets/ellie-cover.svg";

export interface Project {
  id: number;
  img: string;
  title: string;
  description: string;
  stack: string[];
  link: string;
  tag: "Professional" | "Personal";
}

export const projects: Project[] = [
  {
    id: 6,
    img: ellieCover,
    title: "Ellie — AI Assistant for Edelweiss",
    description:
      "Custom AI assistant live on Edelweiss Mutual Fund's website, handling hundreds of customer queries a week. Owned the entire frontend end to end; Python FastAPI backend with Gemini model calls, tool calling and Redis caching.",
    stack: ["React", "FastAPI", "Gemini", "Redis"],
    link: "https://www.edelweissmf.com",
    tag: "Professional",
  },
  {
    id: 0,
    img: professionalOne,
    title: "Platform Operations Dashboard",
    description:
      "Authenticated data-entry and operations dashboard used internally at InfinityBox — filterable tables, multi-step entry workflows and role-aware views.",
    stack: ["React", "TypeScript", "Redux Toolkit", "Material UI"],
    link: "https://stage-platform-dashboard.getinfinitybox.com/login/demo",
    tag: "Professional",
  },
  {
    id: 1,
    img: professionalTwo,
    title: "Product Opt-in Flow",
    description:
      "Mobile-first customer opt-in journey built for the Swiggy integration — QR-linked, fast-loading and built to handle real production traffic.",
    stack: ["React", "TypeScript", "REST APIs"],
    link: "https://stage-optin.getinfinitybox.com/swiggy/59152/168447263110",
    tag: "Professional",
  },
  {
    id: 2,
    img: webThree,
    title: "Product Feedback Flow",
    description:
      "End-customer feedback capture flow with a lightweight, distraction-free UI designed for high completion rates on mobile.",
    stack: ["React", "TypeScript", "REST APIs"],
    link: "https://stage-feedback.getinfinitybox.com/03917d7b-edf4-11ed-8e04-02d36438789c",
    tag: "Professional",
  },
  {
    id: 3,
    img: webOne,
    title: "Suite Business Landing Page",
    description:
      "Responsive marketing landing page for a business suite — pixel-perfect build from design handoff with smooth scroll animations.",
    stack: ["React", "CSS", "Responsive Design"],
    link: "https://capable-lamington-ba40c3.netlify.app/",
    tag: "Personal",
  },
  {
    id: 4,
    img: personalOne,
    title: "GitHub Finder",
    description:
      "Search GitHub users and drill into profiles and repositories via the GitHub REST API, with debounced search and graceful loading states.",
    stack: ["React", "Context API", "GitHub API"],
    link: "https://roaring-churros-4f2be0.netlify.app/",
    tag: "Personal",
  },
  {
    id: 5,
    img: personalTwo,
    title: "Food Delivery App",
    description:
      "Food-ordering interface with cart management, menu browsing and a clean checkout flow, built as a desktop-class web app.",
    stack: ["React", "JavaScript", "CSS"],
    link: "https://wonderful-starburst-8cd099.netlify.app/",
    tag: "Personal",
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
  label: string;
}

// All figures verifiable from the timeline / experience above.
export const stats: Stat[] = [
  { value: 4, suffix: "+", label: "Years shipping products" },
  { value: 6, label: "Brands that used what I built" },
  { value: 10, label: "Months to Senior promotion" },
  {
    value: 10,
    prefix: "~",
    label: "Days from pulled in to RCS launch",
  },
];

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];
