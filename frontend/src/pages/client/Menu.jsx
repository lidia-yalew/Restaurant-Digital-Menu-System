import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import img2 from "../../assets/IMG/imag2.png";
import { 
  FaSearch, 
  FaShoppingCart, 
  FaUtensils,
  FaCoffee,
  FaIceCream,
  FaWineGlassAlt,
  FaTimes,
  FaPlus,
  FaMinus
} from "react-icons/fa";

function Menu() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Sample menu data (you'll replace this with real data later)
  const menuItems = [
    { id: 1, name: "Greek Salad", category: "Appetizers", price: 25 },
    { id: 2, name: "Lavash Roll", category: "Main Course", price: 40 },
    { id: 3, name: "Butternut Soup", category: "Soups", price: 10 },
    { id: 4, name: "Mango Smoothie", category: "Drinks", price: 8 },
    { id: 5, name: "Chocolate Cake", category: "Desserts", price: 12 },
  ];

  // Get unique categories
  const categories = ["all", ...new Set(menuItems.map(item => item.category))];

  // Get category icon
  const getCategoryIcon = (category) => {
    switch(category) {
      case "Appetizers": return <FaUtensils className="text-sm" />;
      case "Main Course": return <FaUtensils className="text-sm" />;
      case "Desserts": return <FaIceCream className="text-sm" />;
      case "Drinks": return <FaCoffee className="text-sm" />;
      case "Soups": return <FaUtensils className="text-sm" />;
      default: return <FaUtensils className="text-sm" />;
    }
  };

  // Filter items based on selected category
  const filteredItems = menuItems.filter(item => {
    if (selectedCategory === "all") return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black ">
      {/* Hero Section */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <img
          src={img2}
          alt="Menu Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold text-white mb-4"
            >
              Our Menu
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
              className="text-xl text-gray-200"
            >
              Discover our delicious selection
            </motion.p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-gray-900/95 backdrop-blur-md border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-full text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Category Filter */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all flex items-center gap-2 text-sm ${
                  selectedCategory === category
                    ? "bg-primary text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {category !== "all" && getCategoryIcon(category)}
                {category === "all" ? "All" : category}
              </button>
            ))}
          </div>
          </div>
 {/* Cart Button (Optional) */}
            <button className="relative bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-full transition-all">
              <FaShoppingCart className="inline mr-2" />
              Cart
            </button>
         
        </div>
      </div>

      {/* Menu Grid Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group"
            >
              <div className="relative h-48 bg-gray-700">
                {/* Placeholder for image */}
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">{item.name}</h3>
                  <p className="text-2xl font-bold text-primary">${item.price}</p>
                </div>
                
                <p className="text-gray-400 text-sm mb-3">
                  Category: {item.category}
                </p>
                
                <button className="w-full py-2 rounded-full font-semibold transition-all bg-primary text-white hover:bg-primary/80">
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Show message when no items */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No items found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Menu;