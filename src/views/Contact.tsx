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
import { motion } from "framer-motion";
// utils
import { fadeIn } from "../utils/variants";
import { transition } from "../utils/transition";

const Contact = () => {
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
          action="https://getform.io/f/54736acb-202f-4423-8c59-bfd14836977c"
          method="POST"
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

            <Button secondary type="submit">
              Send message
            </Button>
          </motion.div>
        </form>
      </div>
    </section>
  );
};

export default Contact;
