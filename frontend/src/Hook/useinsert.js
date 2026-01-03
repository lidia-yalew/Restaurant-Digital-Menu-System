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
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { handleCreate, loading, error };
};
