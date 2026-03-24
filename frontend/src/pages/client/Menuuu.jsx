import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaSearch, 
  FaShoppingCart, 
  FaPlus, 
  FaMinus,
  FaLeaf,
  FaFire,
  FaStar,
  FaClock,
  FaFilter,
  FaTimes,
  FaUtensils,
  FaCoffee,
  FaIceCream,
  FaWineGlassAlt
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Menuuu = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50 });
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [loading] = useState(false);

  // Static Menu Data
  const menuItems = [
    {
      id: 1,
      name: "Greek Salad",
      description: "Fresh tomatoes, green bell peppers, sliced cucumber, onion, olives, and feta cheese",
      price: 25.00,
      category: "Appetizers",
      image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      is_available: true,
      isVeg: true,
      popular: true,
      preparation_time: 15
    },
    {
      id: 2,
      name: "Lavash Roll",
      description: "Vegetables, cheeses, ground meats, tomato sauce, seasonings and spices",
      price: 40.00,
      category: "Main Course",
      image_url: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f",
      is_available: true,
      isVeg: false,
      popular: true,
      preparation_time: 25
    },
    {
      id: 3,
      name: "Butternut Pumpkin Soup",
      description: "Preserving traditional winter squash with pumpkin seeds and cream",
      price: 10.00,
      category: "Soups",
      image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd",
      is_available: true,
      isVeg: true,
      popular: false,
      preparation_time: 10
    },
    {
      id: 4,
      name: "Mango Smoothie",
      description: "Fresh mango, yogurt, honey, and a touch of mint",
      price: 8.00,
      category: "Drinks",
      image_url: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4",
      is_available: true,
      isVeg: true,
      popular: true,
      preparation_time: 5
    },
    {
      id: 5,
      name: "Spicy Chicken Wings",
      description: "Crispy chicken wings tossed in spicy buffalo sauce",
      price: 18.00,
      category: "Appetizers",
      image_url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f",
      is_available: true,
      isSpicy: true,
      popular: true,
      preparation_time: 20
    },
    {
      id: 6,
      name: "Grilled Salmon",
      description: "Fresh Atlantic salmon with lemon butter sauce and vegetables",
      price: 32.00,
      category: "Main Course",
      image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2",
      is_available: true,
      isVeg: false,
      popular: false,
      preparation_time: 30
    },
    {
      id: 7,
      name: "Chocolate Lava Cake",
      description: "Warm chocolate cake with molten center, served with vanilla ice cream",
      price: 12.00,
      category: "Desserts",
      image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c",
      is_available: true,
      isVeg: true,
      popular: true,
      preparation_time: 15
    },
    {
      id: 8,
      name: "Mojito",
      description: "Fresh mint, lime, rum, and soda water",
      price: 12.00,
      category: "Drinks",
      image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd",
      is_available: false,
      isVeg: true,
      popular: false,
      preparation_time: 5
    },
    {
      id: 9,
      name: "Margherita Pizza",
      description: "Fresh mozzarella, tomato sauce, basil, and olive oil",
      price: 22.00,
      category: "Main Course",
      image_url: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143",
      is_available: true,
      isVeg: true,
      popular: true,
      preparation_time: 20
    },
    {
      id: 10,
      name: "Tiramisu",
      description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone",
      price: 11.00,
      category: "Desserts",
      image_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9",
      is_available: true,
      isVeg: true,
      popular: true,
      preparation_time: 10
    },
    {
      id: 11,
      name: "Fresh Lemonade",
      description: "Freshly squeezed lemons with mint and honey",
      price: 6.00,
      category: "Drinks",
      image_url: "https://images.unsplash.com/photo-1621263764928-df1444c5e859",
      is_available: true,
      isVeg: true,
      popular: false,
      preparation_time: 3
    },
    {
      id: 12,
      name: "Pad Thai",
      description: "Stir-fried rice noodles with shrimp, tofu, peanuts, and bean sprouts",
      price: 24.00,
      category: "Main Course",
      image_url: "https://images.unsplash.com/photo-1559314809-0d155014e29e",
      is_available: true,
      isSpicy: true,
      popular: false,
      preparation_time: 25
    }
  ];

  // Get unique categories
  const categories = ["all", ...new Set(menuItems.map(item => item.category))];

  // Filter menu items
  const filteredItems = menuItems.filter(item => {
    // Category filter
    if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
    
    // Search filter
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !item.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    // Price filter
    if (item.price < priceRange.min || item.price > priceRange.max) return false;
    
    return true;
  });

  // Add to cart
  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // Update quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== itemId));
    } else {
      setCart(cart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Place order
  const placeOrder = () => {
    if (cart.length === 0) return;
    alert(`Order placed! Total: $${calculateTotal().toFixed(2)}\nItems: ${cart.length}`);
    setCart([]);
    setShowCart(false);
  };

  // Get badge for dietary restrictions
  const getDietaryBadge = (item) => {
    if (item.isVeg) return { label: "Veg", color: "bg-green-500", icon: FaLeaf };
    if (item.isSpicy) return { label: "Spicy", color: "bg-red-500", icon: FaFire };
    return null;
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch(category) {
      case "Appetizers": return <FaUtensils />;
      case "Main Course": return <FaUtensils />;
      case "Desserts": return <FaIceCream />;
      case "Drinks": return <FaCoffee />;
      case "Soups": return <FaUtensils />;
      default: return <FaUtensils />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-20">
      {/* Hero Section */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5"
          alt="Menu Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-white mb-4"
            >
              Our Menu
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-200"
            >
              Discover our delicious selection
            </motion.p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="sticky top-16 z-40 bg-gray-900/95 backdrop-blur-md border-b border-gray-700">
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
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-all flex items-center gap-2 ${
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

            {/* Cart Button */}
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-full transition-all"
            >
              <FaShoppingCart className="inline mr-2" />
              Cart
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>

          {/* Price Range Filter */}
          <div className="mt-4 flex items-center gap-4 text-sm flex-wrap">
            <FaFilter className="text-gray-400" />
            <span className="text-gray-300">Price Range:</span>
            <span className="text-primary">${priceRange.min}</span>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
              className="flex-1 max-w-xs"
            />
            <span className="text-primary">${priceRange.max}</span>
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed right-0 top-0 h-full w-full md:w-96 bg-gray-900 shadow-2xl z-50 border-l border-gray-700"
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Your Order</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <FaShoppingCart className="text-6xl text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Your cart is empty</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="mb-4 p-4 bg-gray-800 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <h3 className="text-white font-semibold">{item.name}</h3>
                        <p className="text-primary">${item.price}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-all"
                          >
                            <FaMinus size={12} />
                          </button>
                          <span className="text-white font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-all"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>
                        <p className="text-gray-300 font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between mb-4">
                    <span className="text-white text-lg font-semibold">Total:</span>
                    <span className="text-primary font-bold text-2xl">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={placeOrder}
                    className="w-full bg-primary text-white py-3 rounded-full font-semibold hover:bg-primary/80 transition-all transform hover:scale-105"
                  >
                    Place Order
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Grid */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No items found</p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchTerm("");
                setPriceRange({ min: 0, max: 50 });
              }}
              className="mt-4 bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/80"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => {
              const badge = getDietaryBadge(item);
              const BadgeIcon = badge?.icon;
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group cursor-pointer"
                >
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {!item.is_available && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Out of Stock</span>
                      </div>
                    )}
                    {badge && (
                      <div className={`absolute top-2 left-2 ${badge.color} text-white px-2 py-1 rounded-full text-xs flex items-center gap-1`}>
                        <BadgeIcon size={12} />
                        {badge.label}
                      </div>
                    )}
                    {item.popular && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <FaStar size={12} />
                        Popular
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white">{item.name}</h3>
                      <p className="text-2xl font-bold text-primary">${item.price}</p>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-4">
                      <FaClock size={12} />
                      <span>{item.preparation_time} min</span>
                      <span className="mx-1">•</span>
                      <span>{item.category}</span>
                    </div>
                    
                    <button
                      onClick={() => addToCart(item)}
                      disabled={!item.is_available}
                      className={`w-full py-2 rounded-full font-semibold transition-all ${
                        item.is_available
                          ? "bg-primary text-white hover:bg-primary/80 transform hover:scale-105"
                          : "bg-gray-600 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {item.is_available ? "Add to Cart" : "Unavailable"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Indicator for Mobile */}
      {cart.length > 0 && !showCart && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-2xl z-40 md:hidden"
        >
          <FaShoppingCart size={24} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </motion.button>
      )}
    </div>
  );
};

export default Menuuu;