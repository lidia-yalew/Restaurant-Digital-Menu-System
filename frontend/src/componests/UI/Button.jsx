import React from "react";
import { motion } from "framer-motion";

const WetPaintButton = ({ children, className = "" }) => {
  return (
    <button
      style={{
        "--button-glow": "rgba(34, 197, 94, 0.5)",
        "--button-glow-dark": "rgba(34, 197, 94, 0.3)",
      }}
      className={`group relative rounded bg-green-600 px-8 py-2 font-semibold text-white transition-all hover:bg-card hover:text-text text-sm mb-5 shadow-[0_0_20px_0_var(--button-glow)] dark:shadow-[0_0_15px_0_var(--button-glow-dark)] hover:shadow-[0_0_30px_0_var(--button-glow)] dark:hover:shadow-[0_0_25px_0_var(--button-glow-dark)] hover:scale-[1.02] active:scale-95 ${className}`}
    >
      {children}
      <Drip left="10%" height={24} delay={0.5} />
      <Drip left="30%" height={20} delay={3} />
      <Drip left="57%" height={10} delay={4.25} />
      <Drip left="85%" height={16} delay={1.5} />
    </button>
  );
};

// Drip component now uses the imported 'motion'
const Drip = ({ left, height, delay }) => {
  return (
    <motion.div
      className="absolute top-[99%] origin-top"
      style={{ left }}
      initial={{ scaleY: 0.75 }}
      animate={{ scaleY: [0.75, 1, 0.75] }}
      transition={{
        duration: 2,
        times: [0, 0.25, 1],
        delay,
        ease: "easeIn",
        repeat: Infinity,
        repeatDelay: 2,
      }}
    >
      {/* Drip body */}
      <div
        style={{ height }}
        className="w-2 rounded-b-full bg-green-600 transition-colors group-hover:bg-card"
      />

      {/* Right curve */}
      <svg
        width="6"
        height="6"
        viewBox="0 0 6 6"
        className="absolute left-full top-0"
      >
        <path
          d="M5.4 0H0V5.4C0 2.41765 2.41766 0 5.4 0Z"
          className="fill-green-600 transition-colors group-hover:fill-card"
        />
      </svg>

      {/* Left curve */}
      <svg
        width="6"
        height="6"
        viewBox="0 0 6 6"
        className="absolute right-full top-0 rotate-90"
      >
        <path
          d="M5.4 0H0V5.4C0 2.41765 2.41766 0 5.4 0Z"
          className="fill-green-600 transition-colors group-hover:fill-card"
        />
      </svg>

      {/* Falling droplet */}
      <motion.div
        initial={{ y: -8, opacity: 1 }}
        animate={{ y: [-8, 50], opacity: [1, 0] }}
        transition={{
          duration: 2,
          times: [0, 1],
          delay,
          ease: "easeIn",
          repeat: Infinity,
          repeatDelay: 2,
        }}
        className="absolute top-full h-2 w-2 rounded-full bg-green-600 transition-colors group-hover:bg-text shadow-[0_0_8px_var(--button-glow)] dark:shadow-[0_0_6px_var(--button-glow-dark)]"
      />
    </motion.div>
  );
};

export default WetPaintButton;
