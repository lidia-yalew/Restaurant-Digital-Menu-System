// Trim all string fields
export function formatData(data = {}) {
  const cleaned = {};

  for (const key in data) {
    const value = data[key];

    cleaned[key] = typeof value === "string" ? value.trim() : value;
  }

  return cleaned;
}
