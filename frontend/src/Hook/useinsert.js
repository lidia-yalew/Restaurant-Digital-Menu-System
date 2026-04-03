import { useState } from "react";

export const useCreate = (createServiceFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createServiceFunction(formData);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during creation';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetError = () => setError(null);

  return { handleCreate, loading, error, resetError };
};