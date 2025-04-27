import React, { useState } from "react";
import { Card, Descriptions, Tag, Button, Modal, Typography, Spin } from "antd";
import { HomeOutlined, DollarOutlined } from "@ant-design/icons";
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
  api
}) => {
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleFinalPayment = async () => {
    if (!order) {
      Modal.error({ content: "Không tìm thấy thông tin đơn hàng. Vui lòng làm mới trang." });
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate remaining payment amount (50% of design price + material price)
      const remainingDesignFee = order.designPrice * 0.5; // 50% of design price
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
          description: `Thanh toán 50% phí thiết kế còn lại và giá vật liệu cho đơn hàng #${order.id.slice(0, 8)}`,
        });

        if (response.data) {
          // Update order status to PaymentSuccess (7)
          const updateResult = await updateStatus(order.id, 7);
          
          if (updateResult !== "Update Successfully!") {
            throw new Error("Cập nhật trạng thái không thành công");
          }
          
          Modal.success({ content: "Thanh toán thành công! Đơn hàng của bạn đang được xử lý." });
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

  return (
    <>
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
        <Descriptions
          column={1}
          labelStyle={{ fontWeight: 'bold', fontSize: '15px' }}
          contentStyle={{ fontSize: '15px' }}
          size="middle"
        >
          <Descriptions.Item label="Kích thước">
            {order?.length !== undefined && order?.width !== undefined
              ? `${order.length}m x ${order.width}m`
              : 'Đang tải...'}
          </Descriptions.Item>
          <Descriptions.Item label="Loại dịch vụ">
            <Tag color={order?.serviceType === "NoDesignIdea" ? "blue" : "green"}>
              {order?.serviceType === "NoDesignIdea"
                ? "Dịch vụ tư vấn & thiết kế"
                : order?.serviceType || 'Đang tải...'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Chi phí thiết kế chi tiết">
            {order?.designPrice === 0 || !approvedDesignPriceStatuses.includes(order?.status) ? (
              <Tag color="gold">Chưa xác định giá thiết kế</Tag>
            ) : (
              <span style={{ color: '#4caf50', fontWeight: 'bold' }}>
                {order?.designPrice !== undefined ? formatPriceDisplay(order.designPrice) : '...'}
              </span>
            )}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              order?.status === 'DoneDesign' || order?.status === 6
                ? "Giá vật liệu"
                : (finalMaterialPriceStatuses.includes(order?.status)
                  ? "Giá vật liệu"
                  : "Giá vật liệu (dự kiến)")
            }
          >
            {(typeof order?.materialPrice !== 'number' || order.materialPrice <= 0) ? (
              <Tag color="default">Chưa có</Tag>
            ) : (
              <span style={{ color: '#4caf50', fontWeight: 'bold' }}>
                {formatPriceDisplay(order.materialPrice)}
              </span>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng chi phí">
            {order?.status === 'DoneDesign' || order?.status === "PaymentSuccess" ||
              order?.status === 'DoneDeterminingMaterialPrice' || order?.status === 'CompleteOrder'
              || order?.status === "PaymentSucces" || order?.status === "Processing" || order?.status === "PickedPackageAndDelivery"
              || order?.status === "DeliveredSuccessfully"
              ? (
                <span style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '16px' }}>
                  {formatPriceDisplay((order.designPrice || 0) + (order.materialPrice || 0))}
                </span>
              ) : (
                order?.totalCost === undefined ? 'Đang tải...' :
                  order.totalCost === 0 ? (
                    <Tag color="gold">Chưa xác định tổng</Tag>
                  ) : (
                    <span style={{ color: '#4caf50', fontWeight: 'bold' }}>{formatPriceDisplay(order.totalCost)}</span>
                  )
              )}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {order?.creationDate ? format(new Date(order.creationDate), "dd/MM/yyyy HH:mm") : 'Đang tải...'}
          </Descriptions.Item>

          {/* Payment Reminder for DoneDesign status */}
          {(order?.status === 'DoneDesign') && (
            <Descriptions.Item label="">
              <Card 
                style={{
                  // backgroundColor: '#f9f9f9',
                  border: '1px solid #d9d9d9',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#fffbe6',
                }}
              >
                <Text type="warning" style={{ fontSize: '16px', fontWeight: '500' }}>
                  Vui lòng thanh toán 50% phí thiết kế còn lại và giá vật liệu để tiếp tục.
                </Text>
                <Button
                  type="primary"
                  icon={<DollarOutlined />}
                  onClick={handleOpenPaymentModal}
                  style={{ width: '100%', marginTop: '12px', borderRadius: '4px' }}
                >
                  Thanh toán ngay: {formatPriceDisplay((order.designPrice || 0) * 0.5 + (order.materialPrice || 0))}
                </Button>
              </Card>
            </Descriptions.Item>
          )}
        </Descriptions>

        {order?.status === "DeliveredSuccessfully" && (
          <Button
            style={{ marginTop: 15 }}
            type="primary"
            onClick={() => {
              Modal.confirm({
                title: "Xác nhận hoàn thành",
                content:
                  "Bạn có chắc chắn muốn xác nhận hoàn thành đơn hàng này?",
                okText: "Xác nhận",
                cancelText: "Hủy",
                onOk: handleCompleteOrder,
              });
            }}
          >
            Xác nhận hoàn thành
          </Button>
        )}
      </Card>

      {/* Payment Modal */}
      <Modal
        title="Thanh toán 50% phí thiết kế còn lại và giá vật liệu"
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
                <Text>Phí thiết kế đã thanh toán (50%):</Text>
                <Text>{formatPrice((order?.designPrice || 0) * 0.5)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text>Phí thiết kế còn lại (50%):</Text>
                <Text strong style={{ color: '#1890ff' }}>{formatPrice((order?.designPrice || 0) * 0.5)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text>Giá vật liệu:</Text>
                <Text strong style={{ color: '#1890ff' }}>{formatPrice(order?.materialPrice || 0)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed #f0f0f0' }}>
                <Text strong>Tổng thanh toán:</Text>
                <Text strong style={{ color: '#f5222d', fontSize: '16px' }}>
                  {formatPrice((order?.designPrice || 0) * 0.5 + (order?.materialPrice || 0))}
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
                Thanh toán này bao gồm 50% phí thiết kế còn lại và toàn bộ giá vật liệu
              </p>
              <p style={{ margin: '8px 0 0 0' }}>
                <span style={{ color: '#52c41a', marginRight: '8px' }}>✓</span>
                Sau khi thanh toán, đơn hàng của bạn sẽ được xử lý và chuyển sang giai đoạn sản xuất
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