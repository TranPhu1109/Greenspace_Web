export const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'success';
    case 'ongoing': return 'processing';
    case 'pending': return 'warning';
    case 'cancelled': return 'error';
    default: return 'default';
  }
};

export const getStatusText = (status) => {
  switch (status) {
    case 'completed': return 'Hoàn thành';
    case 'ongoing': return 'Đang thực hiện';
    case 'pending': return 'Chờ thực hiện';
    case 'cancelled': return 'Đã hủy';
    default: return 'Không xác định';
  }
}; 