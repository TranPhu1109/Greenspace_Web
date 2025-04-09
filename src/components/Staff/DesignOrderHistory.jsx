const getStatusDisplay = (status) => {
  const statusMap = {
    Pending: "Chờ xử lý",
    ConsultingAndSketching: "Đang tư vấn & phác thảo",
    DeterminingDesignPrice: "Đang xác định giá",
    DepositSuccessful: "Đặt cọc thành công",
    AssignToDesigner: "Đã giao cho nhà thiết kế",
    DeterminingMaterialPrice: "Xác định giá vật liệu",
    DoneDesign: "Hoàn thành thiết kế",
    PaymentSuccess: "Thanh toán thành công",
    Processing: "Đang xử lý",
    PickedPackageAndDelivery: "Đã lấy hàng & đang giao",
    DeliveryFail: "Giao hàng thất bại",
    ReDelivery: "Giao lại",
    DeliveredSuccessfully: "Đã giao hàng thành công",
    CompleteOrder: "Hoàn thành đơn hàng",
    OrderCancelled: "Đơn hàng đã bị hủy",
    Warning: "Cảnh báo vượt 30%",
    Refund: "Hoàn tiền",
    DoneRefund: "Đã hoàn tiền"
  };
  return statusMap[status] || status;
};

const getStatusColor = (status) => {
  const colorMap = {
    Pending: "gold",
    ConsultingAndSketching: "blue",
    DeterminingDesignPrice: "cyan",
    DepositSuccessful: "green",
    AssignToDesigner: "purple",
    DeterminingMaterialPrice: "orange",
    DoneDesign: "success",
    PaymentSuccess: "green",
    Processing: "processing",
    PickedPackageAndDelivery: "processing",
    DeliveryFail: "error",
    ReDelivery: "warning",
    DeliveredSuccessfully: "success",
    CompleteOrder: "success",
    OrderCancelled: "error",
    Warning: "warning",
    Refund: "orange",
    DoneRefund: "success"
  };
  return colorMap[status] || "default";
};

const getCurrentStep = (status) => {
  const stepMap = {
    Pending: 0,
    ConsultingAndSketching: 1,
    DeterminingDesignPrice: 2,
    DepositSuccessful: 3,
    AssignToDesigner: 4,
    DeterminingMaterialPrice: 5,
    DoneDesign: 6,
    PaymentSuccess: 7,
    Processing: 8,
    PickedPackageAndDelivery: 9,
    DeliveryFail: 10,
    ReDelivery: 11,
    DeliveredSuccessfully: 12,
    CompleteOrder: 13,
    OrderCancelled: 14,
    Warning: 15,
    Refund: 16,
    DoneRefund: 17
  };
  return stepMap[status] || 0;
}; 