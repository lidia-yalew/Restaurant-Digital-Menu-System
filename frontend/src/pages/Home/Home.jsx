import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "../../layout/Nav.jsx";
import Baner from "./Baner.jsx";
import WetPaintButton from "../../componests/UI/Button.jsx";

function Home() {
  const [theme, setTheme] = useState("light");

  // Load saved theme or detect OS preference
  useEffect(() => {
    const saved = localStorage.getItem("theme");

    // No need for setTimeout - it can cause flash
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="min-h-screen bg-bg text-3xl p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Theme Toggle Button */}
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-card backdrop-blur-md border border-white/20 rounded-full px-12 py-2 shadow-xl">
            <Nav />
          </div>
        </div>
      </motion.div>

      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 w-12 h-12 rounded-full bg-primary text-white text-xl z-50" // Changed to z-50
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2 }} // Added delay
      >
        <div className="mt-[60px] md:mt-[-10px]">
          <Baner />
        </div>

        <div className="absolute bottom-20 left-10 max-w-sm">
          {/* Glass card content goes here */}

          <div className="backdrop-blur-sm bg-black/50 border border-white/20 rounded-2xl p-2">
            {/* Content goes here */}
            <h2 className=" text-center font-serif italic text-lg md:text-xl lg:text-1xl font-bold text-white  mb-2">
              Taste That Tells
              <span className="">A Story</span>
            </h2>
            <p className="text-green-500 mb-4 text-sm font-bold">
              Every dish is a chapter. Come write yours today.
            </p>
            <WetPaintButton>VIEW MENU →</WetPaintButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Home;