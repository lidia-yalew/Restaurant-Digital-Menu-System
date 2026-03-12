import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

// Custom hook for theme management
const useTheme = () => {
  const [theme, setTheme] = useState("light");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const initialTheme = saved || (systemDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
    setIsLoaded(true);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }, [theme]);

  return { theme, toggleTheme, isLoaded };
};

// NavLink Component
const NavLink = ({ item, currentPath }) => {
  const isActive = currentPath === item.path;

  return (
    <Link
      to={item.path}
      aria-current={isActive ? "page" : undefined}
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
        <div
          className={`h-8 sm:h-10 flex items-center justify-center text-primary text-xs sm:text-sm md:text-base lg:text-lg font-bold group-hover:text-primary transition-colors ${
            isActive ? "font-extrabold" : ""
          }`}
        >
          {item.name}
        </div>

        {/* BOTTOM LAYER: Hover State */}
        <div className="h-8 sm:h-10 flex items-center justify-center text-text text-xs sm:text-sm md:text-base lg:text-xl font-bold">
          {item.name}
        </div>
      </motion.div>

      {/* Active Indicator */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Hover Indicator Line */}
      <motion.div
        initial={{ width: 0 }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-0 left-0 h-0.5 bg-primary/50"
      />
    </Link>
  );
};

// Main Nav Component
function Nav() {
  const location = useLocation();
  const { theme, toggleTheme, isLoaded } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  // Memoized nav items
  const navItems = useMemo(
    () => [
      { name: "Home", path: "/", id: 1 },
      { name: "About", path: "/about", id: 2 },
      { name: "Menu", path: "/menu", id: 3 },
      { name: "Reserve", path: "/reserve", id: 4 },
      { name: "Login", path: "/login", id: 5 },
    ],
    []
  );

  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Don't render until theme is loaded to prevent flash
  if (!isLoaded) {
    return (
      <div className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-3xl">
        <div className="bg-card/40 border-white rounded-full px-4 sm:px-8 md:px-12 py-2 sm:py-2.5 shadow-2xl animate-pulse">
          <div className="flex items-center justify-center space-x-1 sm:space-x-3 md:space-x-8 lg:space-x-12 px-4 sm:px-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-8 w-12 sm:h-10 sm:w-16 bg-white/20 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-3xl">
      <div className="bg-card/40 backdrop-blur-sm border border-white/20 rounded-full px-4 sm:px-8 md:px-12 py-2 sm:py-2.5 shadow-2xl relative">
        <div className="flex items-center justify-between sm:justify-center space-x-1 sm:space-x-3 md:space-x-8 lg:space-x-12 px-4 sm:px-2">
          {navItems.map(
            (item) =>
              // Hide "Reserve" on mobile if needed
              (!isMobile ||
                !(item.name === "Reserve" && window.innerWidth < 400)) && (
                <NavLink
                  key={item.id}
                  item={item}
                  currentPath={location.pathname}
                />
              )
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${
              theme === "light" ? "dark" : "light"
            } mode`}
            className="absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/80 hover:bg-primary text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <motion.span
              key={theme}
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-sm md:text-base"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </motion.span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Nav;
