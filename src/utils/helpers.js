export const generateRandomCode = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const formatPrice = (value) => {
  if (!value && value !== 0) return "0 đ";
  return `${value.toLocaleString("vi-VN")} đ`;
};
