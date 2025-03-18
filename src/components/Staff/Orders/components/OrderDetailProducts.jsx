// import React from "react";
// import { Card, Table, Typography, Tag, Image, Space } from "antd";
// import { ShoppingOutlined } from "@ant-design/icons";

// const { Text, Title } = Typography;

// const OrderDetailProducts = ({ order }) => {
//   // Tính tổng tiền đơn hàng
//   const calculateTotal = () => {
//     return order.details.reduce(
//       (total, item) => total + Number(item.price) * item.quantity,
//       0
//     );
//   };

//   const columns = [
//     {
//       title: 'Sản phẩm',
//       dataIndex: 'product',
//       key: 'product',
//       width: '40%',
//       render: (text, record) => (
//         <Space>
//           {record.image && (
//             <Image 
//               src={record.image} 
//               alt={text}
//               width={50}
//               height={50}
//               className="object-cover rounded"
//             />
//           )}
//           <div>
//             <Text strong>{text}</Text>
//             {record.variant && (
//               <Tag color="blue" className="ml-2">{record.variant}</Tag>
//             )}
//           </div>
//         </Space>
//       ),
//     },
//     {
//       title: 'Đơn giá',
//       dataIndex: 'price',
//       key: 'price',
//       align: 'right',
//       width: '20%',
//       render: (price) => (
//         <Text>{Number(price).toLocaleString("vi-VN")} đ</Text>
//       ),
//     },
//     {
//       title: 'Số lượng',
//       dataIndex: 'quantity',
//       key: 'quantity',
//       align: 'center',
//       width: '15%',
//       render: (quantity) => (
//         <Tag color="blue">{quantity}</Tag>
//       ),
//     },
//     {
//       title: 'Thành tiền',
//       key: 'total',
//       align: 'right',
//       width: '25%',
//       render: (_, record) => (
//         <Text strong className="text-red-500">
//           {(Number(record.price) * record.quantity).toLocaleString("vi-VN")} đ
//         </Text>
//       ),
//     },
//   ];

//   return (
//     <Card 
//       title={
//         <Space>
//           <ShoppingOutlined />
//           <Title level={5} className="m-0">Danh sách sản phẩm</Title>
//         </Space>
//       }
//       className="shadow-sm"
//     >
//       <Table
//         columns={columns}
//         dataSource={order.details}
//         pagination={false}
//         rowKey={(record) => `${record.product}-${Math.random()}`}
//         className="product-table"
//         summary={() => (
//           <Table.Summary fixed>
//             <Table.Summary.Row>
//               <Table.Summary.Cell index={0} colSpan={3} className="text-right">
//                 <Text strong>Tổng cộng:</Text>
//               </Table.Summary.Cell>
//               <Table.Summary.Cell index={1} className="text-right">
//                 <Text strong className="text-xl text-red-500">
//                   {calculateTotal().toLocaleString("vi-VN")} đ
//                 </Text>
//               </Table.Summary.Cell>
//             </Table.Summary.Row>
//           </Table.Summary>
//         )}
//       />
//     </Card>
//   );
// };

// export default OrderDetailProducts; 