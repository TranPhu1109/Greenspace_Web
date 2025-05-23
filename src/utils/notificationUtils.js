export const orderStatusDescriptionMap = {
  Pending: "Đơn hàng đang chờ xử lý",
  ConsultingAndSketching: "Đang trong quá trình tư vấn & phác thảo ý tưởng",
  DeterminingDesignPrice: "Đơn hàng đang được định giá thiết kế",
  DepositSuccessful: "Khách hàng đã đặt cọc thành công",
  AssignToDesigner: "Đơn hàng đã được giao cho nhà thiết kế",
  DeterminingMaterialPrice: "Đang xác định giá vật liệu",
  DoneDesign: "Thiết kế đã hoàn tất",
  PaymentSuccess: "Khách hàng đã thanh toán thành công",
  Processing: "Đơn hàng đang được xử lý",
  PickedPackageAndDelivery: "Gói hàng đã được lấy và đang giao đến khách",
  DeliveryFail: "Giao hàng không thành công",
  ReDelivery: "Đơn hàng đang được giao lại",
  DeliveredSuccessfully: "Khách hàng đã nhận được hàng",
  CompleteOrder: "Đơn hàng hoàn thành",
  OrderCancelled: "Đơn hàng đã bị huỷ",
  Warning: "Cảnh báo: vượt mức cho phép",
  Refund: "Đang tiến hành hoàn tiền",
  DoneRefund: "Hoàn tiền thành công",
  StopService: "Dừng cung cấp dịch vụ",
  ReConsultingAndSketching: "Đang phác thảo lại",
  ReDesign: "Đang thiết kế lại",
  WaitDeposit: "Chờ khách hàng đặt cọc",
  DoneDeterminingDesignPrice: "Đã hoàn thành thiết kế!",
  DoneDeterminingMaterialPrice: "Đã xác định giá vật liệu",
  ReDeterminingDesignPrice: "Xác định lại giá thiết kế",
  ExchangeProdcut: "Khách yêu cầu đổi sản phẩm",
  WaitForScheduling: "Đang chờ lên lịch lắp đặt",
  Installing: "Đang lắp đặt tại địa điểm",
  DoneInstalling: "Đã hoàn tất lắp đặt",
  ReInstall: "Lắp đặt lại sau phản hồi",
  CustomerConfirm: "Khách hàng đã xác nhận hoàn tất",
  Successfully: "Đơn hàng đã thành công",
  ReDetermineMaterialPrice: "Xác định lại giá vật liệu",
  MaterialPriceConfirmed: "Giá vật liệu đã được xác nhận",
};

export const taskStatusDescriptionMap = {
  ConsultingAndSket: "Đang tư vấn & phác thảo",
  DoneConsulting: "Đã tư vấn & phác thảo",
  Design: "Đang thiết kế",
  DoneDesign: "Đã hoàn tất thiết kế",
  DesignDetail: "Đang thiết kế chi tiết",
  DoneDesignDetail: "Đã hoàn tất thiết kế chi tiết",
  Pending: "Chờ xử lý",
  Installing: "Đang lắp đặt",
  DoneInstalling: "Đã hoàn tất lắp đặt",
  ReInstall: "Đang lắp đặt lại",
};

export function getNotificationType(notification) {
  const title = notification?.title?.toLowerCase() || "";
  const content = notification?.content?.toLowerCase() || "";

  if (title.startsWith("nhiệm vụ mới")) return "new_task";
  if (title.startsWith("cập nhật nhiệm vụ")) return "task_update";
  if (title.includes("đơn dịch vụ đang xử lí !")) return "order_update_customer";
  if (title.includes("xử lí đơn")) return "order_update_manager";
  if (title.includes("đơn dịch vụ vừa được cập nhật")) return "order_update_staff";
  if (title.includes("cảnh báo") || content.includes("cảnh báo"))
    return "warning";
  if (title.includes("thanh toán") || content.includes("thanh toán"))
    return "payment";

  return "other";
}

/**
 * Trả về nội dung thân thiện tùy theo loại thông báo
 */
export function getFormattedNotificationContent(notification) {
  const type = getNotificationType(notification);

  switch (type) {
    case "new_task":
      return "Bạn vừa được giao một nhiệm vụ mới. Hãy kiểm tra và thực hiện nhé!";
    case "task_update": {
      // Tách các thông tin nếu có
      const statusMatch = notification.content.match(
        /Trạng thái nhiệm vụ\s*:\s*(\w+)/
      );
      const orderIdMatch = notification.content.match(
        /Mã đơn\s*:\s*(\w+)/
      );
      const orderMatch = notification.content.match(
        /Trạng thái đơn\s*:\s*(\w+)/
      );

      const statusText = statusMatch?.[1];
      const orderStatusText = orderMatch?.[1];

      const taskStatus = statusText
        ? `Cập nhật nhiệm vụ: ${taskStatusDescriptionMap[statusText]}`
        : "";
      const orderStatus =
        orderStatusText && orderStatusDescriptionMap[orderStatusText]
          ? `\nĐơn thiết kế #${orderIdMatch?.[1]}: \n ${orderStatusDescriptionMap[orderStatusText]}`
          : "";

      return `${taskStatus}${orderStatus}`;
    }
    case "order_update":
      return "Thông tin đơn thiết kế vừa được cập nhật. Vui lòng kiểm tra lại chi tiết.";
    case "order_update_manager": {
      const orderIdMatch = notification.content.match(
        /Mã đơn\s*:\s*([a-f0-9-]+)/i
      );
      const orderId = orderIdMatch?.[1] || "";

      return `Đơn thiết kế vừa được xử lý. Vui lòng kiểm tra lại chi tiết đơn: #${orderId}`;
    }
    case "order_update_customer": {
      const orderIdMatch = notification.content.match(
        /Mã đơn\s*:\s*([a-f0-9-]+)/i
      );
      const orderStatusMatch = notification.content.match(
        /Trạng thái đơn\s*:\s*(\w+)/i
      );
      const orderStatus = orderStatusMatch?.[1] || "";
      const orderId = orderIdMatch?.[1] || "";
      const statusText = orderStatusDescriptionMap[orderStatus] || "Trạng thái không xác định";
    
      // Chọn emoji phù hợp theo status
      const emojiMap = {
        Pending: "🕒",
        DepositSuccessful: "💰",
        AssignToDesigner: "✍️",
        DoneDesign: "🎨",
        DoneInstalling: "🛠️",
        DeliveredSuccessfully: "📦",
        Successfully: "✅",
        OrderCancelled: "❌",
        Warning: "⚠️",
        Refund: "🔄",
        DoneRefund: "💸",
        DoneDeterminingDesignPrice: "🎨",
        DoneDeterminingMaterialPrice: "🎨",
      };
      const emoji = emojiMap[orderStatus] || "ℹ️";
    
      return `Đơn thiết kế #${orderId}\nĐã cập nhật trạng thái: ${emoji} ${statusText}`;
    }    
    case "order_update_staff": {
      const orderIdMatch = notification.content.match(
        /Mã đơn\s*:\s*([a-f0-9-]+)/i
      );
      const orderStatusMatch = notification.content.match(
        /Trạng thái đơn\s*:\s*(\w+)/i
      );
      const orderStatus = orderStatusMatch?.[1] || "";
      const orderId = orderIdMatch?.[1] || "";
      const statusText = orderStatusDescriptionMap[orderStatus] || "Trạng thái không xác định";
    
      // Chọn emoji phù hợp theo status
      const emojiMap = {
        Pending: "🕒",
        DepositSuccessful: "💰",
        AssignToDesigner: "✍️",
        DoneDesign: "🎨",
        DoneInstalling: "🛠️",
        DeliveredSuccessfully: "📦",
        Successfully: "✅",
        OrderCancelled: "❌",
        Warning: "⚠️",
        Refund: "🔄",
        DoneRefund: "💸",
        PaymentSuccess: "💰",
        DoneDeterminingDesignPrice: "🎨",
        DoneDeterminingMaterialPrice: "🎨",
        MaterialPriceConfirmed: "🎨",
      };
      const emoji = emojiMap[orderStatus] || "ℹ️";
    
      return `Đơn thiết kế #${orderId}\nĐã cập nhật trạng thái: ${emoji} ${statusText}`;
    }
    case "warning":
      return "Cảnh báo: Có thay đổi quan trọng trong tiến trình đơn hàng hoặc thiết kế.";
    case "payment":
      return "Bạn có cập nhật liên quan đến thanh toán. Hãy kiểm tra ví hoặc lịch sử đơn hàng.";
    default:
      return notification.content || "Bạn có một thông báo mới.";
  }
}
