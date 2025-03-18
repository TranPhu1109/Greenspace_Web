import dayjs from 'dayjs';

// Mock data cho các task của designer
export const designerTasks = [
  {
    id: '1',
    title: 'Thiết kế nội thất căn hộ 2PN',
    date: dayjs().format('YYYY-MM-DD'),
    time: '09:00',
    customer: 'Nguyễn Văn A',
    location: 'Q.7, TP.HCM',
    status: 'ongoing',
    description: 'Thiết kế nội thất cho căn hộ 2 phòng ngủ theo phong cách hiện đại',
    requirements: 'Sử dụng tông màu trắng và xám, tối ưu không gian sống, thiết kế thông minh cho gia đình có 1 trẻ nhỏ',
    deadline: dayjs().add(5, 'day').format('YYYY-MM-DD'),
    createdAt: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
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
    location: 'Q.2, TP.HCM',
    status: 'pending',
    description: 'Thiết kế sân vườn cho biệt thự với diện tích 200m2',
    requirements: 'Phong cách nhiệt đới, nhiều cây xanh, có hồ cá nhỏ và khu vực BBQ',
    deadline: dayjs().add(10, 'day').format('YYYY-MM-DD'),
    createdAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    images: []
  },
  {
    id: '3',
    title: 'Thiết kế văn phòng công ty',
    date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
    time: '10:30',
    customer: 'Công ty XYZ',
    location: 'Q.1, TP.HCM',
    status: 'completed',
    description: 'Thiết kế văn phòng làm việc cho công ty 50 nhân viên',
    requirements: 'Không gian mở, hiện đại, tạo cảm giác thoải mái và sáng tạo',
    deadline: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    createdAt: dayjs().subtract(10, 'day').format('YYYY-MM-DD'),
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
    title: 'Thiết kế nội thất căn hộ 2PN',
    date: dayjs().format('YYYY-MM-DD'),
    time: '09:00',
    customer: 'Nguyễn Văn A',
    location: 'Q.7, TP.HCM',
    status: 'ongoing',
    description: 'Thiết kế nội thất cho căn hộ 2 phòng ngủ theo phong cách hiện đại',
    requirements: 'Sử dụng tông màu trắng và xám, tối ưu không gian sống, thiết kế thông minh cho gia đình có 1 trẻ nhỏ',
    deadline: dayjs().add(5, 'day').format('YYYY-MM-DD'),
    createdAt: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
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
    id: '5',
    title: 'Thiết kế sân vườn biệt thự',
    date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    time: '14:00',
    customer: 'Trần Thị B',
    location: 'Q.2, TP.HCM',
    status: 'pending',
    description: 'Thiết kế sân vườn cho biệt thự với diện tích 200m2',
    requirements: 'Phong cách nhiệt đới, nhiều cây xanh, có hồ cá nhỏ và khu vực BBQ',
    deadline: dayjs().add(10, 'day').format('YYYY-MM-DD'),
    createdAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    images: []
  },
  {
    id: '6',
    title: 'Thiết kế văn phòng công ty',
    date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
    time: '10:30',
    customer: 'Công ty XYZ',
    location: 'Q.1, TP.HCM',
    status: 'completed',
    description: 'Thiết kế văn phòng làm việc cho công ty 50 nhân viên',
    requirements: 'Không gian mở, hiện đại, tạo cảm giác thoải mái và sáng tạo',
    deadline: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    createdAt: dayjs().subtract(10, 'day').format('YYYY-MM-DD'),
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
  }
];

// Mock data cho các task đang chờ xác nhận
export const pendingTasks = [
  {
    id: '4',
    title: 'Thiết kế cảnh quan khu đô thị',
    customer: 'Công ty Bất động sản ABC',
    deadline: dayjs().add(15, 'day').format('YYYY-MM-DD'),
    description: 'Thiết kế cảnh quan cho khu đô thị mới với diện tích 5 hecta',
    requirements: 'Phong cách hiện đại, thân thiện môi trường, tối ưu không gian xanh',
    area: '50000m2',
    budget: '500.000.000 VNĐ',
    location: 'Huyện Nhà Bè, TP.HCM'
  },
  {
    id: '5',
    title: 'Thiết kế nội thất nhà hàng',
    customer: 'Nhà hàng DEF',
    deadline: dayjs().add(7, 'day').format('YYYY-MM-DD'),
    description: 'Thiết kế nội thất cho nhà hàng ẩm thực Việt Nam',
    requirements: 'Phong cách truyền thống kết hợp hiện đại, tạo không gian ấm cúng',
    area: '300m2',
    budget: '200.000.000 VNĐ',
    location: 'Q.3, TP.HCM'
  }
]; 