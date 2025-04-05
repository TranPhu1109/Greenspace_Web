// import React, { useEffect } from "react";
// import { useAuthStore } from "@/stores/useAuthStore";
// import useServiceOrderStore from "@/stores/useServiceOrderStore";
// import {
//   Card,
//   Typography,
//   Spin,
//   Alert,
//   Row,
//   Col,
//   Tag,
//   Image,
//   Layout,
// } from "antd";
// import { format } from "date-fns";
// import Footer from "@/components/Footer";
// import Header from "@/components/Header";
// const { Title, Text } = Typography;
// const { Content } = Layout;

// const ServiceOrderHistory = () => {
//   const { user } = useAuthStore();
//   const { serviceOrders, loading, error, getServiceOrdersNoUsingIdea } =
//     useServiceOrderStore();

//   useEffect(() => {
//     if (user?.id) {
//       getServiceOrdersNoUsingIdea(user.id);
//     }
//   }, [user?.id, getServiceOrdersNoUsingIdea]);

//   if (loading) {
//     return (
//       <Spin
//         size="large"
//         className="flex justify-center items-center min-h-[400px]"
//       />
//     );
//   }

//   if (error) {
//     return <Alert type="error" message={error} className="mb-4" />;
//   }

//   const getStatusColor = (status) => {
//     const statusColors = {
//       Pending: "orange",
//       PaymentSuccess: "green",
//       Processing: "blue",
//       PickedPackageAndDelivery: "cyan",
//       DeliveryFail: "red",
//       ReDelivery: "purple",
//       DeliveredSuccessfully: "green",
//       CompleteOrder: "green",
//       OrderCancelled: "red",
//     };
//     return statusColors[status] || "default";
//   };

//   return (
//     <Layout>
//       <Header />
//       <Content>
//         <div className="container mx-auto px-4 py-8">
//           <Title level={2} className="mb-6">
//             Lịch sử đơn đặt thiết kế
//           </Title>

//           {serviceOrders.length === 0 ? (
//             <Alert
//               message="Không có đơn đặt thiết kế"
//               description="Bạn chưa có đơn đặt thiết kế nào."
//               type="info"
//               showIcon
//             />
//           ) : (
//             <div className="space-y-6">
//               {serviceOrders.map((order) => (
//                 <Card key={order.id} className="shadow-md">
//                   <div className="flex flex-col space-y-4">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <Title level={4}>
//                           Đơn hàng #{order.id.slice(0, 8)}
//                         </Title>
//                         <Text type="secondary">
//                           Ngày tạo: {format(new Date(order.creationDate), "dd/MM/yyyy HH:mm")}
//                         </Text>
//                       </div>
//                       <Tag color={getStatusColor(order.status)}>
//                         {order.status}
//                       </Tag>
//                     </div>

//                     <Row gutter={[16, 16]}>
//                       <Col xs={24} sm={12}>
//                         <div className="space-y-2">
//                           <Text strong>Thông tin khách hàng:</Text>
//                           <div>
//                             <Text>Tên: {order.userName}</Text>
//                           </div>
//                           <div>
//                             <Text>Email: {order.email}</Text>
//                           </div>
//                           <div>
//                             <Text>Số điện thoại: {order.cusPhone}</Text>
//                           </div>
//                           <div>
//                             <Text>Địa chỉ: {order.address}</Text>
//                           </div>
//                         </div>
//                       </Col>
//                       <Col xs={24} sm={12}>
//                         <div className="space-y-2">
//                           <Text strong>Thông tin thiết kế:</Text>
//                           <div>
//                             <Text>
//                               Kích thước: {order.length}m x {order.width}m
//                             </Text>
//                           </div>
//                           <div>
//                             <Text>Loại dịch vụ: {order.serviceType}</Text>
//                           </div>
//                           <div>
//                             <Text>
//                               Tổng chi phí:{" "}
//                               {order.totalCost.toLocaleString("vi-VN")} VNĐ
//                             </Text>
//                           </div>
//                         </div>
//                       </Col>
//                     </Row>

//                     {order.description && (
//                       <div className="mt-4">
//                         <Text strong>Mô tả:</Text>
//                         <div
//                           className="mt-2"
//                           dangerouslySetInnerHTML={{
//                             __html: order.description,
//                           }}
//                         />
//                       </div>
//                     )}

//                     {order.image && (
//                       <div className="mt-4">
//                         <Text strong className="mb-2 block">
//                           Hình ảnh:
//                         </Text>
//                         <Row gutter={[16, 16]}>
//                           {order.image.imageUrl && (
//                             <Col xs={24} sm={8}>
//                               <Image
//                                 src={order.image.imageUrl}
//                                 alt="Hình ảnh 1"
//                                 className="rounded-lg"
//                               />
//                             </Col>
//                           )}
//                           {order.image.image2 && (
//                             <Col xs={24} sm={8}>
//                               <Image
//                                 src={order.image.image2}
//                                 alt="Hình ảnh 2"
//                                 className="rounded-lg"
//                               />
//                             </Col>
//                           )}
//                           {order.image.image3 && (
//                             <Col xs={24} sm={8}>
//                               <Image
//                                 src={order.image.image3}
//                                 alt="Hình ảnh 3"
//                                 className="rounded-lg"
//                               />
//                             </Col>
//                           )}
//                         </Row>
//                       </div>
//                     )}
//                   </div>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </div>
//       </Content>
//       <Footer />
//     </Layout>
//   );
// };

// export default ServiceOrderHistory;
