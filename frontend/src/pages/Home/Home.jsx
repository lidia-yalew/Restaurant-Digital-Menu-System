import { motion } from "framer-motion";
import Baner from "./Baner.jsx";
import WetPaintButton from "../../componests/UI/Button.jsx";
import Menu from "./../client/Menu.jsx";

function Home() {
 
  return (
    <div className="min-h-screen bg-bg text-3xl p-4 ">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2 }} // Added delay
      >
        <div className="">
          <Baner />
        </div>
      </motion.div>

      <div className="absolute hidden md:block right-4 md:bottom-8 md:left-8 lg:bottom-3 lg:left-10 lg:right-auto max-w-sm md:max-w-md">
        <div className="backdrop-blur-sm bg-black/50 border border-white/20 rounded-2xl p-2">
          <h2 className=" text-center font-serif italic  md:text-xl lg:text-1xl font-bold text-green-400 mb-2 text-sm ">
            Taste That Tells A Story
          </h2>
          <div className="h-0.5 w-12 md:w-24 lg:w-36  bg-green-400/80 m-auto my-2 rounded-full"></div>

          {/* Description */}
          <p className="text-white mb-4 text-xs lg:text-sm md:text-base font-medium text-center md:text-left">
            Every dish is a chapter. Come write yours today.
          </p>

          {/* Button with icon */}

          <div className="flex justify-center">
            <WetPaintButton className="text-xs md:text-base px-6 md:px-8 md:py-2">
              VIEW MENU →
            </WetPaintButton>
          </div>
        </div>
      </div>
      <Menu />
    </div>
  );
}

export default Home;