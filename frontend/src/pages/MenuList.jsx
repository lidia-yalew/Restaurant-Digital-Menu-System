import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaEye,
  FaEyeSlash,
  FaImage,
  FaSpinner,
  FaUtensils,
  FaCoffee,
  FaIceCream,
  FaFlag,
  FaGlobe,
  FaBreadSlice,
  FaEllipsisV
} from 'react-icons/fa';
import {
  fetchMenuService,
  deleteMenuService,
  toggleMenuItemAvailabilityService,
  fetchMenuCategoriesService
} from '../service/menuservice';
import DeleteModal from '../componests/UI/DeleteModal';
import { 
  CATEGORY_DISPLAY_NAMES, 
  CATEGORY_SHORT_NAMES,
  CATEGORY_ICON_COLORS,
  CATEGORY_ORDER,
} from './Manager/Menu/menuConstants';
import { useAuth } from '../config/AuthContext';

// Helper to get category icon with color
const getCategoryIcon = (category) => {
  const colorClass = CATEGORY_ICON_COLORS[category] || 'text-gray-500';
  switch(category) {
    case 'ethiopian_main': return <FaFlag className={colorClass} />;
    case 'international_main': return <FaGlobe className={colorClass} />;
    case 'appetizer': return <FaUtensils className={colorClass} />;
    case 'bread': return <FaBreadSlice className={colorClass} />;
    case 'dessert': return <FaIceCream className={colorClass} />;
    case 'drink': return <FaCoffee className={colorClass} />;
    default: return <FaUtensils className="text-gray-500" />;
  }
};
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http')) return imageUrl;
  // If it starts with /uploads, add the API base URL
  if (imageUrl.startsWith('/uploads')) {
    return `http://localhost:1994${imageUrl}`;
  }
  return imageUrl;
};
const MenuList = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [error, setError] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // Get current user role from auth context
  const { user } = useAuth();
  const userRole = user?.role || 'customer';
  
  // Role-based permissions
  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'manager';
  const isChef = userRole === 'kitchen';
  
  const canAddItem = isAdmin || isManager;
  const canEditItem = isAdmin || isManager;
  const canDeleteItem = isAdmin;
  const canToggleAvailability = isAdmin || isManager || isChef;
  const showDropdown = canToggleAvailability || canEditItem || canDeleteItem;
  
  // Create refs for each dropdown
  const dropdownRefs = useRef({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutside = Object.values(dropdownRefs.current).every(
        ref => ref && !ref.contains(event.target)
      );
      if (isOutside) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch menu items using service
  const fetchMenuItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchMenuService();
      setMenuItems(items);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setError('Failed to load menu items. Please try again.');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories using service
  const fetchCategories = async () => {
    try {
      const cats = await fetchMenuCategoriesService();
      // Ensure categories are in the correct order
      const orderedCats = CATEGORY_ORDER.filter(cat => cats.includes(cat));
      setCategories(orderedCats);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(CATEGORY_ORDER);
    }
  };

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  // Filter menu items
  const filteredItems = Array.isArray(menuItems) ? menuItems.filter(item => {
    if (!item) return false;
    const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  // Toggle availability using service
  const handleToggleAvailability = async (item) => {
    if (!canToggleAvailability) return;
    try {
      await toggleMenuItemAvailabilityService(item.id, item.is_available);
      await fetchMenuItems();
      setOpenDropdown(null);
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Failed to update availability');
    }
  };

  // Open delete confirmation
  const handleDeleteClick = (item) => {
    if (!canDeleteItem) return;
    setItemToDelete(item);
    setDeleteModalOpen(true);
    setOpenDropdown(null);
  };

  // Confirm delete using service
  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteMenuService(itemToDelete.id);
        await fetchMenuItems();
        setDeleteModalOpen(false);
        setItemToDelete(null);
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
    }
  };

  // Group items by category in correct order
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

  // Render dropdown menu based on user role
  const renderDropdownMenu = (item) => {
    return (
      <div className="py-1">
        {/* Mark Available/Out - For Admin, Manager, and Chef */}
        {canToggleAvailability && (
          <button
            onClick={() => handleToggleAvailability(item)}
            className={`w-full px-4 py-2 text-sm text-left flex items-center gap-2 transition-all ${
              item.is_available
                ? 'text-yellow-600 hover:bg-yellow-50'
                : 'text-green-600 hover:bg-green-50'
            }`}
          >
            {item.is_available ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
            {item.is_available ? 'Mark Out' : 'Mark Available'}
          </button>
        )}
        
        {/* Edit Item - For Admin and Manager only */}
        {canEditItem && (
          <Link
            to={`/manager/menu/edit/${item.id}`}
            className="w-full px-4 py-2 text-sm text-left flex items-center gap-2 text-blue-600 hover:bg-blue-50 transition-all"
          >
            <FaEdit size={14} />
            Edit
          </Link>
        )}
        
        {/* Delete Item - For Admin only */}
        {canDeleteItem && (
          <button
            onClick={() => handleDeleteClick(item)}
            className="w-full px-4 py-2 text-sm text-left flex items-center gap-2 text-red-600 hover:bg-red-50 transition-all"
          >
            <FaTrash size={14} />
            Delete
          </button>
        )}
      </div>
    );
  };

  // Render item card
  const renderItemCard = (item, index) => (
    <motion.div
      key={item.id || index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-card rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden"
    >
      <div className="flex">
        {/* Image Section */}
        <div className="w-30 h-30 p-4 flex-shrink-0  relative">
          {item.image_url ? (
           <img
  src={getImageUrl(item.image_url)}
  alt={item.name}
  className="w-full h-full object-cover "
  onError={(e) => {
    e.target.style.display = 'none';
    // Show fallback
    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
  }}
/>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaImage className="w-8 h-8 text-gray-300" />
            </div>
          )}
          {!item.is_available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-l-xl">
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">Out</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-3">
              <h3 className="text-base font-semibold text-primary-800">{item.name}</h3>
              <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                {item.description || 'No description available'}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 ">
                <div className="flex items-center gap-1 text-4 ">
                  {getCategoryIcon(item.category)}
                  <span>{CATEGORY_DISPLAY_NAMES[item.category] || item.category}</span>
                </div>
                
              </div>
              {item.preparation_time && (
                  <span className='text-primary'>⏱️ {item.preparation_time} min</span>
                )}
            </div>

            {/* Price and Dropdown Menu */}
            <div className="flex flex-col items-end gap-2">
              <p className="text-lg font-bold text-primary">${item.price}</p>
              
              {/* Only show dropdown if user has permissions */}
              {showDropdown && (
                <div 
                  className="relative" 
                  ref={el => dropdownRefs.current[item.id] = el}
                >
                  <button
                    onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all border border-gray-200 bg-white shadow-sm"
                  >
                    <FaEllipsisV size={18} />
                  </button>
                  
                  <AnimatePresence>
                    {openDropdown === item.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-8 z-50 w-36 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                      >
                        {renderDropdownMenu(item)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">Menu Management</h1>
            <p className="text-primary-300 text-sm mt-1">
              {isAdmin && "👑 Full Access - Admin"}
              {isManager && "📊 Manage Menu - Manager"}
              {isChef && "👨‍🍳 Update Availability - Kitchen"}
            </p>
          </div>
          {/* Add New Item - Only for Admin and Manager */}
          {canAddItem && (
            <Link
              to="/manager/menu/create"
              className="bg-primary text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-all shadow-sm"
            >
              <FaPlus size={16} /> Add New Item
            </Link>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <button onClick={fetchMenuItems} className="mt-2 text-sm text-red-600 hover:text-red-700 underline">
            Try Again
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Category Filter - In correct order */}
          <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all text-sm font-medium ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All
            </button>
            {CATEGORY_ORDER.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 text-sm font-medium ${
                  selectedCategory === category
                    ? 'bg-card text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {getCategoryIcon(category)}
                <span>{CATEGORY_SHORT_NAMES[category] || category}</span>
              </button>
            ))}
            {/* Search Bar - Moved to left */}
           <div className="flex-1 min-w-[200px]  ml-30">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-xs pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-gray-800 placeholder:text-primary"
              />
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      {loading && menuItems.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-primary text-4xl" />
        </div>
      ) : !Array.isArray(menuItems) || menuItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <FaUtensils className="text-5xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No menu items found</p>
          {canAddItem && (
            <Link to="/manager/menu/create" className="inline-block mt-4 text-primary hover:underline font-medium">
              Add your first menu item →
            </Link>
          )}
        </div>
      ) : groupedItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500">No items match your search</p>
          <button onClick={() => setSearchTerm('')} className="mt-2 text-primary hover:underline">
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedItems.map((group) => (
            <div key={group.category}>
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-200">
                <div className="text-xl">{group.icon}</div>
                <h2 className="text-lg font-semibold text-primary">{group.displayName}</h2>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                  {group.items.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.items.map((item, index) => renderItemCard(item, index))}
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name}
      />
    </div>
  );
};

export default MenuList;