/**
 * What Ask Advaith knows about Advaith beyond the site: background, how he
 * works, what he's growing into, and life outside work.
 *
 * Anything here can be shared with any visitor, so only add what you're happy
 * for anyone to read. Empty fields and lists are left out of the prompt.
 * After editing, redeploy the Worker: `npx wrangler deploy` in /assistant.
 */

export interface Profile {
  education: string;
  /** Places he's lived / grown up, if he wants that shared */
  background: string;
  languages: string[];
  /** Working style and values, with evidence where possible */
  howHeWorks: string[];
  /** Current learning direction */
  growingInto: string[];
  /** Notable moments not covered by the case studies */
  milestones: string[];
  /** What drew him to tech, what excites him now */
  whyTech: string;
  /** Hobbies and interests outside work */
  interests: string[];
  /** Light, human details that make good small talk */
  funFacts: string[];
  /** Roles, setup and location preferences for his next move */
  lookingFor: string;
}

export const profile: Profile = {
  education:
    "B.E. in Computer Science & Engineering from Dayananda Sagar College of Engineering, Bengaluru (graduated 2022, GPA 8.4).",

  background: "Born and brought up in Bengaluru.",

  languages: ["English", "Kannada", "Hindi", "Telugu"],

  howHeWorks: [
    "A doer who takes real ownership. He's good at figuring things out when the path isn't clear, and works with AI to get through the unknowns quickly.",
    "Driven and hands-on, with a knack for tough, ambiguous problems: on the Edelweiss project he dug into non-standard requirements, experimented until previously unattempted customisations worked, and guided the implementation and customer-success teams on what was feasible.",
    "Prefers clean, sustainable patterns over short-term or reactive fixes, and keeps a high bar for code quality, UX correctness and visual accuracy.",
    "Works closely with backend engineers to agree API contracts early, which cuts integration friction.",
    "Unblocks teammates through code reviews, technical discussions and hands-on fixes; he's become a go-to person for frontend and UI decisions on his team.",
    "Uses AI tools such as Claude Code and Codex every day as part of how he builds.",
  ],

  growingInto: [
    "Deeper system and architecture thinking: how frontend decisions shape backend systems, APIs, data flow and scale.",
    "Performance engineering and streaming UI: rendering performance, perceived speed, and polished streaming experiences for AI agents.",
    "Technical influence: clear design docs, trade-off analysis and shaping technical direction, not only implementation.",
    "Becoming a T-shaped engineer: broad across the stack, deep in frontend and AI products.",
  ],

  milestones: [
    "Received an award at Engati for ownership of the RCS launch.",
    "Won one of Engati's monthly awards for Ellie, the AI assistant he built for Edelweiss Mutual Fund.",
    "Placed 3rd in Engati's internal thinkathon.",
    "Won an earlier monthly award at Engati for moving the platform's Google Sheets integration from native Google Drive access to access through Google's Drive Picker, a change with a lot of unknowns that he worked through. (A smaller win than the RCS and Ellie work; mention it when asked about awards or problem-solving, not as a headline.)",
    "Attended the RCS event in Hyderabad as part of the RCS launch, which he counts as a meaningful milestone and a great learning experience.",
  ],

  whyTech:
    "He's been passionate about tech since his school days and makes a point of keeping up with the latest advancements. He loves phones and gadgets too, so he's always following the latest launches. AI has changed how he works, so he's very tuned in to it and excited about where it's heading.",

  interests: [
    "An avid Formula 1 fan.",
    "A football enthusiast.",
    "Big into fitness: the gym and running.",
    "Photography is a passion of his, though he doesn't get as much time for it as he'd like.",
    "Phones and gadgets: he keeps up with the latest launches.",
    "Spending time with family and friends.",
  ],

  funFacts: [],

  lookingFor:
    "Open to new opportunities, in hybrid or on-site roles. He thrives in fast-paced environments: he has always worked at startups, so moving quickly with real ownership is how he's used to working. For specifics such as the role, location or timing, visitors should reach out to him directly.",
};
