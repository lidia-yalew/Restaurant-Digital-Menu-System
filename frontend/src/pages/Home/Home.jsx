import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Baner from "./Baner.jsx";
import WetPaintButton from "../../componests/UI/Button.jsx";
import Aboutme from "../client/Aboutme.jsx";
import Reserv from "../client/Reserv.jsx";
import Logo from "./Logo.jsx";
import { useEffect, useRef, useState } from "react";

function Home() {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const containerRef = useRef(null);

  // Check if mouse is already over the container on mount
  useEffect(() => {
    const checkMousePosition = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        if (mouseX >= rect.left && mouseX <= rect.right && 
            mouseY >= rect.top && mouseY <= rect.bottom) {
          setShowContent(true);
        }
      }
    };

    // Add listener to check mouse position after component mounts
    window.addEventListener('mousemove', checkMousePosition);
    
    // Cleanup
    return () => {
      window.removeEventListener('mousemove', checkMousePosition);
    };
  }, []);

  const handleMouseEnter = () => {
    setShowContent(true);
  };

  const handleMouseLeave = () => {
    setShowContent(false);
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {!showContent ? (
        <Logo />
      ) : (
        <div>
          <div className="w-full bg-bg text-3xl p-4 lg:mt-16 mt-12 scroll-animation">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
            >
              <div className="">
                <Baner />
              </div>
            </motion.div>

            <div className="block md:absolute right-4 md:bottom-8 md:left-8 lg:bottom-3 lg:left-10 lg:right-auto max-w-sm md:max-w-md mt-4 md:mt-0">
              <div className="backdrop-blur-sm border border-white/20 rounded-2xl p-2">
                <h2 className="text-center font-serif italic md:text-xl lg:text-1xl font-bold text-green-400 mb-2 text-sm">
                  Taste That Tells A Story
                </h2>
                <div className="h-0.5 w-12 md:w-24 lg:w-36 bg-green-400/80 m-auto my-2 rounded-full"></div>

                <p className="lg:text-white mb-4 text-xs lg:text-sm md:text-base font-medium text-center md:text-left">
                  Every dish is a chapter. Come write yours today.
                </p>
<div className="flex flex-wrap gap-3 justify-center md:justify-start mt-1">
                <WetPaintButton 
                  className="text-xs md:text-base px-6 md:px-8 md:py-2"
                  onClick={() => navigate('/menu')}
                >
                  VIEW MENU →
                </WetPaintButton>
                <button 
                  onClick={() => navigate('/reserve')}
                  className="text-xs md:text-base px-8 md:px-8 md:py-2 rounded-md border border-white/70 text-white font-semibold hover:bg-white/10 transition-all"
                >
                  RESERVE →
                </button>
                </div>
              </div>
            </div>
          </div>
          <Aboutme />
          <Reserv />
        </div>
      )}
    </div>
  );
}

export default Home;