import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import imag1 from "../../assets/IMG/imag1.png";

function Logo({ onEnter }) {
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
      setTimeout(() => setShowHint(true), 1000);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black z-50 cursor-pointer"
      onClick={onEnter}
      onMouseEnter={onEnter}
    >
      <div className="h-full grid grid-cols-1 lg:grid-cols-2 p-4 gap-8 md:gap-12">
        {/* Text Side */}
        <div className="flex flex-col justify-center items-center text-center py-4 space-y-6 text-white">
          <div className="space-y-4">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-serif text-4xl md:text-5xl lg:text-6xl"
            >
              welcome to
            </motion.p>

            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="font-serif italic text-4xl md:text-5xl lg:text-6xl font-bold text-green-500"
            >
              restaurants of lidia
            </motion.p>

            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-xl md:text-2xl lg:text-3xl text-green-300"
            >
              digital menu system
            </motion.h3>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-8 md:mt-12 space-y-4"
          >
            <div className="w-24 md:w-32 h-1 bg-green-500 mx-auto"></div>
          
          </motion.div>
        </div>

        {/* Image Side */}
        <div className="flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="relative"
          >
            <img
              src={imag1}
              alt="Restaurant of Lidia"
              className="rounded-2xl md:rounded-3xl shadow-[0_0_20px_0_rgba(34,197,94,0.5)] w-4/5 md:w-full max-w-md mx-auto"
            />
           
          </motion.div>
        </div>
      </div>

      {/* Animated Hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <div className="flex items-center space-x-2 text-green-400 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
              <motion.span
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                👇
              </motion.span>
              <span className="text-sm">hover or click </span>
              <motion.span
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
              >
                👇
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Logo;
