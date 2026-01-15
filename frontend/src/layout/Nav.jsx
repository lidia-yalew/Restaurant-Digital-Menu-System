import React  from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function Nav() {
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

  const navItems = [
    { name: "Home", path: "/", id: 1 },
    { name: "About", path: "/about", id: 2 },
    { name: "Menu", path: "/menu", id: 3 },
    { name: "Login", path: "/login", id: 4 },
    { name: "Reserve", path: "/reserve", id: 5 },
  ];

  return (
    <div className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-3xl">
      <div className=" bg-card border-white/30 rounded-full px-4 sm:px-8 md:px-12 py-2 sm:py-2.5 shadow-2xl">
        <div className="h-8 sm:h-10 flex items-center justify-between sm:justify-center space-x-1 sm:space-x-3 md:space-x-8 lg:space-x-12 px-2 sm:px-4">
          {navItems.map((item) => (
            <NavLink key={item.id} item={item} />
          ))}
          <button
            onClick={toggleTheme}
            className="fixed top-1 right-0 w-8 h-9 md:w-11 md:h-11 rounded-full bg-primary text-white text-xl z-50" // Changed to z-50
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NavLink({ item }) {
  return (
    <Link
      to={item.path}
      className="relative block h-8 sm:h-10 overflow-hidden group"
    >
      <motion.div
        whileHover={{ y: -42 }}
        whileTap={{ y: -16 }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className="h-16 sm:h-20 flex flex-col"
      >
        {/* TOP LAYER: Normal State */}
        <div className="h-8 sm:h-10 flex items-center justify-center text-primary  text-xs sm:text-sm md:text-base lg:text-lg font-bold  group-hover:text-primary transition-colors">
          {item.name}
        </div>

        {/* BOTTOM LAYER: Hover State */}
        <div className="h-8 sm:h-10 flex items-center justify-center text-text text-xs sm:text-sm md:text-base lg:text-xl font-bold">
          {item.name}
        </div>
      </motion.div>

      {/* Hover Indicator Line */}
      <motion.div
        initial={{ width: 0 }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-0 left-0 h-0.5 bg-primary"
      />
    </Link>
  );
}

export default Nav;
