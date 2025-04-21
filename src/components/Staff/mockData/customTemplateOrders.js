export const customTemplateOrders = [
  // Đơn hàng mới được đặt (pending)
  {
    id: 'CTO-2024-000',
    orderNumber: 'CTO-2024-000', 
    templateName: 'Modern Living Room A1',
    customerInfo: {
      name: 'Đỗ Thị Z',
      phone: '0989012345',
      email: 'dothiz@email.com',
      address: '606 Đường VWX, Quận 9, TP.HCM'
    },
    orderDate: '2024-03-05T10:00:00Z',
    area: 20,
    areaCustom: 40,
    requirements: 'Thiết kế phòng khách và phòng ăn theo phong cách Minimalist. Tôi thích không gian thoáng đãng, màu sắc nhẹ nhàng.',
    attachments: [
      {
        name: 'phong-khach-mau.jpg',
        url: 'https://example.com/reference-living.jpg'
      },
      {
        name: 'y-tuong.pdf',
        url: 'https://example.com/ideas.pdf'
      }
    ],
    customerImages: [
      {
        url: 'https://decoxdesign.com/upload/images/thiet-ke-balcony-01-decox-design.jpg',
        name: 'Ảnh 1'
      },
      {
        url: 'https://decoxdesign.com/upload/images/thiet-ke-balcony-01-decox-design.jpg',
        name: 'Ảnh 1'
      },
      {
        url: 'https://decoxdesign.com/upload/images/thiet-ke-balcony-01-decox-design.jpg',
        name: 'Ảnh 1'
      },
      {
        url: 'https://decoxdesign.com/upload/images/thiet-ke-balcony-01-decox-design.jpg',
        name: 'Ảnh 1'
      },
      {
        url: 'https://decoxdesign.com/upload/images/thiet-ke-balcony-01-decox-design.jpg',
        name: 'Ảnh 1'
      },
      {
        url: 'https://decoxdesign.com/upload/images/thiet-ke-balcony-01-decox-design.jpg',
        name: 'Ảnh 1'
      },
    ],
    selectedMaterials: [
      {
        category: 'Sàn',
        items: [
          {
            name: 'Sàn 1',
            quantity: 1,
            unit: 'm2',
            price: 1000000
          },
          {
            name: 'Sàn 2',
            quantity: 2,
            unit: 'm2',
            price: 2000000
          }
        ]
      }
    ],
    prices: {
      designFee: 6500000,
      totalMaterialCost: 0,
      totalCost: 6500000
    },
    payments: {
      deposit: {
        amount: 4550000,
        status: 'pending'
      },
      final: {
        amount: 1950000,
        status: 'pending'
      }
    },
    status: 'pending',
    consultations: [],
    designs: [],
    timeline: [
      {
        date: '2024-03-05T10:00:00Z',
        status: 'created',
        description: 'Đơn hàng được tạo'
      }
    ],
    designer: 'test'
  },
  
  // Đơn hàng ở trạng thái tư vấn (consulting)
  {
    id: 'CTO-2024-001',
    orderNumber: 'CTO-2024-001',
    templateName: 'Modern Living Room A1',
    customerInfo: {
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      email: 'nguyenvana@email.com',
      address: '123 Đường ABC, Quận 1, TP.HCM'
    },
    orderDate: '2024-03-01T08:00:00Z',
    area: 25,
    requirements: 'Thiết kế phòng khách theo phong cách hiện đại',
    attachments: [
      {
        name: 'reference1.jpg',
        url: 'https://example.com/reference1.jpg'
      }
    ],
    selectedMaterials: [
      {
        category: 'Sàn',
        original: 'Gỗ sồi tự nhiên',
        selected: 'Gỗ óc chó',
        originalPrice: 1200000,
        selectedPrice: 2000000,
        unit: 'm²',
        quantity: 25
      }
    ],
    prices: {
      designFee: 5000000,
      totalMaterialCost: 50000000,
      totalCost: 55000000
    },
    payments: {
      deposit: {
        amount: 38500000,
        status: 'pending'
      },
      final: {
        amount: 16500000,
        status: 'pending'
      }
    },
    status: 'consulting',
    consultations: [
      {
        content: 'Chào anh/chị, tôi đã xem qua yêu cầu của anh/chị...',
        date: '2024-03-01T09:00:00Z',
        sender: 'designer'
      }
    ],
    designs: [],
    timeline: [
      {
        date: '2024-03-01T08:00:00Z',
        status: 'created',
        description: 'Đơn hàng được tạo'
      },
      {
        date: '2024-03-01T09:00:00Z',
        status: 'processing',
        description: 'Bắt đầu tư vấn thiết kế'
      }
    ],
    designer: 'Trần Thị B'
  },
  
  // Đơn hàng ở trạng thái thiết kế (designing)
  {
    id: 'CTO-2024-002',
    orderNumber: 'CTO-2024-002',
    templateName: 'Modern Living Room A1 test1 test2',
    customerInfo: {
      name: 'Lê Thị C',
      phone: '0912345678',
      email: 'lethic@email.com',
      address: '456 Đường XYZ, Quận 2, TP.HCM'
    },
    orderDate: '2024-02-25T10:00:00Z',
    area: 30,
    requirements: 'Thiết kế phòng ngủ master theo phong cách Scandinavian',
    attachments: [],
    selectedMaterials: [],
    prices: {
      designFee: 6000000,
      totalMaterialCost: 60000000,
      totalCost: 66000000
    },
    payments: {
      deposit: {
        amount: 46200000,
        status: 'pending'
      },
      final: {
        amount: 19800000,
        status: 'pending'
      }
    },
    status: 'designing',
    consultations: [],
    designs: [],
    timeline: [
      {
        date: '2024-02-25T10:00:00Z',
        status: 'created',
        description: 'Đơn hàng được tạo'
      },
      {
        date: '2024-02-26T09:00:00Z',
        status: 'designing',
        description: 'Bắt đầu giai đoạn thiết kế'
      }
    ],
    designer: 'Phạm Văn D'
  },
  
  // Đơn hàng ở trạng thái xem xét thiết kế (design_review)
  {
    id: 'CTO-2024-003',
    orderNumber: 'CTO-2024-003',
    customerInfo: {
      name: 'Trần Văn E',
      phone: '0923456789',
      email: 'tranvane@email.com',
      address: '789 Đường DEF, Quận 3, TP.HCM'
    },
    orderDate: '2024-02-20T09:00:00Z',
    area: 35,
    requirements: 'Thiết kế phòng làm việc tại nhà theo phong cách tối giản',
    attachments: [],
    selectedMaterials: [],
    prices: {
      designFee: 5500000,
      totalMaterialCost: 55000000,
      totalCost: 60500000
    },
    payments: {
      deposit: {
        amount: 42350000,
        status: 'pending'
      },
      final: {
        amount: 18150000,
        status: 'pending'
      }
    },
    status: 'design_review',
    consultations: [],
    designs: [
      {
        type: 'draft',
        images: [
          {
            url: 'https://example.com/draft1.jpg',
            name: 'Phác thảo 1'
          }
        ],
        description: 'Bản phác thảo đầu tiên cho phòng làm việc',
        date: '2024-02-22T15:00:00Z'
      },
      {
        type: 'design',
        images: [
          {
            url: 'https://example.com/design1.jpg',
            name: 'Thiết kế 1'
          }
        ],
        description: 'Bản thiết kế chi tiết cho phòng làm việc',
        date: '2024-02-24T16:00:00Z'
      }
    ],
    timeline: [
      {
        date: '2024-02-20T09:00:00Z',
        status: 'created',
        description: 'Đơn hàng được tạo'
      },
      {
        date: '2024-02-21T10:00:00Z',
        status: 'designing',
        description: 'Bắt đầu giai đoạn thiết kế'
      },
      {
        date: '2024-02-24T16:00:00Z',
        status: 'design_review',
        description: 'Gửi bản thiết kế cho khách hàng xem xét'
      }
    ],
    designer: 'Nguyễn Thị F'
  },
  
  // Đơn hàng ở trạng thái chờ đặt cọc (waiting_deposit)
  {
    id: 'CTO-2024-004',
    orderNumber: 'CTO-2024-004',
    customerInfo: {
      name: 'Hoàng Văn G',
      phone: '0934567890',
      email: 'hoangvang@email.com',
      address: '101 Đường GHI, Quận 4, TP.HCM'
    },
    orderDate: '2024-02-15T08:00:00Z',
    area: 45,
    requirements: 'Thiết kế phòng bếp theo phong cách công nghiệp',
    attachments: [],
    selectedMaterials: [],
    prices: {
      designFee: 7000000,
      totalMaterialCost: 70000000,
      totalCost: 77000000
    },
    payments: {
      deposit: {
        amount: 53900000,
        status: 'pending'
      },
      final: {
        amount: 23100000,
        status: 'pending'
      }
    },
    status: 'waiting_deposit',
    consultations: [],
    designs: [],
    timeline: [
      {
        date: '2024-02-15T08:00:00Z',
        status: 'created',
        description: 'Đơn hàng được tạo'
      },
      {
        date: '2024-02-16T09:00:00Z',
        status: 'designing',
        description: 'Bắt đầu giai đoạn thiết kế'
      },
      {
        date: '2024-02-19T16:00:00Z',
        status: 'design_review',
        description: 'Gửi bản thiết kế cho khách hàng xem xét'
      },
      {
        date: '2024-02-20T10:00:00Z',
        status: 'waiting_deposit',
        description: 'Khách hàng đã chấp nhận thiết kế, chờ đặt cọc'
      }
    ],
    designer: 'Lê Văn H'
  },
  
  // Đơn hàng ở trạng thái chọn vật liệu (material_selecting)
  {
    id: 'CTO-2024-005',
    orderNumber: 'CTO-2024-005',
    customerInfo: {
      name: 'Phạm Thị I',
      phone: '0945678901',
      email: 'phamthii@email.com',
      address: '202 Đường JKL, Quận 5, TP.HCM'
    },
    orderDate: '2024-02-10T11:00:00Z',
    area: 40,
    requirements: 'Thiết kế phòng khách và bếp liên thông theo phong cách hiện đại',
    attachments: [],
    selectedMaterials: [
      {
        category: 'Sàn',
        original: 'Gạch ceramic',
        selected: 'Gạch granite',
        originalPrice: 800000,
        selectedPrice: 1500000,
        unit: 'm²',
        quantity: 40
      },
      {
        category: 'Sơn tường',
        original: 'Dulux màu trắng',
        selected: 'Jotun màu be nhạt',
        originalPrice: 150000,
        selectedPrice: 180000,
        unit: 'm²',
        quantity: 120
      }
    ],
    prices: {
      designFee: 7000000,
      totalMaterialCost: 81600000,
      totalCost: 88600000
    },
    payments: {
      deposit: {
        amount: 62020000,
        status: 'paid',
        date: '2024-02-17T14:30:00Z',
        transactionId: 'TXN20240217143022',
        method: 'bank_transfer'
      },
      final: {
        amount: 26580000,
        status: 'pending'
      }
    },
    status: 'material_selecting',
    consultations: [],
    designs: [],
    timeline: [
      {
        date: '2024-02-10T11:00:00Z',
        status: 'created',
        description: 'Đơn hàng được tạo'
      },
      {
        date: '2024-02-16T10:00:00Z',
        status: 'waiting_deposit',
        description: 'Khách hàng đã chấp nhận thiết kế, chờ đặt cọc'
      },
      {
        date: '2024-02-17T14:30:00Z',
        status: 'deposit_paid',
        description: 'Đã xác nhận đặt cọc 62,020,000đ'
      },
      {
        date: '2024-02-17T15:00:00Z',
        status: 'material_selecting',
        description: 'Bắt đầu giai đoạn chọn vật liệu'
      }
    ],
    designer: 'Trần Văn J'
  },
  
  // Đơn hàng ở trạng thái đã đặt vật liệu (material_ordered)
  {
    id: 'CTO-2024-006',
    orderNumber: 'CTO-2024-006',
    customerInfo: {
      name: 'Lý Thị K',
      phone: '0956789012',
      email: 'lythik@email.com',
      address: '303 Đường MNO, Quận 6, TP.HCM'
    },
    orderDate: '2024-02-05T10:00:00Z',
    area: 50,
    requirements: 'Thiết kế phòng khách theo phong cách tân cổ điển',
    attachments: [],
    selectedMaterials: [
      {
        category: 'Sàn',
        original: 'Gỗ công nghiệp',
        selected: 'Gỗ tự nhiên',
        originalPrice: 900000,
        selectedPrice: 2500000,
        unit: 'm²',
        quantity: 50
      },
      {
        category: 'Sơn tường',
        original: 'Dulux màu trắng',
        selected: 'Jotun màu kem',
        originalPrice: 150000,
        selectedPrice: 200000,
        unit: 'm²',
        quantity: 150
      },
      {
        category: 'Sofa',
        original: 'Sofa vải',
        selected: 'Sofa da',
        originalPrice: 15000000,
        selectedPrice: 30000000,
        unit: 'bộ',
        quantity: 1
      }
    ],
    prices: {
      designFee: 8000000,
      totalMaterialCost: 185000000,
      totalCost: 193000000
    },
    payments: {
      deposit: {
        amount: 135100000,
        status: 'paid',
        date: '2024-02-10T14:30:00Z',
        transactionId: 'TXN20240210143022',
        method: 'bank_transfer'
      },
      final: {
        amount: 57900000,
        status: 'pending'
      }
    },
    status: 'material_ordered',
    consultations: [],
    designs: [],
    timeline: [
      {
        date: '2024-02-05T10:00:00Z',
        status: 'created',
        description: 'Đơn hàng được tạo'
      },
      {
        date: '2024-02-10T14:30:00Z',
        status: 'deposit_paid',
        description: 'Đã xác nhận đặt cọc 135,100,000đ'
      },
      {
        date: '2024-02-12T15:00:00Z',
        status: 'material_selecting',
        description: 'Bắt đầu giai đoạn chọn vật liệu'
      },
      {
        date: '2024-02-15T11:00:00Z',
        status: 'material_ordered',
        description: 'Đã đặt vật liệu'
      }
    ],
    designer: 'Nguyễn Văn L'
  },
  
  // Đơn hàng ở trạng thái đang giao hàng (delivering)
  {
    id: 'CTO-2024-007',
    orderNumber: 'CTO-2024-007',
    customerInfo: {
      name: 'Trần Thị M',
      phone: '0967890123',
      email: 'tranthim@email.com',
      address: '404 Đường PQR, Quận 7, TP.HCM'
    },
    orderDate: '2024-01-25T09:00:00Z',
    area: 60,
    requirements: 'Thiết kế phòng khách và phòng ăn theo phong cách Địa Trung Hải',
    attachments: [],
    selectedMaterials: [
      {
        category: 'Sàn',
        original: 'Gạch ceramic',
        selected: 'Gạch Terrazzo',
        originalPrice: 800000,
        selectedPrice: 1800000,
        unit: 'm²',
        quantity: 60
      },
      {
        category: 'Sơn tường',
        original: 'Dulux màu trắng',
        selected: 'Jotun màu xanh biển nhạt',
        originalPrice: 150000,
        selectedPrice: 220000,
        unit: 'm²',
        quantity: 180
      }
    ],
    prices: {
      designFee: 9000000,
      totalMaterialCost: 147600000,
      totalCost: 156600000
    },
    payments: {
      deposit: {
        amount: 109620000,
        status: 'paid',
        date: '2024-01-30T14:30:00Z',
        transactionId: 'TXN20240130143022',
        method: 'bank_transfer'
      },
      final: {
        amount: 46980000,
        status: 'pending'
      }
    },
    status: 'delivering',
    consultations: [],
    designs: [],
    delivery: {
      startTime: '2024-02-20T09:00:00Z',
      trackingCode: 'TRK20240220001',
      estimatedTime: '2024-02-25',
      notes: 'Đang vận chuyển vật liệu đến địa chỉ khách hàng',
      proof: [
        {
          url: 'https://example.com/delivery-proof1.jpg',
          name: 'Ảnh xác nhận vận chuyển 1'
        }
      ]
    },
    timeline: [
      {
        date: '2024-01-25T09:00:00Z',
        status: 'created',
        description: 'Đơn hàng được tạo'
      },
      {
        date: '2024-01-30T14:30:00Z',
        status: 'deposit_paid',
        description: 'Đã xác nhận đặt cọc 109,620,000đ'
      },
      {
        date: '2024-02-10T11:00:00Z',
        status: 'material_ordered',
        description: 'Đã đặt vật liệu'
      },
      {
        date: '2024-02-20T09:00:00Z',
        status: 'delivering',
        description: 'Bắt đầu giao hàng - Mã vận đơn: TRK20240220001'
      }
    ],
    designer: 'Phạm Văn N'
  },
  
  // Đơn hàng ở trạng thái hoàn thành (completed)
  {
    id: 'CTO-2024-008',
    orderNumber: 'CTO-2024-008',
    customerInfo: {
      name: 'Lê Văn O',
      phone: '0978901234',
      email: 'levano@email.com',
      address: '505 Đường STU, Quận 8, TP.HCM'
    },
    orderDate: '2024-01-15T08:00:00Z',
    area: 70,
    requirements: 'Thiết kế toàn bộ căn hộ theo phong cách hiện đại',
    attachments: [],
    selectedMaterials: [
      {
        category: 'Sàn',
        original: 'Gỗ công nghiệp',
        selected: 'Gỗ tự nhiên',
        originalPrice: 900000,
        selectedPrice: 2500000,
        unit: 'm²',
        quantity: 70
      },
      {
        category: 'Sơn tường',
        original: 'Dulux màu trắng',
        selected: 'Jotun màu xám nhạt',
        originalPrice: 150000,
        selectedPrice: 200000,
        unit: 'm²',
        quantity: 200
      }
    ],
    prices: {
      designFee: 12000000,
      totalMaterialCost: 215000000,
      totalCost: 227000000
    },
    payments: {
      deposit: {
        amount: 158900000,
        status: 'paid',
        date: '2024-01-20T14:30:00Z',
        transactionId: 'TXN20240120143022',
        method: 'bank_transfer'
      },
      final: {
        amount: 68100000,
        status: 'paid',
        date: '2024-02-15T15:30:00Z',
        transactionId: 'TXN20240215153022',
        method: 'bank_transfer'
      }
    },
    status: 'completed',
    consultations: [],
    designs: [],
    delivery: {
      startTime: '2024-02-10T09:00:00Z',
      trackingCode: 'TRK20240210001',
      estimatedTime: '2024-02-15',
      notes: 'Đã giao hàng thành công',
      proof: [
        {
          url: 'https://example.com/delivery-proof1.jpg',
          name: 'Ảnh xác nhận giao hàng 1'
        },
        {
          url: 'https://example.com/delivery-proof2.jpg',
          name: 'Ảnh xác nhận giao hàng 2'
        }
      ]
    },
    timeline: [
      {
        date: '2024-01-15T08:00:00Z',
        status: 'created',
        description: 'Đơn hàng được tạo'
      },
      {
        date: '2024-01-20T14:30:00Z',
        status: 'deposit_paid',
        description: 'Đã xác nhận đặt cọc 158,900,000đ'
      },
      {
        date: '2024-02-01T11:00:00Z',
        status: 'material_ordered',
        description: 'Đã đặt vật liệu'
      },
      {
        date: '2024-02-10T09:00:00Z',
        status: 'delivering',
        description: 'Bắt đầu giao hàng - Mã vận đơn: TRK20240210001'
      },
      {
        date: '2024-02-15T15:30:00Z',
        status: 'completed',
        description: 'Đã hoàn tất thanh toán và giao hàng'
      }
    ],
    designer: 'Hoàng Thị P'
  }
]; 