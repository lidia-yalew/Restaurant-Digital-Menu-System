import { useState } from "react";

export const useDelete = (deleteFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const result = await deleteFunction(id);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return { handleDelete, loading, error };
};
