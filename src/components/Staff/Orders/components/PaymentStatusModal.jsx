// import React, { useState } from "react";
// import { Modal, Select, message } from "antd";
// import useOrderStore from "../../../../stores/orderStore";

// const { Option } = Select;

// const PaymentStatusModal = ({ visible, setVisible, order }) => {
//   const { updatePaymentStatus } = useOrderStore();
//   const [newStatus, setNewStatus] = useState("");
//   const [isUpdating, setIsUpdating] = useState(false);

//   // Reset form khi modal mở
//   React.useEffect(() => {
//     if (visible) {
//       setNewStatus(order.payment.status);
//     }
//   }, [visible, order]);

//   const handleCancel = () => {
//     setVisible(false);
//   };

//   const handleOk = async () => {
//     if (!newStatus) {
//       message.error("Vui lòng chọn trạng thái thanh toán mới");
//       return;
//     }

//     setIsUpdating(true);
//     try {
//       const success = await updatePaymentStatus(order.id, newStatus);
//       if (success) {
//         message.success("Cập nhật trạng thái thanh toán thành công");
//         setVisible(false);
//       } else {
//         message.error("Có lỗi xảy ra khi cập nhật trạng thái thanh toán");
//       }
//     } catch (error) {
//       message.error("Có lỗi xảy ra: " + error.message);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   return (
//     <Modal
//       title="Cập nhật trạng thái thanh toán"
//       open={visible}
//       onOk={handleOk}
//       onCancel={handleCancel}
//       confirmLoading={isUpdating}
//     >
//       <Select
//         placeholder="Chọn trạng thái thanh toán mới"
//         className="w-full"
//         value={newStatus}
//         onChange={setNewStatus}
//       >
//         <Option value="đã thanh toán">Đã thanh toán</Option>
//         <Option value="chưa thanh toán">Chưa thanh toán</Option>
//       </Select>
//     </Modal>
//   );
// };

// export default PaymentStatusModal; 