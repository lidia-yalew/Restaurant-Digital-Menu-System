import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  fetchMenuByIdService, 
  updateMenuService, 
  fetchMenuCategoriesService 
} from '../../../service/menuservice';
import { useCreate } from '../../../Hook/useinsert';
import { 
  CATEGORY_DISPLAY_NAMES,
  CATEGORY_ICON_COLORS,
  PREPARATION_TIMES,
  IMAGE_CONFIG
} from './menuConstants';

const EditMenuItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fetching, setFetching] = useState(true);
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

  // Use the existing useCreate hook for update
  const { handleCreate: handleUpdate, loading, error } = useCreate(updateMenuService);

  // Get category icon component
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

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const cats = await fetchMenuCategoriesService();
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch menu item
  const fetchMenuItem = async () => {
    try {
      const item = await fetchMenuByIdService(id);
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price,
        category: item.category,
        image_url: item.image_url || '',
        is_available: item.is_available,
        preparation_time: item.preparation_time || 15
      });
      if (item.image_url) {
        setImagePreview(item.image_url);
      }
    } catch (error) {
      console.error('Error fetching menu item:', error);
      alert('Error loading menu item');
      navigate('/manager/menu');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchMenuItem();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }

    if (file.size > IMAGE_CONFIG.MAX_SIZE_BYTES) {
      alert(`Image size should be less than ${IMAGE_CONFIG.MAX_SIZE_MB}MB`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageFile(file);
    setFormData(prev => ({ ...prev, image_url: previewUrl }));
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageFile(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
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

    try {
      let imageUrl = formData.image_url;
      if (imageFile) {
        imageUrl = await convertToBase64(imageFile);
      }
      
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image_url: imageUrl,
        is_available: formData.is_available,
        preparation_time: parseInt(formData.preparation_time)
      };
      
      await handleUpdate(id, payload);
      alert('Menu item updated successfully!');
      
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      
      navigate('/manager/menu');
    } catch (error) {
      console.error('Error updating item:', error);
      if (!error.message?.includes('handled')) {
        alert(error.message || 'Error updating menu item');
      }
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-primary text-4xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/manager/menu')}
          className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4"
        >
          <FaArrowLeft size={16} /> Back to Menu
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Edit Menu Item</h1>
        <p className="text-gray-500 text-sm mt-1">Update dish information</p>
      </div>

      {/* Display error from hook if any */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              placeholder="e.g., Doro Wot, Tibs, Pizza"
              disabled={loading}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary resize-none"
              placeholder="Describe the dish, ingredients, preparation..."
              disabled={loading}
            />
          </div>

          {/* Price and Category */}
          <div className="grid grid-cols-2 gap-4">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary appearance-none bg-white"
                  disabled={loading}
                >
                  {categories.length > 0 ? (
                    categories.map((cat, index) => (
                      <option key={index} value={cat}>
                        {CATEGORY_DISPLAY_NAMES[cat] || cat}
                      </option>
                    ))
                  ) : (
                    <option value="">Loading categories...</option>
                  )}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {getCategoryIcon(formData.category)}
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Image</label>
            <div className="flex items-start gap-4">
              <div className="relative">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-28 h-28 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
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
                <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <FaCloudUploadAlt className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Choose New Image</span>
                  <input
                    type="file"
                    accept={IMAGE_CONFIG.ALLOWED_TYPES_STRING}
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: {IMAGE_CONFIG.RECOMMENDED_DIMENSIONS}. Max {IMAGE_CONFIG.MAX_SIZE_MB}MB
                </p>
                {formData.image_url && !imageFile && (
                  <p className="text-xs text-green-600 mt-1">Current image preserved</p>
                )}
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary appearance-none bg-white"
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
              className="w-4 h-4 text-primary rounded"
              disabled={loading}
            />
            <label htmlFor="available" className="text-sm text-gray-700">
              Available for ordering (visible to customers)
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/manager/menu')}
            className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 font-medium"
            disabled={loading}
          >
            <FaTimes size={16} /> Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary text-white py-2.5 rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default EditMenuItem;