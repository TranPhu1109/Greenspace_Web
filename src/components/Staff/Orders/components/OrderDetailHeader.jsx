// import React from "react";
// import { Typography, Tag, Button, Space, Steps } from "antd";
// import {
//   ShoppingCartOutlined,
//   CheckCircleOutlined,
//   CarOutlined,
//   InboxOutlined,
// } from "@ant-design/icons";

// const { Title, Text } = Typography;
// const { Step } = Steps;

// const OrderDetailHeader = ({
//   order,
//   setStatusModalVisible,
//   setPaymentModalVisible,
// }) => {
//   const getStatusColor = (status) => {
//     switch (status) {
//       case "chờ xác nhận":
//         return "warning";
//       case "đã xác nhận":
//         return "processing";
//       case "đã giao cho đơn vị vận chuyển":
//       case "đang giao hàng":
//         return "blue";
//       case "đã giao hàng":
//         return "success";
//       case "đơn bị từ chối":
//       case "đã hủy":
//         return "error";
//       default:
//         return "default";
//     }
//   };

//   const getCurrentStep = (status) => {
//     switch (status) {
//       case "chờ xác nhận":
//         return 0;
//       case "đã xác nhận":
//         return 1;
//       case "đã giao cho đơn vị vận chuyển":
//       case "đang giao hàng":
//         return 2;
//       case "đã giao hàng":
//         return 3;
//       case "đơn bị từ chối":
//       case "đã hủy":
//         return -1;
//       default:
//         return 0;
//     }
//   };

//   return (
//     <div>
//       <Steps
//         current={getCurrentStep(order.orderStatus)}
//         status={
//           order.orderStatus === "đơn bị từ chối" || order.orderStatus === "đã hủy"
//             ? "error"
//             : "process"
//         }
//         className="order-status-steps"
//       >
//         <Step
//           title="Đơn mới"
//           icon={<ShoppingCartOutlined />}
//           description="Chờ xác nhận"
//         />
//         <Step
//           title="Đã xác nhận"
//           icon={<CheckCircleOutlined />}
//           description="Đang xử lý"
//         />
//         <Step
//           title="Đang giao"
//           icon={<CarOutlined />}
//           description="Đang vận chuyển"
//         />
//         <Step
//           title="Hoàn thành"
//           icon={<InboxOutlined />}
//           description="Đã giao hàng"
//         />
//       </Steps>
//     </div>
//   );
// };

// export default OrderDetailHeader;
