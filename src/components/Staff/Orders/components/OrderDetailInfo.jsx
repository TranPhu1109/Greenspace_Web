// import React from "react";
// import { Card, Descriptions, Typography, Divider, Button, Space, Tag } from "antd";
// import {
//   UserOutlined,
//   PhoneOutlined,
//   MailOutlined,
//   HomeOutlined,
//   DollarOutlined,
//   CalendarOutlined,
//   CheckCircleOutlined,
//   CloseCircleOutlined,
//   CarOutlined,
//   ShoppingOutlined,
// } from "@ant-design/icons";

// const { Text, Title } = Typography;

// const OrderDetailInfo = ({ order, setStatusModalVisible, setPaymentModalVisible }) => {
//   // Tính tổng tiền đơn hàng
//   const calculateTotal = () => {
//     return order.details.reduce(
//       (total, item) => total + Number(item.price) * item.quantity,
//       0
//     );
//   };

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

//   return (
//     <Card className="shadow-sm">
//       <Title level={5} className="mb-4">Thông tin khách hàng</Title>
//       <Descriptions column={1} className="mb-4">
//         <Descriptions.Item 
//           label={<Space><UserOutlined /> Khách hàng</Space>} 
//           className="py-2"
//         >
//           <Text strong>{order.customer.name}</Text>
//         </Descriptions.Item>
//         <Descriptions.Item 
//           label={<Space><MailOutlined /> Email</Space>} 
//           className="py-2"
//         >
//           {order.customer.email}
//         </Descriptions.Item>
//         <Descriptions.Item 
//           label={<Space><PhoneOutlined /> Số điện thoại</Space>} 
//           className="py-2"
//         >
//           {order.customer.phone}
//         </Descriptions.Item>
//         <Descriptions.Item 
//           label={<Space><HomeOutlined /> Địa chỉ</Space>} 
//           className="py-2"
//         >
//           {order.customer.address}
//         </Descriptions.Item>
//       </Descriptions>

//       <Divider />

//       <Title level={5} className="mb-4">Thông tin đơn hàng</Title>
//       <Descriptions column={1} className="mb-4">
//         <Descriptions.Item 
//           label={<Space><ShoppingOutlined /> Trạng thái</Space>}
//           className="py-2"
//         >
//           <Space>
//             <Tag color={getStatusColor(order.orderStatus)}>
//               {order.orderStatus}
//             </Tag>
//             <Button type="link" size="small" onClick={() => setStatusModalVisible(true)}>
//               Cập nhật
//             </Button>
//           </Space>
//         </Descriptions.Item>

//         <Descriptions.Item 
//           label={<Space><DollarOutlined /> Thanh toán</Space>}
//           className="py-2"
//         >
//           <Space direction="vertical" size="small">
//             <div>
//               <Text type="secondary">Phương thức: </Text>
//               <Text strong>{order.payment.method}</Text>
//             </div>
//             <div>
//               <Text type="secondary">Trạng thái: </Text>
//               <Tag color={order.payment.status === "đã thanh toán" ? "success" : "warning"}>
//                 {order.payment.status}
//               </Tag>
//               <Button type="link" size="small" onClick={() => setPaymentModalVisible(true)}>
//                 Cập nhật
//               </Button>
//             </div>
//           </Space>
//         </Descriptions.Item>

//         <Descriptions.Item 
//           label={<Space><CalendarOutlined /> Ngày đặt</Space>} 
//           className="py-2"
//         >
//           {order.orderDate}
//         </Descriptions.Item>
        
//         {order.payment.date && (
//           <Descriptions.Item 
//             label={<Space><CalendarOutlined /> Ngày thanh toán</Space>} 
//             className="py-2"
//           >
//             {order.payment.date}
//           </Descriptions.Item>
//         )}
//       </Descriptions>

//       <Divider />

//       <div className="flex justify-between items-center py-2">
//         <Text strong>Tổng tiền:</Text>
//         <Text strong className="text-xl text-red-500">
//           {calculateTotal().toLocaleString("vi-VN")} đ
//         </Text>
//       </div>

//       <Space direction="vertical" className="w-full mt-4">
//         <Button type="primary" icon={<PhoneOutlined />} block>
//           Liên hệ khách hàng
//         </Button>
//         <Button icon={<MailOutlined />} block>
//           Gửi email
//         </Button>
//       </Space>
//     </Card>
//   );
// };

// export default OrderDetailInfo; 