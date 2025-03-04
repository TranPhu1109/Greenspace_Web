import dayjs from 'dayjs';

// Tạo ngày hiện tại và các ngày liên quan
const today = dayjs();
const tomorrow = today.add(1, 'day');
const nextWeek = today.add(7, 'day');

export const designers = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    avatar: 'https://xsgames.co/randomusers/avatar.php?g=male&id=1',
    role: 'Senior Designer',
    experience: 5,
    maxTasksPerDay: 3,
    specialties: ['Nội thất căn hộ', 'Thiết kế văn phòng'],
    rating: 4.8,
    completedProjects: 45,
    isAvailable: false,
    tasks: [
      {
        id: 1,
        title: 'Thiết kế nội thất căn hộ 2PN',
        date: today.format('YYYY-MM-DD'),
        time: '09:00',
        customer: 'Trần Văn B',
        location: 'Q.7, TP.HCM',
        status: 'ongoing',
        notes: 'Phong cách hiện đại, ưu tiên tone màu trắng-xám',
        orderId: 'DES-2024-001'
      },
      {
        id: 2,
        title: 'Tư vấn thiết kế sân vườn',
        date: today.format('YYYY-MM-DD'),
        time: '14:30',
        customer: 'Lê Thị C',
        location: 'Q.2, TP.HCM',
        status: 'pending',
        notes: 'Khách yêu cầu nhiều cây xanh và góc thư giãn',
        orderId: 'DES-2024-002'
      }
    ]
  },
  {
    id: 2,
    name: 'Lê Thị B',
    avatar: 'https://xsgames.co/randomusers/avatar.php?g=female&id=2',
    role: 'Interior Designer',
    experience: 3,
    maxTasksPerDay: 2,
    specialties: ['Nội thất nhà phố', 'Thiết kế quán cafe'],
    rating: 4.5,
    completedProjects: 28,
    isAvailable: true,
    tasks: [
      {
        id: 3,
        title: 'Thiết kế văn phòng công ty',
        date: tomorrow.format('YYYY-MM-DD'),
        time: '10:00',
        customer: 'Công ty TNHH XYZ',
        location: 'Q.1, TP.HCM',
        status: 'completed',
        notes: 'Văn phòng 200m2, phong cách hiện đại',
        orderId: 'DES-2024-003'
      }
    ]
  },
  {
    id: 3,
    name: 'Phạm Văn C',
    avatar: 'https://xsgames.co/randomusers/avatar.php?g=male&id=3',
    role: 'Landscape Designer',
    experience: 4,
    maxTasksPerDay: 2,
    specialties: ['Thiết kế sân vườn', 'Cảnh quan công viên'],
    rating: 4.7,
    completedProjects: 35,
    isAvailable: true,
    tasks: [
      {
        id: 4,
        title: 'Thiết kế nội thất nhà phố',
        date: nextWeek.format('YYYY-MM-DD'),
        time: '08:30',
        customer: 'Nguyễn Thị D',
        location: 'Q.Thủ Đức, TP.HCM',
        status: 'pending',
        notes: 'Nhà 3 tầng, phong cách tối giản',
        orderId: 'DES-2024-004'
      }
    ]
  },
  {
    id: 4,
    name: 'Trần Thị D',
    avatar: 'https://xsgames.co/randomusers/avatar.php?g=female&id=4',
    role: 'Junior Designer',
    experience: 1,
    maxTasksPerDay: 1,
    specialties: ['Nội thất căn hộ'],
    rating: 4.2,
    completedProjects: 12,
    isAvailable: true,
    tasks: []  // Designer mới, chưa có task nào
  },
  {
    id: 5,
    name: 'Hoàng Văn E',
    avatar: 'https://xsgames.co/randomusers/avatar.php?g=male&id=5',
    role: 'Senior Designer',
    experience: 7,
    maxTasksPerDay: 3,
    specialties: ['Thiết kế biệt thự', 'Nội thất cao cấp'],
    rating: 4.9,
    completedProjects: 60,
    isAvailable: false,
    tasks: [
      {
        id: 5,
        title: 'Thiết kế biệt thự nghỉ dưỡng',
        date: today.format('YYYY-MM-DD'),
        time: '08:00',
        customer: 'Công ty ABC',
        location: 'Đà Lạt',
        status: 'ongoing',
        notes: 'Phong cách hiện đại kết hợp mảng xanh',
        orderId: 'DES-2024-005'
      }
    ]
  }
];

export const pendingOrders = [
  {
    id: 1,
    orderNumber: 'DES-2024-001',
    customerName: 'Trần Văn B',
    description: 'Thiết kế nội thất căn hộ 2PN',
    requestDate: today.format('YYYY-MM-DD'),
    location: 'Q.7, TP.HCM',
    budget: '200,000,000 VNĐ',
    requirements: 'Phong cách hiện đại, tone màu trắng-xám',
    status: 'processing',
    area: '70m2',
    projectType: 'Căn hộ',
    priority: 'Cao'
  },
  {
    id: 2,
    orderNumber: 'DES-2024-002',
    customerName: 'Công ty TNHH ABC',
    description: 'Thiết kế showroom',
    requestDate: tomorrow.format('YYYY-MM-DD'),
    location: 'Q.3, TP.HCM',
    budget: '500,000,000 VNĐ',
    requirements: 'Phong cách sang trọng, hiện đại',
    status: 'pending',
    area: '150m2',
    projectType: 'Showroom',
    priority: 'Trung bình'
  },
  {
    id: 3,
    orderNumber: 'DES-2024-003',
    customerName: 'Nguyễn Văn X',
    description: 'Thiết kế quán cafe sân vườn',
    requestDate: nextWeek.format('YYYY-MM-DD'),
    location: 'Q.Thủ Đức, TP.HCM',
    budget: '300,000,000 VNĐ',
    requirements: 'Phong cách tropical, nhiều cây xanh',
    status: 'new',
    area: '200m2',
    projectType: 'Quán cafe',
    priority: 'Thấp'
  }
];

export const taskStatuses = {
  pending: 'Chờ thực hiện',
  ongoing: 'Đang thực hiện',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy'
};

export const designerRoles = {
  'Senior Designer': 'Thiết kế viên cao cấp',
  'Interior Designer': 'Thiết kế nội thất',
  'Landscape Designer': 'Thiết kế cảnh quan',
  'Junior Designer': 'Thiết kế viên mới'
}; 