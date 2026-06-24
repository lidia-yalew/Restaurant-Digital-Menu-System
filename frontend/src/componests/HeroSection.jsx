// /frontend/src/components/UI/HeroSection.jsx

import React from 'react';
import { motion } from 'framer-motion';

const HeroSection = ({
  // Image props
  image = null,
  imageAlt = "Hero background",
  imageClassName = "w-full h-full object-cover",
  
  // Title props
  title = "Welcome",
  titleClassName = "text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4",
  
  // Subtitle props
  subtitle = "",
  subtitleClassName = "text-base md:text-xl lg:text-2xl text-gray-200 max-w-2xl mx-auto",
  
  // Overlay props
  overlay = true,
  overlayClassName = "absolute inset-0 bg-black/50",
  
  // Layout props
  height = "h-[50vh] md:h-[60vh] min-h-[300px] md:min-h-[400px]",
  containerClassName = "relative overflow-hidden",
  contentClassName = "relative h-full flex flex-col items-center justify-center text-center px-4",
  
  // Animation props
  animate = true,
  animationDelay = 0.2,
  
  // Children
  children = null,
  
  // Custom styles
  customStyles = {}
}) => {
  
  const getImageSrc = (imageProp) => {
    if (!imageProp) return null;
    if (imageProp.startsWith('http')) return imageProp;
    if (imageProp.startsWith('/uploads')) {
      return `http://localhost:1994${imageProp}`;
    }
    return imageProp;
  };

  const TitleComponent = () => (
    <motion.h1
      className={titleClassName}
      initial={animate ? { opacity: 0, y: 30 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.8 }}
    >
      {title}
    </motion.h1>
  );

  const SubtitleComponent = () => (
    <motion.p
      className={subtitleClassName}
      initial={animate ? { opacity: 0, y: 30 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.8, delay: animationDelay }}
    >
      {subtitle}
    </motion.p>
  );

  return (
    <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
      {/* Background Image */}

      <div className="absolute inset-0 mt-10">
        {image ? (
          <img
            src={getImageSrc(image)}
            alt={imageAlt}
            className={imageClassName}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.style.backgroundColor = '#1a1a2e';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900"></div>
        )}
        
        {/* Overlay */}
        {overlay && <div className={overlayClassName}></div>}
      </div>

      {/* Content */}
      <div className={contentClassName}>
        <TitleComponent />
        <SubtitleComponent />
        {children}
      </div>
    </div>
  );
};

export default HeroSection;