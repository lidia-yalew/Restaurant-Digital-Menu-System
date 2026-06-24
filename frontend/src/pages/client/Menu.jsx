import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import img2 from "../../assets/IMG/imag2.png";
import { 
  FaSearch, 
  FaShoppingCart, 
  FaUtensils,
  FaCoffee,
  FaIceCream,
  FaTimes,
  FaPlus,
  FaMinus,
  FaFlag,
  FaGlobe,
  FaBreadSlice,
  FaClock,
  FaSpinner,
  FaHeart,
  FaRegHeart,
  FaImage
} from "react-icons/fa";
import { fetchMenuService, fetchMenuCategoriesService } from '../../service/menuservice';
import { 
  CATEGORY_DISPLAY_NAMES, 
  CATEGORY_SHORT_NAMES,
  CATEGORY_ICON_COLORS,
  CATEGORY_ORDER
} from '../Manager/Menu/menuConstants';
import HeroSection from '../../componests/HeroSection';
import imghero from "../../assets/IMG/imghero.jfif"

// Helper to get category icon
const getCategoryIcon = (category) => {
  const colorClass = CATEGORY_ICON_COLORS[category] || 'text-gray-400';
  switch(category) {
    case 'ethiopian_main': return <FaFlag className={colorClass} />;
    case 'international_main': return <FaGlobe className={colorClass} />;
    case 'appetizer': return <FaUtensils className={colorClass} />;
    case 'bread': return <FaBreadSlice className={colorClass} />;
    case 'dessert': return <FaIceCream className={colorClass} />;
    case 'drink': return <FaCoffee className={colorClass} />;
    default: return <FaUtensils className="text-gray-400" />;
  }
};

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  if (imageUrl.startsWith('/uploads')) {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:1994';
    return `${baseURL}${imageUrl}`;
  }
  return imageUrl;
};

const ClientMenu = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [favorites, setFavorites] = useState([]);

  // Fetch menu items
  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const items = await fetchMenuService();
      setMenuItems(items);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const cats = await fetchMenuCategoriesService();
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(CATEGORY_ORDER);
    }
  };

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  // Filter menu items (only show available items)
  const filteredItems = menuItems.filter(item => {
    if (!item.is_available) return false;
    const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add to cart
const addToCart = (item) => {
  const existing = cart.find(c => c.id === item.id);
  if (existing) {
    setCart(cart.map(c =>
      c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
    ));
  } else {
    setCart([...cart, {
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      quantity: 1,
      image_url: item.image_url || null,
      description: item.description || '',
      category: item.category
    }]);
  }
};

  // Remove from cart
  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  // Update quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
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

  // Toggle favorite
  const toggleFavorite = (itemId) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Place order
  const placeOrder = () => {
    if (cart.length === 0) return;
    navigate('/checkout', { state: { cart, total: calculateTotal() } });
  };

  // Group items by category
  const getGroupedItems = () => {
    if (selectedCategory !== 'all') {
      const items = filteredItems;
      if (items.length === 0) return [];
      return [{
        category: selectedCategory,
        displayName: CATEGORY_DISPLAY_NAMES[selectedCategory] || selectedCategory,
        icon: getCategoryIcon(selectedCategory),
        items: items
      }];
    }

    return CATEGORY_ORDER
      .map(cat => ({
        category: cat,
        displayName: CATEGORY_DISPLAY_NAMES[cat],
        icon: getCategoryIcon(cat),
        items: filteredItems.filter(item => item.category === cat)
      }))
      .filter(group => group.items.length > 0);
  };

  const groupedItems = getGroupedItems();

  // Render item card - Proper Flex Layout
  const renderItemCard = (item, index) => (
    <motion.div
      key={item.id || index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:shadow-lg hover:transform hover:scale-[1.02] transition-all duration-300 overflow-hidden"
    >
      <div className="flex flex-row items-stretch">
        {/* Image Section - Fixed width on left */}
        <div className="w-28 h-28 md:w-32 md:h-32 flex-shrink-0 bg-gray-700 relative">
          {item.image_url ? (
            <img
              src={getImageUrl(item.image_url)}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                const parent = e.target.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaImage className="w-6 h-6 md:w-8 md:h-8 text-gray-500" />
            </div>
          )}
          
          {/* Favorite Button */}
          <button
            onClick={() => toggleFavorite(item.id)}
            className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full hover:bg-black/70 transition-all"
          >
            {favorites.includes(item.id) ? (
              <FaHeart className="text-red-500 text-sm" />
            ) : (
              <FaRegHeart className="text-white text-sm" />
            )}
          </button>
          
          {/* Out of Stock Badge */}
          {!item.is_available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">Out</span>
            </div>
          )}
        </div>

        {/* Content Section - Takes remaining space */}
        <div className="flex-1 p-3 md:p-4 bg-card">
          <div className="flex flex-row justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-base font-semibold text-primary-800 truncate">{item.name}</h3>
              <p className="text-gray-400 text-xs md:text-sm mt-1 line-clamp-2 break-words">
                {item.description || 'No description available'}
              </p>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2 text-[10px] md:text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  {getCategoryIcon(item.category)}
                  <span className="truncate">{CATEGORY_SHORT_NAMES[item.category] || item.category}</span>
                </div>
                {item.preparation_time && (
                  <div className="flex items-center gap-1">
                    <FaClock size={10} />
                    <span>{item.preparation_time} min</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price and Add to Cart */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <p className="text-base md:text-lg font-bold text-primary">{item.price} ETB</p>
              <button
                onClick={() => addToCart(item)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all bg-primary text-white hover:bg-primary/80 whitespace-nowrap"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-bg">
      

        {/* Hero Section */}
       <HeroSection
        image={imghero}
        title="Our Menu"
        subtitle= "Discover our delicious selection"
        height="h-[50vh] md:h-[55vh]"
      />
      

      {/* Filters Section */}
      <div className="bg-gray-900/95 backdrop-blur-md border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">

          {/* Category Filter */}
          <div className="mt-4 mx-auto flex gap-2 overflow-x-auto pb-2">
           <button
  key="category_all"
  onClick={() => setSelectedCategory('all')}
  className={`px-4 py-2 rounded-full whitespace-nowrap transition-all flex items-center gap-2 text-sm ${
    selectedCategory === 'all'
      ? 'bg-primary text-white'
      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
  }`}
>
  All
</button>
           {(categories.length > 0 ? categories : CATEGORY_ORDER).map((category, idx) => (
  <button
    key={`category_${category}_${idx}`}
    onClick={() => setSelectedCategory(category)}
    className={`px-4 py-2 rounded-full whitespace-nowrap transition-all flex items-center gap-2 text-sm ${
      selectedCategory === category
        ? 'bg-primary text-white'
        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
    }`}
  >
    {getCategoryIcon(category)}
    <span>{CATEGORY_SHORT_NAMES[category] || category}</span>
  </button>
))}
          </div>
              <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-50 pl-9 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-full text-white focus:outline-none focus:border-primary text-sm"
                />
              </div>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-full transition-all text-sm"
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
  <div key={`cart_${item.id}`} className="mb-4 p-4 bg-gray-800 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <h3 className="text-white font-semibold text-sm">{item.name}</h3>
                       
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600"
                          >
                            <FaMinus size={10} />
          </button>
                          <span className="text-white text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600"
                          >
                            <FaPlus size={10} />
                          </button>
                        </div>
                        <p className="text-primary text-sm">
                          {(item.price * item.quantity).toFixed(2)} <span className='text-white'> ETB</span> 
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between mb-4">
                    <span className="text-white font-semibold">Total:</span>
                    <span className="text-white font-bold text-xl">
                      {calculateTotal().toFixed(2)} ETB
                    </span>
                  </div>
                  <button
                    onClick={placeOrder}
                    className="w-full bg-primary text-white py-3 rounded-full font-semibold hover:bg-primary/80 transition-all"
                  >
                    Place Order
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Items - Grouped by Category */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-primary text-4xl" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/30 rounded-2xl">
            <FaUtensils className="text-5xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No items found</p>
          </div>
        ) : (
          <div className="space-y-8">
           {groupedItems.map((group, groupIndex) => (
  <div key={`group_${group.category}_${groupIndex}`}>
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-700">
                  <div className="text-xl">
                    {group.icon}
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    {group.displayName}
                  </h2>
                  <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
                    {group.items.length}
                  </span>
                </div>
                
                {/* Items Grid - Two columns on desktop, one on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.items.map((item, index) => renderItemCard(item, index))}
                </div>
              </div>
            ))}
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

export default ClientMenu;