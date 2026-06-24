import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  FaUtensils,
  FaLeaf,
  FaTruck,
  FaHeart,
  FaStar,
  FaClock,
  FaUsers,
  FaAward,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { getRestaurantInfo } from "../../API/resinfo";
import HeroSection from "../../componests/HeroSection";

const Aboutme = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [content, setContent] = useState({
    hero_title: "",
    hero_subtitle: "",
    hero_image: "",
    about_title: "",
    about_description_1: "",
    about_description_2: "",
    about_description_3: "",
    about_image: "",
    stats_title: "",
    stats_subtitle: "",
    stats: [],
    values_title: "",
    values_subtitle: "",
    values: [],
    team_title: "",
    team_subtitle: "",
    team: [],
    milestones_title: "",
    milestones: [],
    cta_title: "",
    cta_subtitle: "",
    cta_button1_text: "",
    cta_button2_text: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map icon strings to actual components
  const getIconComponent = (iconName) => {
    const icons = {
      FaClock: FaClock,
      FaUsers: FaUsers,
      FaUtensils: FaUtensils,
      FaAward: FaAward,
      FaHeart: FaHeart,
      FaLeaf: FaLeaf,
      FaStar: FaStar,
      FaTruck: FaTruck
    };
    return icons[iconName] || FaUtensils;
  };

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) {
      return `http://localhost:1994${imagePath}`;
    }
    return imagePath;
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await getRestaurantInfo();
        console.log('API Response:', response);
        
        let data = response;
        if (response.success && response.data) {
          data = response.data;
        }
        
        if (data && typeof data === 'object') {
          setContent({
            hero_title: data.hero_title || "",
            hero_subtitle: data.hero_subtitle || "",
            hero_image: data.hero_image || "",
            about_title: data.about_title || "",
            about_description_1: data.about_description_1 || "",
            about_description_2: data.about_description_2 || "",
            about_description_3: data.about_description_3 || "",
            about_image: data.about_image || "",
            stats_title: data.stats_title || "",
            stats_subtitle: data.stats_subtitle || "",
            stats: data.stats ? (typeof data.stats === 'string' ? JSON.parse(data.stats) : data.stats) : [],
            values_title: data.values_title || "",
            values_subtitle: data.values_subtitle || "",
            values: data.values ? (typeof data.values === 'string' ? JSON.parse(data.values) : data.values) : [],
            team_title: data.team_title || "",
            team_subtitle: data.team_subtitle || "",
            team: data.team ? (typeof data.team === 'string' ? JSON.parse(data.team) : data.team) : [],
            milestones_title: data.milestones_title || "",
            milestones: data.milestones ? (typeof data.milestones === 'string' ? JSON.parse(data.milestones) : data.milestones) : [],
            cta_title: data.cta_title || "",
            cta_subtitle: data.cta_subtitle || "",
            cta_button1_text: data.cta_button1_text || "",
            cta_button2_text: data.cta_button2_text || ""
          });
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !content.hero_title) {
    return (
      <div className="w-full bg-bg pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Unable to load content. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg overflow-x-hidden">
     
      {/* Hero Section */}
      <HeroSection
        image={content.hero_image}
        title={content.hero_title}
        subtitle={content.hero_subtitle}
        height="h-[50vh] md:h-[55vh]"
      />

      {/* Stats Section */}
      {content.stats.length > 0 && (
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">
              {content.stats_title}
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-text/70 text-lg max-w-2xl mx-auto">
              {content.stats_subtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {content.stats.map((stat, index) => {
              const Icon = getIconComponent(stat.icon);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
                    <Icon className="text-3xl text-primary" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-text mb-2">
                    {stat.number}
                  </h3>
                  <p className="text-text/70">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Our Story Section */}
      <div ref={ref} className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-text mb-6">
              {content.about_title}
            </h2>
            <div className="w-20 h-1 bg-primary mb-8"></div>
            <p className="text-text/80 text-lg mb-4">
              {content.about_description_1}
            </p>
            <p className="text-text/80 text-lg mb-4">
              {content.about_description_2}
            </p>
            <p className="text-text/80 text-lg">
              {content.about_description_3}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <img
              src={getImageUrl(content.about_image)}
              alt="Chef cooking"
              className="rounded-2xl shadow-2xl w-full h-auto"
            />
            <div className="absolute -bottom-6 -right-6 bg-primary p-4 rounded-xl shadow-xl">
              <FaHeart className="text-white text-3xl" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Our Values Section */}
      {content.values.length > 0 && (
        <div className="bg-card/50 py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">
                {content.values_title}
              </h2>
              <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
              <p className="text-text/70 text-lg max-w-2xl mx-auto">
                {content.values_subtitle}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {content.values.map((value, index) => {
                const Icon = getIconComponent(value.icon);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card border border-border rounded-2xl p-6 text-center hover:transform hover:scale-105 transition-all duration-300 shadow-subtle"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
                      <Icon className="text-2xl text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-text mb-3">
                      {value.title}
                    </h3>
                    <p className="text-text/70">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Milestones Section */}
{content.milestones.length > 0 && (
  <div className="container mx-auto px-4 py-20">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      className="text-center mb-12"
    >
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text mb-4">
        {content.milestones_title}
      </h2>
      <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
    </motion.div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {content.milestones.map((milestone, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          <div className="bg-card border border-primary/30 rounded-2xl p-6 text-center hover:shadow-large transition-all duration-300">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
              {milestone.year}
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-text mb-2">
              {milestone.title}
            </h3>
            <p className="text-text/70 text-sm md:text-base">{milestone.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
)}

      {/* Team Section */}
{content.team.length > 0 && (
  <div className="bg-card/50 py-20">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text mb-4">
          {content.team_title}
        </h2>
        <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
        <p className="text-text/70 text-base md:text-lg max-w-2xl mx-auto">
          {content.team_subtitle}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {content.team.map((member, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.1 }}
            className="group cursor-pointer bg-card rounded-2xl overflow-hidden border border-border hover:shadow-large transition-all duration-300"
          >
            {/* Horizontal layout on mobile, vertical on desktop */}
            <div className="flex flex-row md:flex-col">
              {/* Image Section - Fixed width on left for mobile */}
              <div className="w-28 h-28 md:w-full md:h-80 flex-shrink-0 relative overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const parent = e.target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-800"><svg class="w-8 h-8 md:w-12 md:h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>';
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:flex hidden"></div>
              </div>
              
              {/* Content Section */}
              <div className="flex-1 p-4 text-center md:text-center">
                <h3 className="text-base md:text-xl font-semibold text-text mb-1">
                  {member.name}
                </h3>
                <p className="text-primary text-xs md:text-base mb-2">{member.role}</p>
                <p className="text-text/60 text-xs md:text-sm line-clamp-2 md:line-clamp-none">
                  {member.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
)}

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl p-12 text-center border border-primary/30"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
            {content.cta_title}
          </h2>
          <p className="text-text/70 text-lg mb-8 max-w-2xl mx-auto">
            {content.cta_subtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/menu" 
              className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/80 transition-all transform hover:scale-105 shadow-button"
            >
              {content.cta_button1_text}
            </Link>
            <Link 
              to="/reserve" 
              className="border-2 border-primary text-primary px-8 py-3 rounded-full font-semibold hover:bg-primary hover:text-white transition-all"
            >
              {content.cta_button2_text}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Aboutme;