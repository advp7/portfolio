// react
import { FormEvent, useState } from "react";
// assets
import linkedinIcon from "../assets/linkedin-icon.svg";
import githubIcon from "../assets/github-icon.svg";
import twitterIcon from "../assets/twitter-icon.svg";
// components
import {
  Button,
  LabelInput,
  SectionHeading,
  SocialMediaIcon,
  Reveal,
} from "../components";
// data
import { socials } from "../data";
// framer-motion
import { AnimatePresence, motion } from "framer-motion";
// utils
import { fadeIn } from "../utils/variants";
import { transition } from "../utils/transition";

const FORM_ENDPOINT =
  "https://getform.io/f/54736acb-202f-4423-8c59-bfd14836977c";

type Status = "idle" | "sending" | "sent" | "error";

const Contact = () => {
  const [status, setStatus] = useState<Status>("idle");

  // Submit in the background so visitors stay on the page. The form keeps
  // its action/method, so it still works as a plain POST without JS.
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    // Honeypot: real people never see this field, bots fill it in
    if (data.get("_gotcha")) {
      setStatus("sent");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="contact"
      className="flex items-center justify-center relative border-t border-stroke scroll-mt-16"
    >
      <div className="max-w-screen-2xl flex flex-col xl:flex-row xl:justify-between items-center xl:items-start gap-14 w-full py-24 px-6 sm:px-12">
        <div className="flex-1 flex flex-col gap-6 max-w-[560px]">
          <SectionHeading
            eyebrow="05 — Contact"
            title="Let's build"
            highlight="together"
          />

          <Reveal>
            <p className="text-center xl:text-left text-base sm:text-lg text-textSecondary leading-relaxed">
              I'm open to full-time roles, freelance projects and interesting
              conversations. Drop a message here or email me directly — I
              usually reply within a day.
            </p>
          </Reveal>

          <Reveal>
            <a
              href={`mailto:${socials.email}`}
              className="block text-center xl:text-left font-mono text-accent hover:underline underline-offset-4"
            >
              {socials.email}
            </a>
          </Reveal>

          <motion.div
            variants={fadeIn("up")}
            transition={transition()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex items-center justify-center xl:justify-start gap-4"
          >
            <SocialMediaIcon
              imgSrc={linkedinIcon}
              title="LinkedIn"
              link={socials.linkedin}
            />
            <SocialMediaIcon
              imgSrc={githubIcon}
              title="GitHub"
              link={socials.github}
            />
            <SocialMediaIcon
              imgSrc={twitterIcon}
              title="Twitter"
              link={socials.twitter}
            />
          </motion.div>
        </div>

        <form
          action={FORM_ENDPOINT}
          method="POST"
          onSubmit={onSubmit}
          className="flex-1 w-full max-w-[640px]"
        >
          <motion.div
            variants={fadeIn("up")}
            transition={transition()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col gap-5 bg-surface border border-stroke rounded-2xl p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <LabelInput
                labelText="Your name"
                placeholderText="Jane Doe"
                name="name"
              />
              <LabelInput
                labelText="Your email"
                placeholderText="jane@company.com"
                name="email"
                type="email"
              />
            </div>

            <LabelInput
              labelText="Your message"
              placeholderText="Tell me about the role or project..."
              name="message"
              textarea
            />

            {/* Honeypot, hidden from people and screen readers */}
            <input
              type="text"
              name="_gotcha"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="shrink-0 whitespace-nowrap">
                <Button secondary type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Send message"}
                </Button>
              </div>
              <div role="status" aria-live="polite" className="text-sm">
                <AnimatePresence mode="wait">
                  {status === "sent" && (
                    <motion.p
                      key="sent"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center sm:justify-start gap-2 text-accent"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                      Thanks! Your message is on its way. I usually reply
                      within a day.
                    </motion.p>
                  )}
                  {status === "error" && (
                    <motion.p
                      key="error"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-center sm:text-left text-textSecondary"
                    >
                      Couldn't send that. Please try again, or email{" "}
                      <a
                        href={`mailto:${socials.email}`}
                        className="text-accent underline underline-offset-2"
                      >
                        {socials.email}
                      </a>
                      .
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </form>
      </div>
    </section>
  );
};

export default Contact;
