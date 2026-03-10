export const getServerVariables = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    // Chỉ warn cho các biến quan trọng
    if (key === "PET_ECOMMERCE_API") {
      console.warn(`Server variable ${key} is not defined`);
    }
    return "";
  }
  return value;
};
