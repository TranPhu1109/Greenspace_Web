// Work Task Status Mapping (using enum names)
export const WORK_TASK_STATUS = {
  "ConsultingAndSket": { text: "Tư vấn & Phác thảo", color: "#1890ff", bgColor: "#e6f7ff" },
  "DoneConsulting": { text: "Hoàn thành tư vấn", color: "#52c41a", bgColor: "#f6ffed" },
  "Design": { text: "Thiết kế", color: "#722ed1", bgColor: "#f9f0ff" },
  "DoneDesign": { text: "Hoàn thành thiết kế", color: "#52c41a", bgColor: "#f6ffed" },
  "DesignDetail": { text: "Thiết kế chi tiết", color: "#fa8c16", bgColor: "#fff7e6" },
  "DoneDesignDetail": { text: "Hoàn thành thiết kế chi tiết", color: "#52c41a", bgColor: "#f6ffed" },
  "Completed": { text: "Hoàn thành", color: "#52c41a", bgColor: "#f6ffed" },
  "Pending": { text: "Chờ xử lý", color: "#fa8c16", bgColor: "#fffbe6" },      // bg vàng nhạt hơn
  "Installing": { text: "Đang hỗ trợ lắp đặt", color: "#1890ff", bgColor: "#e6f7ff" },
  "DoneInstalling": { text: "Hoàn thành lắp đặt", color: "#52c41a", bgColor: "#f6ffed" },
  "ReInstall": { text: "Làm lại", color: "#fa8c16", bgColor: "#fffbe6" },
  "cancel": { text: "Đã hủy", color: "#ff4d4f", bgColor: "#fff2f0" }
};


// Service Order Status Mapping (using enum names)
export const SERVICE_ORDER_STATUS = {
  "Pending": { text: "Chờ xử lý", color: "#faad14", bgColor: "#fffbe6" }, // vàng cam sáng, bg vàng nhạt
  "ConsultingAndSketching": { text: "Đang tư vấn & phác thảo", color: "#1890ff", bgColor: "#e6f7ff" },
  "DeterminingDesignPrice": { text: "Đang xác định giá thiết kế", color: "#fa8c16", bgColor: "#fff7e6" },
  "DepositSuccessful": { text: "Đặt cọc thành công", color: "#52c41a", bgColor: "#f6ffed" },
  "AssignToDesigner": { text: "Đã giao cho nhà thiết kế", color: "#722ed1", bgColor: "#f9f0ff" },
  "DeterminingMaterialPrice": { text: "Xác định giá vật liệu", color: "#fa8c16", bgColor: "#fff7e6" },
  "DoneDesign": { text: "Hoàn thành thiết kế", color: "#52c41a", bgColor: "#f6ffed" },
  "PaymentSuccess": { text: "Thanh toán thành công", color: "#52c41a", bgColor: "#f6ffed" },
  "Processing": { text: "Đang xử lý", color: "#1890ff", bgColor: "#e6f7ff" },
  "PickedPackageAndDelivery": { text: "Đã lấy hàng & đang giao", color: "#fa8c16", bgColor: "#fffbe6" },
  "DeliveryFail": { text: "Giao hàng thất bại", color: "#ff4d4f", bgColor: "#fff2f0" },
  "ReDelivery": { text: "Giao lại", color: "#fa8c16", bgColor: "#fffbe6" },
  "DeliveredSuccessfully": { text: "Đã giao hàng thành công", color: "#52c41a", bgColor: "#f6ffed" },
  "CompleteOrder": { text: "Hoàn thành đơn hàng", color: "#52c41a", bgColor: "#f6ffed" },
  "OrderCancelled": { text: "Đơn hàng đã bị hủy", color: "#ff4d4f", bgColor: "#fff2f0" },
  "DesignPriceConfirm": { text: "Xác nhận giá thiết kế", color: "#fa8c16", bgColor: "#fff7e6" },
  "Refund": { text: "Hoàn tiền", color: "#ff4d4f", bgColor: "#fff2f0" },
  "DoneRefund": { text: "Đã hoàn tiền", color: "#ff4d4f", bgColor: "#fff2f0" },
  "StopService": { text: "Dừng dịch vụ", color: "#ff4d4f", bgColor: "#fff2f0" },
  "ReConsultingAndSketching": { text: "Phác thảo lại", color: "#1890ff", bgColor: "#e6f7ff" },
  "ReDesign": { text: "Thiết kế lại", color: "#fa8c16", bgColor: "#fffbe6" },
  "WaitDeposit": { text: "Chờ đặt cọc", color: "#faad14", bgColor: "#fffbe6" },
  "DoneDeterminingDesignPrice": { text: "Hoàn thành xác định giá thiết kế", color: "#52c41a", bgColor: "#f6ffed" },
  "DoneDeterminingMaterialPrice": { text: "Hoàn thành xác định giá vật liệu", color: "#52c41a", bgColor: "#f6ffed" },
  "ReDeterminingDesignPrice": { text: "Xác định lại giá thiết kế", color: "#fa8c16", bgColor: "#fff7e6" },
  "ExchangeProdcut": { text: "Đổi sản phẩm", color: "#fa8c16", bgColor: "#fffbe6" },
  "WaitForScheduling": { text: "Chờ lên lịch", color: "#bfbfbf", bgColor: "#fafafa" },
  "Installing": { text: "Đang lắp đặt", color: "#1890ff", bgColor: "#e6f7ff" },
  "DoneInstalling": { text: "Đã lắp đặt xong", color: "#52c41a", bgColor: "#f6ffed" },
  "ReInstall": { text: "Lắp đặt lại", color: "#fa8c16", bgColor: "#fffbe6" },
  "CustomerConfirm": { text: "Khách hàng xác nhận", color: "#722ed1", bgColor: "#f9f0ff" },
  "Successfully": { text: "Thành công", color: "#52c41a", bgColor: "#f6ffed" },
  "ReDetermineMaterialPrice": { text: "Xác định lại giá vật liệu", color: "#fa8c16", bgColor: "#fff7e6" },
  "MaterialPriceConfirmed": { text: "Đã xác nhận giá vật liệu", color: "#52c41a", bgColor: "#f6ffed" }
};


// Get work task status info
export const getWorkTaskStatus = (status) => {
  return WORK_TASK_STATUS[status] || { text: "Không xác định", color: "#d9d9d9", bgColor: "#fafafa" };
};

// Get service order status info
export const getServiceOrderStatus = (status) => {
  return SERVICE_ORDER_STATUS[status] || { text: "Không xác định", color: "#d9d9d9", bgColor: "#fafafa" };
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return "Chưa xác định";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
};

// Format time
export const formatTime = (timeString) => {
  if (!timeString) return "Chưa xác định";
  return timeString.slice(0, 5); // Get HH:MM from HH:MM:SS
};

// Format currency
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "0 VNĐ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(amount);
};
