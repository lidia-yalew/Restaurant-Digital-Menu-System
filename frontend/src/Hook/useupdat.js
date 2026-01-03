import { useState } from "react";

export const useUpdate = (updateFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdate = async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateFunction(id, data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { handleUpdate, loading, error };
};
