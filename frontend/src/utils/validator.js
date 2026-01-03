export function validateFields(data = {}, requiredFields = []) {
  for (const field of requiredFields) {
    if (!data[field] || String(data[field]).trim() === "") {
      throw new Error(`${field} is required`);
    }
  }
  return true;
}
