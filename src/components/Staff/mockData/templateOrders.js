export const templateOrders = [
  {
    id: '1',
    orderNumber: 'TEMP-2024-001',
    templateName: 'Modern Living Room A1',
    templateId: 'T001',
    customerInfo: {
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      email: 'nguyenvana@email.com',
      address: '123 Đường ABC, Quận 1, TP.HCM'
    },
    orderDate: '2024-03-01',
    area: 25,
    selectedMaterials: [
      {
        category: 'Sàn',
        original: 'Gỗ sồi tự nhiên',
        selected: 'Gỗ óc chó',
        originalPrice: 1200000,
        selectedPrice: 2000000,
        unit: 'm²',
        quantity: 25
      },
      {
        category: 'Sơn tường',
        original: 'Dulux màu trắng ngà',
        selected: 'Jotun màu be',
        originalPrice: 150000,
        selectedPrice: 180000,
        unit: 'm²',
        quantity: 100
      }
    ],
    prices: {
      designFee: 5000000,  // Phí thiết kế
      totalMaterialCost: 48000000,  // Tổng chi phí vật liệu sau điều chỉnh
      totalCost: 53000000  // Tổng chi phí (thiết kế + vật liệu)
    },
    payments: {
      deposit: {  // Đặt cọc 50%
        amount: 26500000,
        status: 'paid',
        date: '2024-03-01'
      },
      final: {  // Thanh toán còn lại
        amount: 26500000,
        status: 'pending',
        date: null
      }
    },
    status: 'processing',
    timeline: [
      {
        date: '2024-03-01',
        status: 'created',
        description: 'Đơn hàng được tạo'
      },
      {
        date: '2024-03-01',
        status: 'deposit_paid',
        description: 'Đã thanh toán đặt cọc 50%'
      }
    ],
    designer: 'Trần Thị B',
    notes: 'Khách hàng muốn xem thêm mẫu gỗ óc chó',
    expectedCompletionDate: '2024-04-01'
  },
  // Thêm các mẫu dữ liệu khác...
  {
    id: '2',
    orderNumber: 'TEMP-2024-002',
    templateName: 'Modern Living Room A2',
    templateId: 'T002',
    customerInfo: {
      name: 'Trần Văn B',
      phone: '0902345678',
      email: 'tranvanb@email.com',
      address: '456 Đường DEF, Quận 2, TP.HCM'
    },
    orderDate: '2024-03-02',
    area: 30,
    selectedMaterials: [
      {
        category: 'Sàn',
        original: 'Gỗ sồi tự nhiên',
        selected: 'Gỗ óc chó',
        originalPrice: 1200000,
        selectedPrice: 2000000,
        unit: 'm²',
        quantity: 30
      },
      {
        category: 'Sơn tường',
        original: 'Dulux màu trắng ngà',
        selected: 'Jotun màu be',
        originalPrice: 150000,
        selectedPrice: 180000,
        unit: 'm²',
        quantity: 120
      }
    ],
    prices: {
      designFee: 6000000,
      totalMaterialCost: 54000000,
      totalCost: 60000000
    },
    payments: {
      deposit: {
        amount: 30000000,
        status: 'paid',
        date: '2024-03-02'
      },
      final: {
        amount: 30000000,
        status: 'pending',
        date: null
      }
    },
    status: 'processing',
    timeline: [
      {
        date: '2024-03-02',
        status: 'created',
        description: 'Đơn hàng được tạo'
      },
      {
        date: '2024-03-02',
        status: 'deposit_paid',
        description: 'Đã thanh toán đặt cọc 50%'
      }
    ],
    designer: 'Lê Thị C',
    notes: 'Khách hàng muốn xem thêm mẫu gỗ óc chó',
    expectedCompletionDate: '2024-04-02'
  },
  {
    id: '3',
    orderNumber: 'TEMP-2024-003',
    templateName: 'Modern Kitchen A3',
    templateId: 'T003',
    customerInfo: {
      name: 'Phạm Thị D',
      phone: '0903456789',
      email: 'phamthid@email.com',
      address: '789 Đường GHI, Quận 3, TP.HCM'
    },
    orderDate: '2024-03-03',
    area: 40,
    selectedMaterials: [
      {
        category: 'Sàn',
        original: 'Gỗ sồi tự nhiên',
        selected: 'Gỗ óc chó',
        originalPrice: 1200000,
        selectedPrice: 2000000,
        unit: 'm²',
        quantity: 40
      },
      {
        category: 'Sơn tường',
        original: 'Dulux màu trắng ngà',
        selected: 'Jotun màu be',
        originalPrice: 150000,
        selectedPrice: 180000,
        unit: 'm²',
        quantity: 150
      }
    ],
    prices: {
      designFee: 7000000,
      totalMaterialCost: 63000000,
      totalCost: 70000000
    },
    payments: {
      deposit: {
        amount: 35000000,
        status: 'paid',
        date: '2024-03-03'
      },
      final: {
        amount: 35000000,
        status: 'paid',
        date: '2024-03-05'
      }
    },  
    status: 'completed',
    designer: 'Nguyễn Văn E',
    notes: 'Khách hàng muốn xem thêm mẫu gỗ óc chó',
    expectedCompletionDate: '2024-04-03'
  },
  {
    id: '4',
    orderNumber: 'TEMP-2024-004',
    templateName: 'Modern Living Room A4',
    templateId: 'T004',
    customerInfo: {
      name: 'Nguyễn Văn F',
      phone: '0904567890',
      email: 'nguyenvanf@email.com',
      address: '123 Đường GHI, Quận 4, TP.HCM'
    },
    orderDate: '2024-03-04',
    area: 30,
    selectedMaterials: [
      {
        category: 'Sàn',
        original: 'Gỗ sồi tự nhiên',
        selected: 'Gỗ óc chó',
        originalPrice: 1200000,
        selectedPrice: 2000000,
        unit: 'm²',
        quantity: 30
      },
      {
        category: 'Sơn tường',
        original: 'Dulux màu trắng ngà',
        selected: 'Jotun màu be',
        originalPrice: 150000,
        selectedPrice: 180000,
        unit: 'm²',
        quantity: 120
      }
    ],
    prices: {
      designFee: 6000000,
      totalMaterialCost: 54000000,
      totalCost: 60000000
    },
    payments: {
      deposit: {
        amount: 30000000,
        status: 'paid',
        date: '2024-03-02'
      },
      final: {
        amount: 30000000,
        status: 'pending',
        date: null
      }
    },
    status: 'pending',
    timeline: [
      {
        date: '2024-03-02',
        status: 'created',
        description: 'Đơn hàng được tạo'
      },
      {
        date: '2024-03-02',
        status: 'deposit_paid',
        description: 'Đã thanh toán đặt cọc 50%'
      }
    ],
    designer: 'Lê Thị C',
    notes: 'Khách hàng muốn xem thêm mẫu gỗ óc chó',
    expectedCompletionDate: '2024-04-02'
  },
];

    

// Trạng thái có thể của đơn hàng
export const orderStatuses = {
  pending: {
    label: 'Chờ xử lý',
    color: 'default',
    icon: 'ClockCircleOutlined'
  },
  processing: {
    label: 'Đang xử lý',
    color: 'processing',
    icon: 'SyncOutlined'
  },
  consulting: {
    label: 'Đang tư vấn',
    color: 'warning',
    icon: 'MessageOutlined'
  },
  designing: {
    label: 'Đang thiết kế',
    color: 'processing',
    icon: 'EditOutlined'
  },
  design_review: {
    label: 'Chờ duyệt thiết kế',
    color: 'warning',
    icon: 'EyeOutlined'
  },
  waiting_deposit: {
    label: 'Chờ đặt cọc',
    color: 'warning',
    icon: 'DollarOutlined'
  },
  material_selecting: {
    label: 'Đang chọn vật liệu',
    color: 'processing',
    icon: 'ShoppingOutlined'
  },
  material_ordered: {
    label: 'Đã đặt vật liệu',
    color: 'success',
    icon: 'CheckCircleOutlined'
  },
  delivering: {
    label: 'Đang giao vật liệu',
    color: 'processing',
    icon: 'CarOutlined'
  },
  completed: {
    label: 'Hoàn thành',
    color: 'success',
    icon: 'CheckCircleOutlined'
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'error',
    icon: 'CloseCircleOutlined'
  }
};

// Thêm trạng thái thanh toán
export const paymentStatuses = {
  pending: {
    label: 'Chờ thanh toán',
    color: 'default'
  },
  partial: {
    label: 'Đã đặt cọc',
    color: 'warning'
  },
  completed: {
    label: 'Đã thanh toán',
    color: 'success'
  },
  refunded: {
    label: 'Đã hoàn tiền',
    color: 'error'
  }
};

// Thêm loại thanh toán
export const paymentTypes = {
  deposit: {
    label: 'Đặt cọc',
    amount: 0.7 // 70%
  },
  final: {
    label: 'Thanh toán cuối',
    amount: 0.3 // 30%
  }
};

// Danh sách vật liệu có thể tùy chỉnh
export const customizableMaterials = {
  floor: {
    name: 'Sàn',
    options: [
      {
        name: 'Gỗ sồi tự nhiên',
        price: 1200000,
        unit: 'm²'
      },
      {
        name: 'Gỗ óc chó',
        price: 2000000,
        unit: 'm²'
      },
      {
        name: 'Gỗ teak',
        price: 1800000,
        unit: 'm²'
      }
    ]
  },
  wall_paint: {
    name: 'Sơn tường',
    options: [
      {
        name: 'Dulux màu trắng ngà',
        price: 150000,
        unit: 'm²'
      },
      {
        name: 'Jotun màu be',
        price: 180000,
        unit: 'm²'
      }
    ]
  }
  // Thêm các loại vật liệu khác...
};

export const templateOrder = {
  id: 'string',
  orderNumber: 'string',
  templateName: 'string',
  templateId: 'string',
  customerInfo: {
    name: 'string',
    phone: 'string',
    email: 'string',
    address: 'string'
  },
  orderDate: 'date',
  area: 'number',
  selectedMaterials: [
    {
      category: 'string',
      original: 'string',
      selected: 'string',
      originalPrice: 'number',
      selectedPrice: 'number',
      unit: 'string',
      quantity: 'number'
    }
  ],
  prices: {
    designFee: 'number',
    totalMaterialCost: 'number',
    totalCost: 'number'
  },
  payments: {
    deposit: {
      amount: 'number',
      status: 'paid | pending',
      date: 'date | null'
    },
    final: {
      amount: 'number', 
      status: 'paid | pending',
      date: 'date | null'
    }
  },
  status: 'string',
  timeline: [
    {
      date: 'date',
      status: 'string',
      description: 'string'
    }
  ],
  designer: 'string',
  notes: 'string',
  expectedCompletionDate: 'date'
}; 