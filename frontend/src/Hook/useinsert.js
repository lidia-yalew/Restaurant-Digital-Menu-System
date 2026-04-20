// Hook/useinsert.js
import { useState } from 'react';

export const useCreate = (serviceFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async (...args) => {
    console.log('useCreate - handleCreate called with args:', args);
    setLoading(true);
    setError(null);
    try {
      // args[0] should be id, args[1] should be data
      const result = await serviceFunction(...args);
      console.log('useCreate - result:', result);
      return result;
    } catch (err) {
      console.error('useCreate - error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { handleCreate, loading, error };
};