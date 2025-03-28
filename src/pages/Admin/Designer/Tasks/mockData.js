import dayjs from 'dayjs';

// Mock data cho chi tiết task
const tasksData = [
  {
    id: '1',
    title: 'Thiết kế nội thất căn hộ 2PN',
    date: dayjs().format('YYYY-MM-DD'),
    time: '09:00',
    customer: 'Nguyễn Văn A',
    phone: '0901234567',
    email: 'nguyenvana@example.com',
    location: 'Q.7, TP.HCM',
    status: 'ongoing',
    description: 'Thiết kế nội thất cho căn hộ 2 phòng ngủ theo phong cách hiện đại',
    requirements: 'Sử dụng tông màu trắng và xám, tối ưu không gian sống, thiết kế thông minh cho gia đình có 1 trẻ nhỏ',
    deadline: dayjs().add(5, 'day').format('YYYY-MM-DD'),
    createdAt: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
    lastUpdated: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    area: '75m2',
    budget: '150.000.000 VNĐ',
    note: 'Khách hàng muốn có một không gian làm việc nhỏ trong phòng khách',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d'
    ],
    history: [
      {
        action: 'Cập nhật tiến độ',
        time: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
        user: 'Designer',
        note: 'Đã hoàn thành 50% thiết kế',
        color: 'blue'
      }
    ]
  },
  {
    id: '2',
    title: 'Thiết kế sân vườn biệt thự',
    date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    time: '14:00',
    customer: 'Trần Thị B',
    phone: '0909876543',
    email: 'tranthib@example.com',
    location: 'Q.2, TP.HCM',
    status: 'pending',
    description: 'Thiết kế sân vườn cho biệt thự với diện tích 200m2',
    requirements: 'Phong cách nhiệt đới, nhiều cây xanh, có hồ cá nhỏ và khu vực BBQ',
    deadline: dayjs().add(10, 'day').format('YYYY-MM-DD'),
    createdAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    lastUpdated: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    area: '200m2',
    budget: '300.000.000 VNĐ',
    images: []
  },
  {
    id: '3',
    title: 'Thiết kế văn phòng công ty',
    date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
    time: '10:30',
    customer: 'Công ty XYZ',
    phone: '02838123456',
    email: 'contact@xyz.com',
    location: 'Q.1, TP.HCM',
    status: 'completed',
    description: 'Thiết kế văn phòng làm việc cho công ty 50 nhân viên',
    requirements: 'Không gian mở, hiện đại, tạo cảm giác thoải mái và sáng tạo',
    deadline: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    createdAt: dayjs().subtract(10, 'day').format('YYYY-MM-DD'),
    lastUpdated: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    area: '500m2',
    budget: '800.000.000 VNĐ',
    note: 'Đã hoàn thành thiết kế và được khách hàng chấp nhận',
    images: [
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36'
    ],
    history: [
      {
        action: 'Hoàn thành thiết kế',
        time: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
        user: 'Designer',
        note: 'Đã hoàn thành và gửi cho khách hàng',
        color: 'green'
      },
      {
        action: 'Cập nhật tiến độ',
        time: dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss'),
        user: 'Designer',
        note: 'Đã hoàn thành 80% thiết kế',
        color: 'blue'
      }
    ]
  },
  {
    id: '4',
    title: 'Thiết kế cảnh quan khu đô thị',
    customer: 'Công ty Bất động sản ABC',
    phone: '02839876543',
    email: 'project@abc.com',
    deadline: dayjs().add(15, 'day').format('YYYY-MM-DD'),
    description: 'Thiết kế cảnh quan cho khu đô thị mới với diện tích 5 hecta',
    requirements: 'Phong cách hiện đại, thân thiện môi trường, tối ưu không gian xanh',
    area: '50000m2',
    budget: '500.000.000 VNĐ',
    location: 'Huyện Nhà Bè, TP.HCM',
    createdAt: dayjs().format('YYYY-MM-DD'),
    status: 'pending',
    images: []
  },
  {
    id: '5',
    title: 'Thiết kế nội thất nhà hàng',
    customer: 'Nhà hàng DEF',
    phone: '02837654321',
    email: 'manager@def.com',
    deadline: dayjs().add(7, 'day').format('YYYY-MM-DD'),
    description: 'Thiết kế nội thất cho nhà hàng ẩm thực Việt Nam',
    requirements: 'Phong cách truyền thống kết hợp hiện đại, tạo không gian ấm cúng',
    area: '300m2',
    budget: '200.000.000 VNĐ',
    location: 'Q.3, TP.HCM',
    createdAt: dayjs().format('YYYY-MM-DD'),
    status: 'pending',
    images: []
  }
];

// Hàm lấy task theo ID
export const getTaskById = (id) => {
  const task = tasksData.find(task => task.id === id);
  if (!task) {
    throw new Error('Task không tồn tại');
  }
  return task;
};

export default tasksData; 