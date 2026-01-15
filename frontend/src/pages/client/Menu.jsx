import React from "react";
import imag1 from "../../assets/IMG/imag1.png";
import Button2 from "../../componests/UI/Button2.jsx";
import { motion } from "framer-motion";

function Menu() {
  return (
    <div className="">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
      >
        <h1 className="font-serif italic text-2xl md:text-2xl lg:text-4xl font-bold text-primary text-center mb-5">
          <span className="lg:text-5xl">w</span>e Offer Quality Service
        </h1>
        <div className="grid grid-cols-3 gap-2 md:gap-6 lg:gap-8 justify-between text-xs md:text-lg lg:text-2xl h-auto text-center font-serif italic m-auto">
          <div className="bg-card p-2 lg:p-4  rounded-4xl">
            <h1>Main Dining Menu</h1>
            <Button2 text="Explore Menu" className="animate-bounce" />
            <img
              src={imag1}
              className="object-cover rounded-2xl w-32 h-32 md:w-44 md:h-44 lg:w-48 lg:h-48 mx-auto border border-white/50"
              alt="Main dining"
            />
          </div>
          <div className="bg-card mt-10 p-2 lg:p-2 rounded-4xl">
            <h1> Drinks Menu</h1>
            <Button2 text="View Drinks" className="animate-bounce mt-1" />
            <img
              src={imag1}
              className="object-cover rounded-full size-26 md:size-36 lg:size-44 m-auto border border-white/50 "
            />
          </div>
          <div className="bg-card p-2 lg:p-4 rounded-4xl">
            <h1> Dessert Menu</h1>
            <Button2 text="Sweet Treats" className="animate-bounce " />
            <img
              src={imag1}
              className="object-cover rounded-2xl w-32 h-32 md:w-44 md:h-44 lg:w-48 lg:h-48 mx-auto border border-white/50"
              alt="Main dining"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Menu;
