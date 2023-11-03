// assets
import contactPageImg from "../assets/contact-page.svg";
import contactIllustration from "../assets/contact-illustration.svg";

// components
import { Button, LabelInput } from "../components";

// framer-motion
import { motion } from "framer-motion";

// utils
import { fadeIn, scale } from "../utils/variants";
import { transition } from "../utils/transition";

const Contact = () => {
  return (
    <div
      id="contact"
      className="min-h-screen flex items-center justify-center relative"
      style={{
        background: `url(${contactPageImg})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div
        className="max-w-screen-2xl flex flex-col xl:flex-row xl:justify-between
      items-center xl:items-start gap-12 w-full pt-20 pb-20 sm:pb-16 px-12"
      >
        <div className="flex-1 flex flex-col gap-4">
          <h2
            className="text-center xl:text-start text-4xl sm:text-5xl lg:text-[64px] 
              font-bold text-textPrimary"
          >
            Feel free to <span className="text-secondary">reach out!</span>
          </h2>

          <motion.img
            variants={scale()}
            transition={transition()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false }}
            src={contactIllustration}
            alt=""
            className="max-h-[348px]"
          />
        </div>
        <form
          action="https://getform.io/f/54736acb-202f-4423-8c59-bfd14836977c"
          method="POST"
        >
          <motion.div
            variants={fadeIn("up")}
            transition={transition()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false }}
            className="flex-1 flex flex-col gap-6 w-full max-w-[696px]"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <LabelInput
                labelText="Your name"
                placeholderText="Name"
                name="name"
              />
              <LabelInput
                labelText="Your email"
                placeholderText="Email"
                name="email"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <LabelInput
                labelText="Your message"
                placeholderText="Message"
                name="message"
                textarea
              />
            </div>

            <Button secondary>Send Message</Button>
          </motion.div>
        </form>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-divider" />
    </div>
  );
};

export default Contact;
