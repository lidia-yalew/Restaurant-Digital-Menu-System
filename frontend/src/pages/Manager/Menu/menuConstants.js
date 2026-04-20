// Menu categories
export const MENU_CATEGORIES = [
  'ethiopian_main',
  'international_main', 
  'appetizer',
  'bread',
  'dessert',
  'drink'
];

export const CATEGORY_DISPLAY_NAMES = {
  ethiopian_main: 'Ethiopian Main Course',
  international_main: 'International Main Course',
  appetizer: 'Appetizer',
  bread: 'Bread',
  dessert: 'Dessert',
  drink: 'Drink'
};

export const CATEGORY_SHORT_NAMES = {
  ethiopian_main: 'Ethiopian',
  international_main: 'International',
  appetizer: 'Appetizer',
  bread: 'Bread',
  dessert: 'Dessert',
  drink: 'Drink'
};

export const CATEGORY_ICONS = {
  ethiopian_main: 'FaFlag',
  international_main: 'FaGlobe',
  appetizer: 'FaUtensils',
  bread: 'FaBreadSlice',
  dessert: 'FaIceCream',
  drink: 'FaCoffee'
};

export const CATEGORY_ICON_COLORS = {
  ethiopian_main: 'text-green-600',
  international_main: 'text-blue-500',
  appetizer: 'text-orange-500',
  bread: 'text-yellow-600',
  dessert: 'text-pink-500',
  drink: 'text-brown-600'
};

export const PREPARATION_TIMES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

export const IMAGE_CONFIG = {
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_TYPES_STRING: 'image/jpeg,image/jpg,image/png,image/gif,image/webp',
  RECOMMENDED_DIMENSIONS: '400x300px'
};

// Category order for display
export const CATEGORY_ORDER = [
  'ethiopian_main',
  'international_main',
  'appetizer',
  'bread',
  'dessert',
  'drink'
];