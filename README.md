# advaith.dev — Portfolio

Personal portfolio of **Advaith Praveen**, Frontend Engineer — React/React Native products and AI agents for customer experience.

**Live:** https://advp7.github.io/portfolio/

## Stack

- **React 18 + TypeScript**
- **Tailwind CSS** — custom dark design system (glass surfaces, gradient accents)
- **Framer Motion** — scroll-triggered reveal animations
- **getform.io** — contact form backend
- **GitHub Pages** — hosting via `gh-pages`

## Running locally

```bash
npm install
npm start        # dev server at http://localhost:3000
npm run build    # production build
npm run deploy   # build + publish to GitHub Pages
```

## Structure

```
src/
├── App.tsx            # page composition + ambient background
├── data.ts            # all content: projects, experience, skills, socials
├── components/        # Navbar, Button, ProjectCard, SectionHeading, ...
├── views/             # Hero, About, Experience, Skills, Projects, Clients, Contact, Footer
└── utils/             # framer-motion variants & transitions
```

All copy and content lives in [`src/data.ts`](src/data.ts) — update projects, experience or skills there without touching components.
