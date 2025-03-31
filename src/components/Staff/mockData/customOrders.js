export const customOrders = [
  {
    id: '1',
    orderNumber: 'CUST-2024-001',
    projectType: 'Căn hộ',
    requirements: {
      style: 'Minimalist',
      mainColors: ['Trắng', 'Gỗ tự nhiên'],
      specialRequirements: 'Tối ưu không gian cho gia đình có trẻ nhỏ'
    },
    customerName: 'Phạm Văn D',
    customerPhone: '0912345678',
    customerEmail: 'phamvand@email.com',
    orderDate: '2024-03-03',
    area: 75,
    totalPrice: 15000000,
    depositAmount: 5000000,
    status: 'consulting',
    payment: {
      status: 'pending',
      amount: 0,
      total: 15000000
    },
    notes: 'Cần tư vấn chi tiết về phong cách thiết kế',
    designer: null,
    referenceImages: [
      'url1.jpg',
      'url2.jpg'
    ]
  },
  // Thêm các mẫu dữ liệu khác...
]; 