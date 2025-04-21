export const newDesignOrders = [
  // Đơn hàng mới đang chờ xử lý
  {
    id: 'NDO-2024-001',
    orderNumber: 'NDO-2024-001',
    customerInfo: {
      name: 'Nguyễn Thị A',
      phone: '0901234567',
      email: 'nguyenthia@email.com',
      address: '123 Đường ABC, Quận 1, TP.HCM'
    },
    orderDate: '2024-03-10T08:00:00Z',
    requirements: 'sdadasdasdadadasd adasdadasdasdad ád ád ádasdsad Tôi muốn thiết kế phòng khách theo phong cách hiện đại, tối giản. Diện tích khoảng 25m2, tôi thích tông màu trắng và xám.',
    dimensions: {
      width: 5,
      length: 5,
      height: 3,
      area: 25
    },
    attachments: [
      {
        name: 'phong-khach-mau-1.jpg',
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7'
      },
      {
        name: 'phong-khach-mau-2.jpg',
        url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d'
      }
    ],
    status: 'pending',
    budget: 50000000,
    timeline: [
      {
        date: '2024-03-10T08:00:00Z',
        status: 'created',
        description: 'Đơn hàng được tạo'
      }
    ],
    materialSuggestions: [
      {
        id: 1,
        category: 'Sàn',
        name: 'Gỗ sồi tự nhiên',
        price: 1200000,
        unit: 'm²',
        image: 'https://images.unsplash.com/photo-1622637150470-1bdda73d2b3f',
        status: 'recommended',
        description: 'Gỗ sồi tự nhiên cao cấp, độ bền cao, phù hợp với phong cách hiện đại'
      },
      {
        id: 2,
        category: 'Sàn',
        name: 'Gỗ óc chó',
        price: 2000000,
        unit: 'm²',
        image: 'https://images.unsplash.com/photo-1609529316333-a90cc6a7a4a2',
        status: 'alternative',
        description: 'Gỗ óc chó cao cấp, màu sắc đậm hơn, phù hợp với không gian sang trọng'
      },
      {
        id: 3,
        category: 'Sơn tường',
        name: 'Dulux màu trắng ngà',
        price: 250000,
        unit: 'thùng',
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f',
        status: 'recommended',
        description: 'Sơn cao cấp, dễ lau chùi, màu trắng ngà tạo cảm giác ấm áp'
      },
      {
        id: 4,
        category: 'Sơn tường',
        name: 'Jotun màu xám nhạt',
        price: 300000,
        unit: 'thùng',
        image: 'https://images.unsplash.com/photo-1580462611434-b10926e2d15e',
        status: 'alternative',
        description: 'Sơn nhập khẩu, độ bền cao, màu xám nhạt hiện đại'
      },
      {
        id: 5,
        category: 'Đèn',
        name: 'Đèn trần LED',
        price: 1500000,
        unit: 'bộ',
        image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89',
        status: 'recommended',
        description: 'Đèn LED tiết kiệm điện, ánh sáng trắng, phù hợp với phong cách hiện đại'
      }
    ]
  },
  
  // Đơn hàng đã được chấp nhận và đang trong quá trình thiết kế
  {
    id: 'NDO-2024-002',
    orderNumber: 'NDO-2024-002',
    customerInfo: {
      name: 'Trần Văn B',
      phone: '0912345678',
      email: 'tranvanb@email.com',
      address: '456 Đường XYZ, Quận 2, TP.HCM'
    },
    orderDate: '2024-03-08T10:00:00Z',
    requirements: 'Thiết kế phòng ngủ master theo phong cách Scandinavian. Tôi thích màu pastel và gỗ sáng màu.',
    dimensions: {
      width: 4,
      length: 5,
      height: 3,
      area: 20
    },
    attachments: [
      {
        name: 'phong-ngu-mau.jpg',
        url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0'
      }
    ],
    status: 'accepted',
    budget: 40000000,
    designer: 'Lê Thị C',
    timeline: [
      {
        date: '2024-03-08T10:00:00Z',
        status: 'created',
        description: 'Đơn hàng được tạo'
      },
      {
        date: '2024-03-09T14:00:00Z',
        status: 'accepted',
        description: 'Đơn hàng được chấp nhận'
      },
      {
        date: '2024-03-10T09:00:00Z',
        status: 'designing',
        description: 'Bắt đầu thiết kế'
      }
    ],
    materialSuggestions: [
      {
        id: 6,
        category: 'Sàn',
        name: 'Gỗ thông',
        price: 800000,
        unit: 'm²',
        image: 'https://images.unsplash.com/photo-1594293836768-3ce0217ee9c3',
        status: 'recommended',
        description: 'Gỗ thông sáng màu, phù hợp với phong cách Scandinavian'
      },
      {
        id: 7,
        category: 'Sơn tường',
        name: 'Dulux màu xanh pastel',
        price: 280000,
        unit: 'thùng',
        image: 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8',
        status: 'recommended',
        description: 'Màu xanh pastel nhẹ nhàng, tạo cảm giác thư giãn'
      },
      {
        id: 8,
        category: 'Nội thất',
        name: 'Giường gỗ sồi',
        price: 8000000,
        unit: 'chiếc',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85',
        status: 'recommended',
        description: 'Giường gỗ sồi thiết kế đơn giản, phù hợp phong cách Scandinavian'
      }
    ]
  },
  
  // Đơn hàng đã bị từ chối
  {
    id: 'NDO-2024-003',
    orderNumber: 'NDO-2024-003',
    customerInfo: {
      name: 'Phạm Văn C',
      phone: '0923456789',
      email: 'phamvanc@email.com',
      address: '789 Đường DEF, Quận 3, TP.HCM'
    },
    orderDate: '2024-03-05T14:00:00Z',
    requirements: 'Thiết kế phòng bếp theo phong cách công nghiệp. Tôi muốn sử dụng nhiều kim loại và bê tông.',
    dimensions: {
      width: 3,
      length: 4,
      height: 3,
      area: 12
    },
    attachments: [],
    status: 'rejected',
    budget: 30000000,
    rejectionReason: 'Yêu cầu thiết kế không đủ chi tiết. Vui lòng cung cấp thêm thông tin về kích thước cụ thể và hình ảnh tham khảo.',
    timeline: [
      {
        date: '2024-03-05T14:00:00Z',
        status: 'created',
        description: 'Đơn hàng được tạo'
      },
      {
        date: '2024-03-06T10:00:00Z',
        status: 'rejected',
        description: 'Đơn hàng bị từ chối: Yêu cầu thiết kế không đủ chi tiết. Vui lòng cung cấp thêm thông tin về kích thước cụ thể và hình ảnh tham khảo.'
      }
    ]
  },
  // Thêm đơn hàng mới
  {
    id: 'NDO-2024-004',
    orderNumber: 'NDO-2024-004',
    customerInfo: {
      name: 'Hoàng Thị D',
      phone: '0934567890',
      email: 'hoangthid@email.com',
      address: '101 Đường GHI, Quận 7, TP.HCM'
    },
    orderDate: '2024-03-12T09:30:00Z',
    requirements: 'Thiết kế phòng làm việc tại nhà theo phong cách tối giản. Tôi cần nhiều không gian lưu trữ và ánh sáng tự nhiên.',
    dimensions: {
      width: 3.5,
      length: 4,
      height: 3,
      area: 14
    },
    attachments: [
      {
        name: 'phong-lam-viec-mau.jpg',
        url: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705'
      }
    ],
    status: 'pending',
    budget: 35000000,
    timeline: [
      {
        date: '2024-03-12T09:30:00Z',
        status: 'created',
        description: 'Đơn hàng được tạo'
      }
    ],
    materialSuggestions: [
      {
        id: 9,
        category: 'Bàn làm việc',
        name: 'Bàn gỗ công nghiệp',
        price: 3500000,
        unit: 'chiếc',
        image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd',
        status: 'recommended',
        description: 'Bàn làm việc rộng rãi, thiết kế tối giản'
      },
      {
        id: 10,
        category: 'Kệ sách',
        name: 'Kệ sách treo tường',
        price: 2500000,
        unit: 'bộ',
        image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156',
        status: 'recommended',
        description: 'Kệ sách treo tường tiết kiệm không gian, thiết kế hiện đại'
      }
    ]
  },
  {
    id: 'NDO-2024-005',
    orderNumber: 'NDO-2024-005',
    customerInfo: {
      name: 'Lê Minh E',
      phone: '0945678901',
      email: 'leminhe@email.com',
      address: '202 Đường JKL, Quận 9, TP.HCM'
    },
    orderDate: '2024-03-11T15:45:00Z',
    requirements: 'Thiết kế phòng khách và bếp liên thông theo phong cách Địa Trung Hải. Tôi thích màu xanh dương và trắng.',
    dimensions: {
      width: 6,
      length: 8,
      height: 3.2,
      area: 48
    },
    attachments: [
      {
        name: 'phong-khach-mau.jpg',
        url: 'https://images.unsplash.com/photo-1600210492493-0946911123ea'
      },
      {
        name: 'bep-mau.jpg',
        url: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1'
      }
    ],
    status: 'accepted',
    budget: 80000000,
    designer: 'Nguyễn Văn F',
    timeline: [
      {
        date: '2024-03-11T15:45:00Z',
        status: 'created',
        description: 'Đơn hàng được tạo'
      },
      {
        date: '2024-03-12T10:30:00Z',
        status: 'accepted',
        description: 'Đơn hàng được chấp nhận'
      }
    ],
    materialSuggestions: [
      {
        id: 11,
        category: 'Gạch lát',
        name: 'Gạch Terracotta',
        price: 450000,
        unit: 'm²',
        image: 'https://images.unsplash.com/photo-1581430872221-d2a64d53f91d',
        status: 'recommended',
        description: 'Gạch Terracotta truyền thống, phù hợp với phong cách Địa Trung Hải'
      },
      {
        id: 12,
        category: 'Sơn tường',
        name: 'Sơn màu xanh Santorini',
        price: 320000,
        unit: 'thùng',
        image: 'https://images.unsplash.com/photo-1576095910326-9de5a8b5b91a',
        status: 'recommended',
        description: 'Màu xanh đặc trưng của phong cách Địa Trung Hải'
      },
      {
        id: 13,
        category: 'Đồ nội thất',
        name: 'Sofa vải lanh',
        price: 12000000,
        unit: 'bộ',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
        status: 'recommended',
        description: 'Sofa vải lanh màu trắng ngà, phù hợp với phong cách Địa Trung Hải'
      }
    ]
  }
];

// Hàm trợ giúp để lấy đơn hàng theo ID
export const getNewDesignOrderById = (id) => {
  return newDesignOrders.find(order => order.id === id);
};

// Hàm trợ giúp để lọc đơn hàng theo trạng thái
export const filterNewDesignOrdersByStatus = (status) => {
  if (status === 'all') return newDesignOrders;
  return newDesignOrders.filter(order => order.status === status);
};

// Các trạng thái đơn hàng
export const orderStatusConfig = {
  pending: {
    label: 'Chờ xử lý',
    color: 'gold'
  },
  accepted: {
    label: 'Đã chấp nhận',
    color: 'blue'
  },
  designing: {
    label: 'Đang thiết kế',
    color: 'processing'
  },
  completed: {
    label: 'Hoàn thành',
    color: 'success'
  },
  rejected: {
    label: 'Từ chối',
    color: 'error'
  }
}; 