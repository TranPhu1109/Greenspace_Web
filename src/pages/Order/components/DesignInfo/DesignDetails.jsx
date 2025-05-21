import React, { useState } from "react";
import { Card, Descriptions, Tag, Button, Modal, Typography, Spin, notification } from "antd";
import { HomeOutlined, DollarOutlined, CheckCircleOutlined, InfoOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { format } from "date-fns";

const { Text } = Typography;

const DesignDetails = ({
  order,
  formatPrice,
  handleCompleteOrder,
  approvedDesignPriceStatuses,
  finalMaterialPriceStatuses,
  updateStatus,
  getServiceOrderById,
  api,
  data
}) => {
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get deposit percentage safely with fallback to 50 if data is null or undefined
  const getDepositPercentage = () => {
    return data?.depositPercentage ?? 50;
  };

  // Calculate remaining percentage safely
  const getRemainingPercentage = () => {
    return 100 - getDepositPercentage();
  };

  // Format function for displaying prices nicely
  const formatPriceDisplay = (price) => {
    if (price === undefined || price === null || isNaN(price) || typeof price !== 'number') {
      return 'Chưa xác định';
    }
    return formatPrice(price);
  };

  // Handler for making final payment in DoneDesign status
  const handleOpenPaymentModal = () => {
    setIsPaymentModalVisible(true);
  };

  // Check if deposit information should be shown
  const shouldShowDepositInfo = () => {
    const initialStatuses = ['Pending', 'ConsultingAndSketching', 'DeterminingDesignPrice', 'ReDeterminingDesignPrice', 'WaitDeposit'];
    return order?.status && !initialStatuses.includes(order.status);
  };

  const handleFinalPayment = async () => {
    if (!order) {
      Modal.error({ content: "Không tìm thấy thông tin đơn hàng. Vui lòng làm mới trang." });
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate remaining payment amount (remaining % of design price + material price)
      const remainingPercent = getRemainingPercentage();
      const remainingDesignFee = (order.designPrice || 0) * (remainingPercent / 100);
      const materialPrice = order.materialPrice || 0;
      const totalPayment = remainingDesignFee + materialPrice;

      // Handle payment for final payment
      try {
        const walletStorage = localStorage.getItem("wallet-storage");
        if (!walletStorage) {
          throw new Error("Không tìm thấy thông tin ví. Vui lòng đăng nhập lại.");
        }
        const walletData = JSON.parse(walletStorage);
        const walletId = walletData.state.walletId;
        if (!walletId) {
          throw new Error("Không tìm thấy ID ví. Vui lòng đăng nhập lại.");
        }

        // Make payment
        const response = await api.post("/api/bill", {
          walletId: walletId,
          serviceOrderId: order.id,
          amount: totalPayment,
          description: `Thanh toán ${getRemainingPercentage()}% phí thiết kế còn lại và giá vật liệu cho đơn hàng #${order.id.slice(0, 8)}`,
        });

        if (response.data) {
          // Update order status to PaymentSuccess (7)
          const updateResult = await updateStatus(order.id, 7);

          if (updateResult !== "Update Successfully!") {
            throw new Error("Cập nhật trạng thái không thành công");
          }

          // Modal.success({ content: "Thanh toán thành công! Đơn hàng của bạn đang được xử lý." });
          notification.open({
            message: 'Thành công',
            description: 'Thanh toán thành công! Đơn hàng của bạn đang được xử lý.',
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
            placement: 'topRight',
            duration: 2,
          });
          setIsPaymentModalVisible(false);

          // Fetch updated order data
          const updatedOrder = await getServiceOrderById(order.id);

          // Cập nhật UI trong component cha
          if (typeof window.softUpdateOrderData === 'function') {
            // Sử dụng softUpdateOrderData để cập nhật UI mượt mà
            window.softUpdateOrderData(updatedOrder);
          } else if (typeof window.refreshOrderData === 'function') {
            // Fallback nếu không có softUpdateOrderData
            window.refreshOrderData(order.id);
          } else {
            // Nếu không có cả hai hàm, tải lại trang
            console.log("Không tìm thấy phương thức cập nhật UI, đang làm mới trang...");
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          }
        }
      } catch (paymentError) {
        console.error("Payment error:", paymentError);
        throw new Error("Thanh toán thất bại: " + (paymentError.response?.data?.error || paymentError.message));
      }
    } catch (err) {
      Modal.error({ content: "Thanh toán thất bại: " + (err.response?.data?.message || err.message) });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order is null or undefined, render a loading state
  if (!order) {
    return (
      <Card
        title={
          <span style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#4caf50',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <HomeOutlined />
            Thông tin thiết kế
          </span>
        }
        style={{
          height: '100%',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin tip="Đang tải thông tin thiết kế..." />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        title={
          <span style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1677ff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <InfoCircleOutlined />
            Thông tin đơn hàng
          </span>
        }
        style={{
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f0f0f0'
        }}
      >
        <div style={{ padding: '0 8px' }}>
          <div style={{ fontWeight: 'bold', color: '#1677ff', marginBottom: 8 }}>Thông tin thiết kế</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text strong>Kích thước:</Text>
            <Text>{order?.length}m x {order?.width}m</Text>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text strong>Ngày tạo:</Text>
            <Text>{order?.creationDate ? format(new Date(order.creationDate), 'dd/MM/yyyy HH:mm') : '...'}</Text>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text strong>Loại dịch vụ:</Text>
            <Tag color={order?.serviceType === "NoDesignIdea" ? "blue" : "green"}>
              {order?.serviceType === "NoDesignIdea" ? "Dịch vụ tư vấn & thiết kế" : order?.serviceType}
            </Tag>
          </div>

          <div style={{ height: 1, backgroundColor: '#f0f0f0', margin: '12px 0' }} />

          <div style={{ fontWeight: 'bold', color: '#fa8c16', marginBottom: 8 }}>Thông tin thanh toán</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text strong>Chi phí thiết kế chi tiết:</Text>
            {order?.designPrice === 0 || !approvedDesignPriceStatuses.includes(order?.status) ? (
              <Tag color="gold">Chưa xác định giá thiết kế</Tag>
            ) : (
              <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>{formatPriceDisplay(order.designPrice)}</Text>
            )}
          </div>

          {shouldShowDepositInfo() && order?.designPrice > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text strong>Thanh toán cọc giá thiết kế:</Text>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text style={{ color: '#1890ff', fontWeight: 'bold' }}>
                    {formatPriceDisplay((order?.designPrice || 0) * (getDepositPercentage() / 100))}
                  </Text>
                  <Tag color="blue">{getDepositPercentage()}%</Tag>
                </div>
                {[
                  "DepositSuccessful",
                  "AssignToDesigner",
                  "DeterminingMaterialPrice",
                  "DoneDesign",
                  "PaymentSuccess",
                  "Processing",
                  "PickedPackageAndDelivery",
                  "DeliveredSuccessfully",
                  "Successfully",
                  "DoneInstalling",
                  "Installing",
                  "ReInstall",
                  "DoneRefund"
                ].includes(order?.status) && (
                    <Tag color="success" style={{ marginTop: 4 }}>Đã thanh toán</Tag>
                  )}
              </div>
            </div>
          )}


          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text strong>Giá vật liệu:</Text>
            {(typeof order?.materialPrice !== 'number' || order.materialPrice <= 0) ? (
              <Tag color="gold">Chưa xác định giá vật liệu</Tag>
            ) : (
              <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>{formatPriceDisplay(order.materialPrice)}</Text>
            )}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '8px',
            borderTop: '1px dashed #ccc',
            marginTop: 10
          }}>
            <Text strong style={{ fontSize: 16 }}>Tổng chi phí:</Text>
            <Text strong style={{ color: '#cf1322', fontSize: 16 }}>
              {order?.status === 'DoneDesign' || order?.status === "PaymentSuccess" || order?.status === "Processing" ||
                order?.status === "DoneDeterminingMaterialPrice" || order?.status === "PickedPackageAndDelivery" ||
                order?.status === "DeliveredSuccessfully" || order?.status === "Successfully" ||
                order?.status === "DoneInstalling" || order?.status === "Installing" || order?.status === "ReInstall" ||
                order?.status === "DoneRefund"
                ? (order?.totalCost === undefined
                  ? 'Đang tải...'
                  : order?.totalCost === 0
                    ? <Tag color="gold">Chưa xác định tổng</Tag>
                    : formatPriceDisplay(order.totalCost)
                )
                : formatPriceDisplay((order?.designPrice || 0) + (order?.materialPrice || 0))
              }
            </Text>
          </div>
        </div>
      </Card>


      {/* Payment Modal */}
      <Modal
        title={`Thanh toán ${getRemainingPercentage()}% phí thiết kế còn lại và giá vật liệu`}
        open={isPaymentModalVisible}
        onOk={handleFinalPayment}
        onCancel={() => setIsPaymentModalVisible(false)}
        okText="Xác nhận thanh toán"
        cancelText="Hủy bỏ"
        confirmLoading={isSubmitting}
      >
        {order ? (
          <>
            <div style={{ marginBottom: '16px', padding: '12px', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text>Phí thiết kế đã thanh toán ({getDepositPercentage()}%):</Text>
                <Text>{formatPrice((order?.designPrice || 0) * (getDepositPercentage() / 100))}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text>Phí thiết kế còn lại ({getRemainingPercentage()}%):</Text>
                <Text strong style={{ color: '#1890ff' }}>{formatPrice((order?.designPrice || 0) * (getRemainingPercentage() / 100))}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text>Giá vật liệu:</Text>
                <Text strong style={{ color: '#1890ff' }}>{formatPrice(order?.materialPrice || 0)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed #f0f0f0' }}>
                <Text strong>Tổng thanh toán:</Text>
                <Text strong style={{ color: '#f5222d', fontSize: '16px' }}>
                  {formatPrice((order?.designPrice || 0) * (getRemainingPercentage() / 100) + (order?.materialPrice || 0))}
                </Text>
              </div>
            </div>

            <div style={{
              backgroundColor: '#f6ffed',
              border: '1px solid #b7eb8f',
              padding: '12px 16px',
              borderRadius: '4px',
            }}>
              <p style={{ margin: 0 }}>
                <span style={{ color: '#52c41a', marginRight: '8px' }}>✓</span>
                Thanh toán này bao gồm {getRemainingPercentage()}% phí thiết kế còn lại và toàn bộ giá vật liệu
              </p>
              <p style={{ margin: '8px 0 0 0' }}>
                <span style={{ color: '#52c41a', marginRight: '8px' }}>✓</span>
                Sau khi thanh toán, đơn hàng của bạn sẽ được xử lý và giao đến bạn trong thời gian sớm nhất
              </p>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin tip="Đang tải thông tin thanh toán..." />
          </div>
        )}
      </Modal>
    </>
  );
};

export default DesignDetails; 