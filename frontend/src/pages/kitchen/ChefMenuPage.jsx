import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaUtensils,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaSync,
  FaSearch,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaHome,
  FaImage,
  FaEdit,
  FaFilter
} from 'react-icons/fa';
import { 
  fetchMenuService, 
  toggleMenuItemAvailabilityService,
  fetchMenuCategoriesService,
  updateMenuService,updatePrepTimeService 
} from '../../service/menuservice';

import { 
  CATEGORY_DISPLAY_NAMES, 
  CATEGORY_SHORT_NAMES,
  CATEGORY_ORDER 
} from '../Manager/Menu/menuConstants.js';
import { useAuth } from '../../config/AuthContext.jsx';

const ChefMenuPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [showOnlyUnavailable, setShowOnlyUnavailable] = useState(false);
  const [editingPrepTime, setEditingPrepTime] = useState(null);
  const [newPrepTime, setNewPrepTime] = useState('');

  // Helper to get image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/uploads')) {
      return `http://localhost:1994${imageUrl}`;
    }
    return imageUrl;
  };

  // Fetch menu items
  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await fetchMenuService({ limit: 100 });
      let items = Array.isArray(response) ? response : (response.data || response.items || []);
      setMenuItems(items);
      applyFilters(items);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = (items = menuItems) => {
    let filtered = [...items];
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }
    
    if (showOnlyUnavailable) {
      filtered = filtered.filter(item => !item.is_available);
    }
    
    setFilteredItems(filtered);
  };

  // Toggle availability
  const handleToggleAvailability = async (itemId, currentStatus) => {
    setUpdatingId(itemId);
    try {
      await toggleMenuItemAvailabilityService(itemId, currentStatus);
      await fetchMenuItems();
    } catch (error) {
      console.error('Error toggling availability:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  


// Update preparation time - Simple version
const handleUpdatePrepTime = async (itemId, newTime) => {
  if (!newTime || newTime < 0) return;
  
  setUpdatingId(itemId);
  try {
    await updatePrepTimeService(itemId, parseInt(newTime));
    await fetchMenuItems();
  } catch (error) {
    console.error('Error updating prep time:', error);
    alert('Failed to update preparation time');
  } finally {
    setUpdatingId(null);
    setEditingPrepTime(null);
    setNewPrepTime('');
  }
};
  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, categoryFilter, showOnlyUnavailable, menuItems]);

  // Get status badge
  const getStatusBadge = (isAvailable) => {
    return isAvailable 
      ? 'bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full'
      : 'bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full';
  };

  // Get preparation time badge color
  const getPrepTimeColor = (minutes) => {
    if (minutes <= 10) return 'bg-green-100 text-green-700';
    if (minutes <= 20) return 'bg-yellow-100 text-yellow-700';
    return 'bg-orange-100 text-orange-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Simple Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/chef')}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaArrowLeft size={18} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">👨‍🍳 Menu Status</h1>
          </div>
          <button 
            onClick={fetchMenuItems}
            className="text-gray-500 hover:text-gray-700"
            title="Refresh"
          >
            <FaSync size={16} />
          </button>
        </div>

        {/* Compact Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm p-3 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter - Compact */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <FaFilter size={12} className="text-gray-500 ml-1" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-sm py-1 px-2 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {CATEGORY_ORDER.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_SHORT_NAMES[cat] || cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Search - Compact */}
            <div className="relative flex-1 max-w-xs">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            {/* Unavailable Toggle - Compact */}
            <button
              onClick={() => setShowOnlyUnavailable(!showOnlyUnavailable)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all ${
                showOnlyUnavailable
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {showOnlyUnavailable ? <FaEye size={12} /> : <FaEyeSlash size={12} />}
              <span>Out of Stock</span>
            </button>

            {/* Summary Badge */}
            <div className="text-xs text-gray-500">
              {filteredItems.length} / {menuItems.length} items
            </div>
          </div>
        </div>

        {/* Compact Items Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-primary text-3xl" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FaUtensils className="text-4xl mx-auto mb-2 opacity-50" />
            <p className="text-sm">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-lg border overflow-hidden hover:shadow-md transition-all ${
                  !item.is_available ? 'opacity-60 bg-gray-50' : ''
                }`}
              >
                {/* Small Image */}
                <div className="relative h-28 bg-gray-100">
                  {item.image_url ? (
                    <img
                      src={getImageUrl(item.image_url)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaImage className="text-gray-300 text-2xl" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={getStatusBadge(item.is_available)}>
                      {item.is_available ? '✅ Available' : '❌ Out'}
                    </span>
                  </div>
                </div>
                
                {/* Content - Compact */}
                <div className="p-3">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-800 text-sm truncate">{item.name}</h3>
                    <span className="text-primary font-bold text-sm">${item.price}</span>
                  </div>
                  
                  {/* Prep Time - Editable */}
                  <div className="mb-2">
                    {editingPrepTime === item.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={newPrepTime}
                          onChange={(e) => setNewPrepTime(e.target.value)}
                          className="w-16 px-1 py-0.5 text-xs border rounded"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdatePrepTime(item.id, newPrepTime)}
                          className="px-1.5 py-0.5 bg-green-500 text-white rounded text-xs"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingPrepTime(null)}
                          className="px-1.5 py-0.5 bg-gray-400 text-white rounded text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => {
                          setEditingPrepTime(item.id);
                          setNewPrepTime(item.preparation_time || 15);
                        }}
                      >
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getPrepTimeColor(item.preparation_time || 15)}`}>
                          <FaClock size={10} />
                          <span>{item.preparation_time || 15} min</span>
                        </div>
                        <FaEdit className="text-gray-400 text-xs" />
                      </div>
                    )}
                  </div>
                  
                  {/* Action Button - Compact */}
                  <button
                    onClick={() => handleToggleAvailability(item.id, item.is_available)}
                    disabled={updatingId === item.id}
                    className={`w-full mt-2 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                      item.is_available
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {updatingId === item.id ? (
                      <FaSpinner className="animate-spin text-sm" />
                    ) : item.is_available ? (
                      <>❌ Mark Out</>
                    ) : (
                      <>✅ Make Available</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Simple Status Bar */}
        <div className="mt-4 text-center text-xs text-gray-400">
          Items marked "Out" are hidden from customers
        </div>
      </div>
    </div>
  );
};

export default ChefMenuPage;