// Format price to Vietnamese currency format
export const formatPrice = (price) => {
  // Handle undefined, null, NaN or invalid values
  if (price === undefined || price === null || isNaN(price) || typeof price !== 'number') {
    return 'Chưa xác định';
  }
  
  // Format the price with Vietnamese locale
  return price.toLocaleString("vi-VN") + " VNĐ";
}; 