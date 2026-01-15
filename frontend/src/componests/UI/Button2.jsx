// components/UI/SimpleMenuButton.jsx
import React from "react";

const Button2 = ({text ,className}) => {

  return (
    <button
      className={`border-2 border-y-green-400 border-x-card text-text rounded-4xl hover:bg-green-400 transition-colors text-xs md:text-sm lg:text-lg mt-2 ${className}`}
    >
      {text}
    </button>
  );
};

export default Button2;
