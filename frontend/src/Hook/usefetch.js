import { useEffect, useState } from "react";

export default function useFetch(apiCallback) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCallback();
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  },);

  return { data, loading, error, reload };
}
