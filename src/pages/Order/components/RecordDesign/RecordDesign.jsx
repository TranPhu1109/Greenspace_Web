import React, { useState, useMemo, useEffect } from "react";
import { Card, Image, Row, Col, Empty, Button, Tag, Typography, Modal, Input, message, notification } from "antd";
import { PictureOutlined, CheckCircleOutlined, EditOutlined, StopOutlined } from "@ant-design/icons";
import EditorComponent from "@/components/Common/EditorComponent";

const { Title, Text } = Typography;
const { TextArea } = Input;

const RecordDesign = ({
  order,
  designRecords,
  loadingDesignRecords,
  isSubmitting: externalIsSubmitting,
  confirmDesignRecord,
  updateStatus,
  getServiceOrderById,
  getRecordDesign,
  updateServiceForCus,
  api,
  formatPrice,
  sketchRecords,
  updateTaskOrder
}) => {
  const [selectedDesignId, setSelectedDesignId] = useState(null);
  const [isConfirmDesignModalVisible, setIsConfirmDesignModalVisible] = useState(false);
  const [isRedesignModalVisible, setIsRedesignModalVisible] = useState(false);
  const [isCancelWithFeeModalVisible, setIsCancelWithFeeModalVisible] = useState(false);
  const [redesignNote, setRedesignNote] = useState("");
  const [cancelDesignNote, setCancelDesignNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localOrder, setLocalOrder] = useState(order);
  
  // Cập nhật localOrder khi order prop thay đổi
  useEffect(() => {
    if (order) {
      setLocalOrder(order);
    }
  }, [order]);

  // Đưa hàm shouldShowDesignRecords từ ServiceOrderDetail sang component này
  const shouldShowDesignRecords = useMemo(() => {
    // Sử dụng localOrder thay vì order để có thể cập nhật UI mượt mà hơn
    const orderToCheck = localOrder || order;
    
    // Các trạng thái mà nên hiển thị design records
    const designViewableStatuses = [
      'DoneDesign', 'PaymentSuccess', 'Processing',
      'PickedPackageAndDelivery', 'DeliveryFail', 'ReDelivery',
      'DeliveredSuccessfully', 'CompleteOrder', 'WaitDeposit',
      'DoneDeterminingDesignPrice', 'DoneDeterminingMaterialPrice',
    ];
    const designViewableStatusCodes = [6, 7, 8, 9, 10, 11, 12, 13, 21, 22, 23];

    // Special case: Only include DeterminingDesignPrice status if maxPhase >= 2
    const maxPhase = sketchRecords?.reduce((max, record) => Math.max(max, record.phase || 0), 0) || 0;
    if (maxPhase >= 2 && (orderToCheck?.status === 'DeterminingDesignPrice' || orderToCheck?.status === 2)) {
      return true;
    }

    return designViewableStatuses.includes(orderToCheck?.status) ||
      designViewableStatusCodes.includes(orderToCheck?.status);
  }, [localOrder, order?.status, sketchRecords]);

  // Kiểm tra nếu không nên hiển thị thì trả về null luôn
  if (!shouldShowDesignRecords || !designRecords || designRecords.length === 0) {
    return null;
  }

  // New function to handle design record confirmation
  const handleConfirmDesign = (recordId) => {
    setSelectedDesignId(recordId);
    setIsConfirmDesignModalVisible(true);
  };

  // Function to confirm design selection
  const handleDesignSelection = async () => {
    try {
      setIsSubmitting(true);

      // First step: Confirm the design selection
      await confirmDesignRecord(selectedDesignId);
      Modal.success({ content: 'Đã chọn bản thiết kế chi tiết thành công!' });
      setIsConfirmDesignModalVisible(false);

      // Second step: Update status to DoneDesign (status code 6)
      try {
        await updateStatus(order.id, 6);
        Modal.success({ content: 'Đã cập nhật trạng thái đơn hàng' });

        // Third step: Refresh order data
        const updatedOrder = await getServiceOrderById(order.id);
        console.log('Updated order status after design selection:', updatedOrder?.status);

        // Refresh design records
        await getRecordDesign(order.id);

      } catch (statusError) {
        console.error("Error updating status after design selection:", statusError);
        Modal.error({ content: 'Không thể cập nhật trạng thái đơn hàng: ' + statusError.message });
      }
    } catch (err) {
      console.error("Error confirming design:", err);
      Modal.error({ content: 'Không thể chọn bản thiết kế: ' + err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to cancel design selection
  const handleCancelDesignSelection = () => {
    setSelectedDesignId(null);
    setIsConfirmDesignModalVisible(false);
  };

  // --- Redesign Modal Handlers ---
  const handleOpenRedesignModal = () => {
    setRedesignNote(""); // Clear previous note
    setIsRedesignModalVisible(true);
  };

  const handleCloseRedesignModal = () => {
    setIsRedesignModalVisible(false);
  };

  const handleSubmitRedesign = async () => {
    if (!redesignNote.trim()) {
      notification.warning({ 
        message: "Vui lòng nhập lý do yêu cầu thiết kế lại.", 
        showProgress: true,
        pauseOnHover: true,
        duration: 3,
        placement: 'topRight',
        });
      return;
    }
    setIsSubmitting(true);
    const payload = {
      serviceType: 1,
      designPrice: order?.designPrice,
      description: order?.description,
      status: 20, // ReDesign
      report: redesignNote // Add note to report field
    };
    
    try {
      // 1. Đóng modal trước để trải nghiệm tốt hơn
      setIsRedesignModalVisible(false);
      
      // 2. Hiển thị trạng thái loading trực tiếp tại component 
      // notification.info({
      //   key: 'redesign-processing',
      //   message: "Đang xử lý yêu cầu...",
      //   description: "Hệ thống đang cập nhật trạng thái đơn hàng",
      //   duration: 0, // Không tự động đóng
      //   placement: 'bottomRight',
      // });
      
      // 3. Gọi API cập nhật service order 
      await updateServiceForCus(order.id, payload);
      
      // 4. Nếu có workTasks, cập nhật task status  
      if (order?.workTasks && Array.isArray(order.workTasks) && order.workTasks.length > 0) {
        const workTask = order.workTasks[0];
        
        try {
          await updateTaskOrder(workTask.id, {
            serviceOrderId: order.id,
            userId: workTask.userId,
            status: 2, // Design status
            note: `Yêu cầu thiết kế lại: ${redesignNote.substring(0, 100)}...`
          });
        } catch (taskError) {
          console.error("Error updating task status:", taskError);
          // Tiếp tục xử lý ngay cả khi lỗi cập nhật task
        }
      }
      
      // 5. Lấy dữ liệu đơn hàng đã cập nhật
      const updatedOrder = await getServiceOrderById(order.id);
      
      // Cập nhật localOrder để UI tự động cập nhật
      setLocalOrder(updatedOrder);
      
      // 6. Cập nhật lại thông báo processing thành thành công
      // notification.close('redesign-processing');
      notification.success({
        message: "Đã gửi yêu cầu thiết kế lại thành công",
        // description: "Trạng thái đơn hàng: " + updatedOrder.status,
        duration: 4,
      });
      
      // 7. Cập nhật UI nhẹ nhàng thông qua order và designRecords mới
      try {
        // Lấy record thiết kế mới (nếu có)
        await getRecordDesign(order.id);
        
        // Sử dụng một hàm riêng biệt để cập nhật state trong component cha
        // mà không làm mới toàn bộ component
        if (typeof window.softUpdateOrderData === 'function') {
          window.softUpdateOrderData(updatedOrder);
        } else if (typeof window.refreshOrderData === 'function') {
          // Fallback nếu không có hàm cập nhật nhẹ
          window.refreshOrderData(order.id);
        }
      } catch (refreshError) {
        console.error("Error refreshing data after redesign:", refreshError);
      }
    } catch (err) {
      // Đóng thông báo processing nếu có lỗi
      notification.close('redesign-processing');
      
      notification.error({
        message: "Gửi yêu cầu thiết kế lại thất bại",
        description: err.response?.data?.message || err.message,
        duration: 4,
      });
      
      // Mở lại modal nếu có lỗi để người dùng có thể sửa
      setIsRedesignModalVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to open cancel with fee modal
  const handleOpenCancelWithFeeModal = () => {
    setCancelDesignNote("");
    setIsCancelWithFeeModalVisible(true);
  };

  // Function to handle order cancellation with 50% fee
  const handleCancelWithFee = async () => {
    if (!cancelDesignNote.trim()) {
      notification.warning({
        message: "Vui lòng nhập lý do hủy đơn hàng.",
        duration: 3,
      });
      return;
    }

    setIsSubmitting(true);
    
    // Đóng modal trước và hiển thị thông báo đang xử lý
    setIsCancelWithFeeModalVisible(false);
    notification.info({
      key: 'cancel-processing',
      message: "Đang xử lý yêu cầu hủy đơn hàng...",
      description: "Hệ thống đang thực hiện thanh toán và cập nhật trạng thái",
      duration: 0,
    });
    
    try {
      // Calculate 50% of the design price
      const cancelFee = order?.designPrice ? order.designPrice * 0.5 : 0;

      // Handle payment for cancellation fee
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

        // Make payment for cancellation fee
        const response = await api.post("/api/bill", {
          walletId: walletId,
          serviceOrderId: order.id,
          amount: cancelFee,
          description: `Thanh toán 50% phí thiết kế còn lại cho việc hủy đơn hàng #${order.id.slice(0, 8)}`,
        });

        if (response.data) {
          // Update order status to cancelled
          const payload = {
            serviceType: 1,
            status: 14, // OrderCancelled
            report: `Hủy sau khi xem 3 bản thiết kế: ${cancelDesignNote}`
          };

          await updateServiceForCus(order.id, payload);
          
          // Lấy dữ liệu order mới đã cập nhật
          const updatedOrder = await getServiceOrderById(order.id);
          
          // Cập nhật localOrder để UI tự động cập nhật
          setLocalOrder(updatedOrder);
          
          // Đóng thông báo đang xử lý
          notification.close('cancel-processing');
          
          // Hiển thị thông báo thành công
          notification.success({
            message: "Đã hủy đơn hàng thành công",
            description: "Đã thanh toán phí hủy đơn hàng",
            duration: 4,
          });
          
          // Cập nhật UI qua softUpdateOrderData nếu có
          if (typeof window.softUpdateOrderData === 'function') {
            window.softUpdateOrderData(updatedOrder);
          } else if (typeof window.refreshOrderData === 'function') {
            window.refreshOrderData(order.id);
          }
        }
      } catch (paymentError) {
        console.error("Payment error:", paymentError);
        notification.close('cancel-processing');
        throw new Error("Thanh toán phí hủy thất bại: " + (paymentError.response?.data?.error || paymentError.message));
      }
    } catch (err) {
      notification.close('cancel-processing');
      notification.error({
        message: "Hủy đơn hàng thất bại",
        description: err.response?.data?.message || err.message,
        duration: 5,
      });
      
      // Mở lại modal nếu có lỗi
      setIsCancelWithFeeModalVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingDesignRecords) {
    return <Card title="Bản thiết kế chi tiết" loading={true} style={{ marginBottom: '24px' }} />;
  }

  // Kiểm tra nếu không có design records để hiển thị
  if (!designRecords || designRecords.length === 0) {
    return (
      <Card
        title={
          <span style={{ fontSize: '18px', fontWeight: '600', color: '#4caf50', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PictureOutlined /> Bản thiết kế chi tiết
          </span>
        }
        style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}
      >
        <Empty description={loadingDesignRecords ? "Đang tải bản thiết kế..." : "Chưa có bản thiết kế chi tiết nào."} />
      </Card>
    );
  }

  // Determine if selection is allowed for design records
  // const isSelectionAllowed = 
  //   (order?.status === 'DoneDeterminingDesignPrice' || 
  //    order?.status === 'AssignToDesigner' || 
  //    order?.status === 'DeterminingMaterialPrice') && 
  //   !designRecords.some(r => r.isSelected);
  const isSelectionAllowed =
    (order?.status === 'DoneDesign') &&
    !designRecords.some(r => r.isSelected);

  return (
    <>
      <Card
        title={
          <span style={{ fontSize: '18px', fontWeight: '600', color: '#4caf50', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PictureOutlined /> Bản thiết kế chi tiết
          </span>
        }
        style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}
        loading={loadingDesignRecords}
      >
        {[1, 2, 3].map(phase => {
          const phaseRecords = designRecords.filter(record => record.phase === phase);
          if (phaseRecords.length === 0) return null;

          const phaseTitle = `Bản thiết kế chi tiết lần ${phase}`;
          const isAnySelectedInPhase = phaseRecords.some(record => record.isSelected);

          return (
            <div key={phase} style={{ marginBottom: '24px' }}>
              <Title level={5} style={{ marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>
                {phaseTitle}
                {isAnySelectedInPhase && <Tag color="green" style={{ marginLeft: 8 }}>Đã chọn</Tag>}
              </Title>
              {phaseRecords.map(record => (
                <div key={record.id} style={{ marginBottom: '16px' }}>
                  <Card
                    hoverable
                    bodyStyle={{ padding: '12px' }}
                    style={{ border: record.isSelected ? '2px solid #52c41a' : '1px solid #f0f0f0', borderRadius: '8px' }}
                  >
                    <Image.PreviewGroup>
                      <Row gutter={[12, 12]}>
                        {record.image?.imageUrl && (
                          <Col xs={24} sm={12} md={8}>
                            <Image
                              src={record.image.imageUrl}
                              alt={`Bản thiết kế ${phase} - 1`}
                              style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                          </Col>
                        )}
                        {record.image?.image2 && (
                          <Col xs={24} sm={12} md={8}>
                            <Image
                              src={record.image.image2}
                              alt={`Bản thiết kế ${phase} - 2`}
                              style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                          </Col>
                        )}
                        {record.image?.image3 && (
                          <Col xs={24} sm={12} md={8}>
                            <Image
                              src={record.image.image3}
                              alt={`Bản thiết kế ${phase} - 3`}
                              style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                          </Col>
                        )}
                        {!record.image?.imageUrl && !record.image?.image2 && !record.image?.image3 && (
                          <Col span={24}>
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có ảnh trong bản ghi này" />
                          </Col>
                        )}
                      </Row>
                    </Image.PreviewGroup>
                  </Card>

                  {isSelectionAllowed && (
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      style={{ marginTop: '10px', width: '100%' }}
                      loading={isSubmitting}
                      onClick={() => handleConfirmDesign(record.id)}
                    >
                      Chọn bản thiết kế này
                    </Button>
                  )}
                </div>
              ))}
            </div>
          );
        })}

        {/* Action buttons for design records */}
        {(order?.status === 'DoneDesign') && (
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
            {/* Only show redesign button if less than 3 design phases */}
            {!designRecords.some(r => r.phase === 3) && !designRecords.some(r => r.isSelected) && (
              <Button
                icon={<EditOutlined />}
                onClick={handleOpenRedesignModal}
                disabled={isSubmitting || loadingDesignRecords}
              >
                Yêu cầu thiết kế lại
              </Button>
            )}

            {/* Only show cancel with fee button if all 3 design phases are present */}
            {designRecords.some(r => r.phase === 3) && !designRecords.some(r => r.isSelected) && (
              <Button
                danger
                icon={<StopOutlined />}
                onClick={handleOpenCancelWithFeeModal}
                disabled={isSubmitting || loadingDesignRecords}
              >
                Hủy đơn và thanh toán 50% còn lại
              </Button>
            )}

            {!designRecords.some(r => r.isSelected) && (
              <Text type="secondary" style={{ alignSelf: 'center' }}>
                {designRecords.some(r => r.phase === 3)
                  ? "Vui lòng chọn một bản thiết kế hoặc hủy đơn hàng (sẽ phải thanh toán 50% phí thiết kế còn lại)."
                  : "Vui lòng chọn một bản thiết kế để tiếp tục."}
              </Text>
            )}
          </div>
        )}
      </Card>

      {/* Design Confirmation Modal */}
      <Modal
        title="Xác nhận chọn bản thiết kế chi tiết"
        open={isConfirmDesignModalVisible}
        onOk={handleDesignSelection}
        onCancel={handleCancelDesignSelection}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={isSubmitting}
      >
        <p>Bạn có chắc chắn muốn chọn bản thiết kế chi tiết này không?</p>
        <p>Sau khi chọn, thiết kế này sẽ được sử dụng để xác định giá vật liệu và tiến hành các bước tiếp theo.</p>
      </Modal>

      {/* Redesign Request Modal */}
      <Modal
        title="Yêu cầu thiết kế lại"
        open={isRedesignModalVisible}
        onCancel={handleCloseRedesignModal}
        onOk={handleSubmitRedesign}
        confirmLoading={isSubmitting}
        okText="Gửi yêu cầu"
        cancelText="Hủy bỏ"
        width={800}
      >
        <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>
          Vui lòng cho chúng tôi biết lý do bạn muốn thiết kế lại hoặc những điểm cần chỉnh sửa:
        </p>
        <EditorComponent
          value={redesignNote}
          onChange={setRedesignNote}
          height={500}
        />
      </Modal>

      {/* Cancel with Fee Modal */}
      <Modal
        title="Hủy đơn hàng và thanh toán 50% phí thiết kế còn lại"
        open={isCancelWithFeeModalVisible}
        onOk={handleCancelWithFee}
        onCancel={() => setIsCancelWithFeeModalVisible(false)}
        okText="Xác nhận hủy và thanh toán"
        cancelText="Không hủy"
        confirmLoading={isSubmitting}
        okButtonProps={{ danger: true }}
        width={800}
      >
        <p>Bạn đã xem tất cả 3 bản thiết kế chi tiết nhưng không hài lòng với bất kỳ bản nào.</p>
        <p style={{ color: '#cf1322', fontWeight: 'bold' }}>
          Để hủy đơn hàng ở giai đoạn này, bạn cần thanh toán 50% phí thiết kế còn lại ({order?.designPrice ? formatPrice(order.designPrice * 0.5) : "..."}).
        </p>
        <p>Vui lòng cho chúng tôi biết lý do bạn hủy đơn hàng:</p>
        <EditorComponent
          value={cancelDesignNote}
          onChange={setCancelDesignNote}
          height={300}
        />
      </Modal>
    </>
  );
};

export default RecordDesign; 