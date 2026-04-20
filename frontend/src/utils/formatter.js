// utils/formatter.js
export const formatData = (data) => {
  console.log('formatData received:', data);
  
  // Create a new object with all fields
  const formatted = {};
  
  // Copy each field explicitly
  if (data.name !== undefined && data.name !== null) {
    formatted.name = String(data.name).trim();
    console.log('Setting formatted.name to:', formatted.name);
  } else {
    console.warn('data.name is undefined or null!');
  }
  
  if (data.description !== undefined) {
    formatted.description = data.description;
  }
  
  if (data.price !== undefined) {
    formatted.price = Number(data.price);
  }
  
  if (data.category !== undefined) {
    formatted.category = data.category;
  }
  
  if (data.image_url !== undefined) {
    formatted.image_url = data.image_url;
  }
  
  if (data.is_available !== undefined) {
    formatted.is_available = data.is_available;
  }
  
  if (data.preparation_time !== undefined) {
    formatted.preparation_time = Number(data.preparation_time);
  }
  
  console.log('formatData returning:', formatted);
  return formatted;
};