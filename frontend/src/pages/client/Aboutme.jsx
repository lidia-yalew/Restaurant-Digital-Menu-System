import React from "react";
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
import img2 from "../../assets/IMG/imag2.png"


const Aboutme = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const stats = [
    { number: "5+", label: "Years Experience", icon: FaClock },
    { number: "50+", label: "Expert Chefs", icon: FaUsers },
    { number: "200+", label: "Menu Items", icon: FaUtensils },
    { number: "15+", label: "Awards Won", icon: FaAward },
  ];

  const values = [
    {
      icon: FaHeart,
      title: "Passion for Food",
      description:
        "We pour our heart into every dish, ensuring each plate tells a story of culinary excellence.",
    },
    {
      icon: FaLeaf,
      title: "Fresh Ingredients",
      description:
        "We source only the freshest, locally-sourced ingredients from trusted farmers.",
    },
    {
      icon: FaStar,
      title: "Quality Service",
      description:
        "Our dedicated staff ensures every guest feels welcomed and valued.",
    },
    {
      icon: FaTruck,
      title: "Fast Delivery",
      description:
        "Quick and efficient delivery to bring restaurant-quality meals to your doorstep.",
    },
  ];

  const team = [
    {
      name: "Chef Michael Chen",
      role: "Executive Chef",
      image: "https://images.unsplash.com/photo-1583394293214-28ded15ee548",
      description: "30+ years of culinary experience",
    },
    {
      name: "Chef Maria Santos",
      role: "Pastry Chef",
      image: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16",
      description: "Master of desserts",
    },
    {
      name: "Chef David Kim",
      role: "Sous Chef",
      image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c",
      description: "Specialist in Asian fusion",
    },
    {
      name: "Chef Sarah Johnson",
      role: "Nutrition Expert",
      image: "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46",
      description: "Healthy meal specialist",
    },
  ];

  const milestones = [
    { year: "2019", title: "Restaurant Opened", description: "Started with a dream" },
    { year: "2020", title: "First Award", description: "Best New Restaurant" },
    { year: "2022", title: "Expanded Kitchen", description: "Doubled our capacity" },
    { year: "2026", title: "Digital Menu Launch", description: "Modern ordering system" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={img2}
            alt="Restaurant interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative h-full flex items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="px-4"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
              Our Story
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
              Where passion meets flavor, creating unforgettable dining experiences
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
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
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </h3>
                <p className="text-gray-300">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Our Story Section */}
      <div ref={ref} className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our Journey
            </h2>
            <div className="w-20 h-1 bg-primary mb-8"></div>
            <p className="text-gray-300 text-lg mb-4">
              Founded in 2019, our restaurant began with a simple mission: to create
              extraordinary dining experiences that bring people together. What started
              as a small family kitchen has grown into a beloved culinary destination.
            </p>
            <p className="text-gray-300 text-lg mb-4">
              We believe that great food is more than just sustenance—it's an art form,
              a cultural expression, and a way to connect with others. Every dish we
              create tells a story of tradition, innovation, and passion.
            </p>
            <p className="text-gray-300 text-lg">
              Today, we continue to push boundaries, experimenting with flavors while
              honoring classic techniques. Our commitment to quality and excellence
              remains unwavering, and we're proud to serve our community.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0"
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
      <div className="bg-gray-900/50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Values
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center hover:transform hover:scale-105 transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
                    <Icon className="text-2xl text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-300">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Milestones
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6">
          {milestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary/20 to-transparent rounded-2xl p-6 text-center border border-primary/30">
                <div className="text-4xl font-bold text-primary mb-2">
                  {milestone.year}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {milestone.title}
                </h3>
                <p className="text-gray-300">{milestone.description}</p>
              </div>
              {index < milestones.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary/50"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-900/50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Meet Our Team
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              The talented individuals behind your favorite dishes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src={`${member.image}?w=400&h=500&fit=crop`}
                    alt={member.name}
                    className="w-full h-80 object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary mb-2">{member.role}</p>
                  <p className="text-gray-400 text-sm">{member.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl p-12 text-center border border-primary/30"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Experience Our Cuisine?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join us for an unforgettable dining experience or order online
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/menu" className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/80 transition-all transform hover:scale-105">
  View Menu
</Link>

<Link to="/reservation" className="border-2 border-primary text-primary px-8 py-3 rounded-full font-semibold hover:bg-primary hover:text-white transition-all">
  Make a Reservation
</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Aboutme;