// assets
import contactPageImg from "../assets/contact-page.svg";
import swiggyImg from "../assets/swiggy.png";
import zomatoImg from "../assets/zomato.png";
import cypherockImg from "../assets/cypherock.png";
import mamaketoImg from "../assets/mamaketo.svg";
import o4hImg from "../assets/o4h.png";

// components
import { Reveal } from "../components";

// framer-motion
import { motion } from "framer-motion";

// utils
import { fadeIn } from "../utils/variants";
import { transition } from "../utils/transition";

const Clients = () => {
  return (
    <div
      id="clients"
      className="min-h-max flex items-center justify-center relative"
    >
      <div
        className="max-w-screen-2xl flex flex-col xl:flex-row xl:justify-between
      items-center xl:items-start gap-12 w-full pt-12 pb-12 sm:pb-16 px-12"
      >
        <div className="flex-1 flex flex-col gap-4">
          <Reveal>
            <h6
              className="text-center xl:text-center text-4xl sm:text-4xl lg:text-[64px] 
            font-bold text-textPrimary"
            >
              Clients <span className="text-secondary"> worked with</span>
            </h6>
          </Reveal>
          <br />
          <motion.div
            variants={fadeIn("up")}
            transition={transition()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false }}
            className="flex-1 flex flex-col xl:flex-row justify-center items-center xl:gap-14 gap-8  w-full"
          >
            <div className="flex justify-center items-center h-32 w-40">
              <img
                src={swiggyImg}
                alt="Swiggy"
                className="max-h-full max-w-full object-contain"
              ></img>
            </div>
            <div className="flex justify-center items-center h-32 w-40">
              <img
                src={zomatoImg}
                alt="Zomato"
                className="max-h-full max-w-full object-contain"
              ></img>
            </div>
            <div className="flex justify-center items-center h-32 w-40">
              <img
                src={cypherockImg}
                alt="Cypherock"
                className="max-h-full max-w-full object-contain"
              ></img>
            </div>
            <div className="flex justify-center items-center h-32 w-40">
              <img
                src={mamaketoImg}
                alt="Mamaketo"
                className="max-h-full max-w-full object-contain"
              ></img>
            </div>
            <div className="flex justify-center items-center h-24 w-24">
              <img
                src={o4hImg}
                alt="O4H - Order for Health"
                className="max-h-full max-w-full object-contain"
              ></img>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Clients;
