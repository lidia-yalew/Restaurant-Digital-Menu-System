import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function Nav() {
  const navItems = [
    { name: "Home", path: "/", id: 1 },
    { name: "AboutUs", path: "/about", id: 2 },
    { name: "Menu", path: "/menu", id: 3 },
    { name: "Login", path: "/l", id: 4 },
    { name: "Reserve", path: "/reserve", id: 5 },
  ];

  return (
    <div className="h-10 md:h-10 flex items-center justify-center space-x-5 md:space-x-15 px-8">
      {navItems.map((item) => (
        <NavLink key={item.id} item={item} />
      ))}
    </div>
  );
}

function NavLink({ item }) {
  return (
    <Link to={item.path} className="relative block h-10 overflow-hidden group">
      <motion.div
        whileHover={{ y: -40 }}
        transition={{
          duration: 0.4,
          ease: "easeInOut",
        }}
        className="h-20 flex flex-col"
      >
        {/* TOP LAYER: Normal State */}
        <div className="h-10 flex items-center justify-center text-primary text-sm md:text-lg font-medium">
          {item.name}
        </div>

        {/* BOTTOM LAYER: Hover State */}
        <div className="h-10 flex items-center justify-center text-text text-sm md:text-lg font-bold">
          {item.name}
        </div>
      </motion.div>

      {/* Hover Indicator Line */}
      <motion.div
        initial={{ width: 0 }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-0 left-0 h-0.5 bg-primary"
      />
    </Link>
  );
}

export default Nav;
