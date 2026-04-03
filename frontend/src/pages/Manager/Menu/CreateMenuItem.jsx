import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaSave,
  FaTimes,
  FaSpinner,
  FaArrowLeft,
  FaUtensils,
  FaCoffee,
  FaIceCream,
  FaImage,
  FaBreadSlice,
  FaClock,
  FaFlag,
  FaGlobe,
  FaCloudUploadAlt,
  FaTrash
} from 'react-icons/fa';
import { 
  createMenuItemService, 
  fetchMenuCategoriesService 
} from '../../../service/menuservice';
import { useCreate } from '../../../Hook/useinsert';
import { 
  MENU_CATEGORIES, 
  CATEGORY_DISPLAY_NAMES, 
  PREPARATION_TIMES,
  IMAGE_CONFIG 
} from './menuConstants';

const CreateMenuItem = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    is_available: true,
    preparation_time: 15
  });

  const { handleCreate, loading, error, resetError } = useCreate(createMenuItemService);
  const imageInputRef = useRef(null);

  // Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchMenuCategoriesService();
        
        let cats = [];
        if (Array.isArray(response)) {
          cats = response;
        } else if (response?.data && Array.isArray(response.data)) {
          cats = response.data;
        } else if (response?.categories && Array.isArray(response.categories)) {
          cats = response.categories;
        } else {
          cats = MENU_CATEGORIES;
        }
        
        const categoryNames = cats.map(cat => 
          typeof cat === 'string' ? cat : (cat.category || cat.name || cat)
        );
        
        const uniqueCats = [...new Set(categoryNames)];
        setCategories(uniqueCats);
        
        if (uniqueCats.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: uniqueCats[0] }));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories(MENU_CATEGORIES);
        setFormData(prev => ({ ...prev, category: MENU_CATEGORIES[0] }));
      }
    };
    
    loadCategories();
    
    // Cleanup function for image preview
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Reset error when user starts typing
    if (error) resetError();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
      alert(`Please select a valid image file (${IMAGE_CONFIG.ALLOWED_TYPES.join(', ')})`);
      return;
    }

    if (file.size > IMAGE_CONFIG.MAX_SIZE_BYTES) {
      alert(`Image size should be less than ${IMAGE_CONFIG.MAX_SIZE_MB}MB`);
      return;
    }

    // Clean up old preview
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageFile(file);
    setFormData(prev => ({ ...prev, image_url: previewUrl }));
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageFile(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      alert('Please fill all required fields');
      return;
    }

    if (parseFloat(formData.price) < 0) {
      alert('Price cannot be negative');
      return;
    }

    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await convertToBase64(imageFile);
      }
      
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        image_url: imageUrl,
        is_available: formData.is_available,
        preparation_time: parseInt(formData.preparation_time)
      };
      
      await handleCreate(payload);
      
      alert('Menu item created successfully!');
      handleRemoveImage(); // Clean up preview
      navigate('/manager/menu');
    } catch (error) {
      // Error is already handled by the hook
      console.error('Submission error:', error);
    }
  };

  const getCategoryIcon = useCallback((category) => {
    switch(category) {
      case 'ethiopian_main': return <FaFlag className="text-green-600" />;
      case 'international_main': return <FaGlobe className="text-blue-500" />;
      case 'appetizer': return <FaUtensils className="text-orange-500" />;
      case 'bread': return <FaBreadSlice className="text-yellow-600" />;
      case 'dessert': return <FaIceCream className="text-pink-500" />;
      case 'drink': return <FaCoffee className="text-brown-600" />;
      default: return <FaUtensils className="text-gray-500" />;
    }
  }, []);

  const getCategoryDisplayName = useCallback((category) => {
    return CATEGORY_DISPLAY_NAMES[category] || category;
  }, []);

  if (!Array.isArray(categories)) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-primary text-4xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/manager/menu')}
          className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4 transition-colors"
          disabled={loading}
        >
          <FaArrowLeft size={16} /> Back to Menu
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Create New Menu Item</h1>
        <p className="text-gray-500 text-sm mt-1">Add a new dish to your restaurant menu</p>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
        >
          {error}
        </motion.div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="e.g., Doro Wot, Tibs, Pizza"
              autoFocus
              disabled={loading}
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none transition-colors"
              placeholder="Describe the dish, ingredients, preparation..."
              disabled={loading}
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Price and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="0.00"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none bg-white transition-colors"
                  disabled={loading}
                >
                  {categories.length > 0 ? (
                    categories.map((cat, index) => (
                      <option key={index} value={cat}>
                        {getCategoryDisplayName(cat)}
                      </option>
                    ))
                  ) : (
                    <option value="">Loading categories...</option>
                  )}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                  {getCategoryIcon(formData.category)}
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Image</label>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="relative">
                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-28 h-28 object-cover rounded-lg border border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-md"
                      disabled={loading}
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="w-28 h-28 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <FaImage className="text-3xl text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <FaCloudUploadAlt className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Choose Image</span>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept={IMAGE_CONFIG.ALLOWED_TYPES.join(',')}
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: {IMAGE_CONFIG.RECOMMENDED_DIMENSIONS}. Max {IMAGE_CONFIG.MAX_SIZE_MB}MB. 
                  Formats: {IMAGE_CONFIG.ALLOWED_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ')}
                </p>
              </div>
            </div>
          </div>

          {/* Preparation Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preparation Time</label>
            <div className="relative max-w-[200px]">
              <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                name="preparation_time"
                value={formData.preparation_time}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none bg-white transition-colors"
                disabled={loading}
              >
                {PREPARATION_TIMES.map(min => (
                  <option key={min} value={min}>{min} minutes</option>
                ))}
              </select>
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              name="is_available"
              checked={formData.is_available}
              onChange={handleInputChange}
              id="available"
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
              disabled={loading}
            />
            <label htmlFor="available" className="text-sm text-gray-700 cursor-pointer">
              Available for ordering (visible to customers)
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/manager/menu')}
            className="order-2 sm:order-1 flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 font-medium transition-colors"
            disabled={loading}
          >
            <FaTimes size={16} /> Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="order-1 sm:order-2 flex-1 bg-primary text-white py-2.5 rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {loading ? 'Creating...' : 'Create Item'}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default CreateMenuItem;