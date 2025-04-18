import React, { useState } from "react";
import { Card, Image, Row, Col, Empty, Tag, Button, Popconfirm, Typography, Modal, Input } from "antd";
import { PictureOutlined, CheckCircleOutlined, EditOutlined, StopOutlined } from "@ant-design/icons";
import api from "@/api/api";

const { Title, Text } = Typography;
const { TextArea } = Input;

const RecordSketch = ({ 
  order, 
  sketchRecords, 
  recordLoading, 
  maxPhase,
  isSubmitting: externalIsSubmitting,
  updateServiceForCus,
  updateStatus,
  getServiceOrderById,
  confirmRecord,
  getRecordSketch,
  updateServiceOrderStatus
}) => {
  const [selectedSketchId, setSelectedSketchId] = useState(null);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isRevisionModalVisible, setIsRevisionModalVisible] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('DEBUG - RecordSketch:', {
    sketchRecords,
  });
  

  // Check if the current status is DoneDesign or later
  const isDoneDesign = order?.status === 'DoneDesign' || order?.status === 6;
  
  // Check which statuses allow viewing phase 1 sketches
  const canViewPhase1Sketches = () => {
    const phase1Statuses = [
      'DoneDesign', 'PaymentSuccess', 'Processing', 'PickedPackageAndDelivery',
      'DeliveryFail', 'ReDelivery', 'DeliveredSuccessfully', 'CompleteOrder',
      'WaitDeposit', 'DoneDeterminingDesignPrice', 'ReConsultingAndSketching',
      'DepositSuccessful', 'DeterminingMaterialPrice','ReDesign'
    ];
    
    const phase1StatusCodes = [6, 7, 8, 9, 10, 11, 12, 13, 21, 22, 23];
    
    // Special case: Check if there's a record with phase 2 and status is DeterminingDesignPrice
    const hasPhase2Record = sketchRecords?.some(record => record.phase === 2);
    
    if (hasPhase2Record && (order?.status === 'DeterminingDesignPrice' || order?.status === 2)) {
      return true;
    }
    
    return phase1Statuses.includes(order?.status) || phase1StatusCodes.includes(order?.status);
  };

  // Check which statuses allow viewing phase 2 sketches
  const canViewPhase2Sketches = () => {
    const phase2Statuses = [
      'DoneDesign', 'PaymentSuccess', 'Processing', 'PickedPackageAndDelivery',
      'DeliveryFail', 'ReDelivery', 'DeliveredSuccessfully', 'CompleteOrder',
      'WaitDeposit', 'DoneDeterminingDesignPrice', 'ReConsultingAndSketching',
      'DepositSuccessful', 'DeterminingMaterialPrice', 'ReDesign'
      // 'DeterminingDesignPrice' is NOT included for phase 2
    ];
    const phase2StatusCodes = [6, 7, 8, 9, 10, 11, 12, 13, 21, 22, 23, 24];  // Status code 2 is NOT included
    
    return phase2Statuses.includes(order?.status) || phase2StatusCodes.includes(order?.status);
  };

  // Legacy function maintained for backward compatibility
  const canViewDesignSketches = () => {
    return canViewPhase1Sketches();
  };

  // Handle opening the confirmation modal
  const handleConfirmSketch = (recordId) => {
    setSelectedSketchId(recordId);
    setIsConfirmModalVisible(true);
  };

  // Handle confirming sketch selection
  const handleConfirmSelection = async () => {
    try {
      setIsSubmitting(true);
      
      // First step: Confirm the sketch selection
      await confirmRecord(selectedSketchId);
      // Modal.success({ content: 'Đã chọn bản phác thảo thành công!' });
      setIsConfirmModalVisible(false);
      
      // Second step: Update status to WaitDeposit (status code 21)
      try {
        await updateStatus(order.id, 21);
        // Modal.success({ content: 'Đã cập nhật trạng thái đơn hàng' });
        
        // Third step: Refresh all relevant data
        // const updatedOrder = await getServiceOrderById(order.id);
        // console.log('Updated order status:', updatedOrder?.status);
        
        // Refresh sketch records
        await getRecordSketch(order.id);
        
      } catch (statusError) {
        console.error("Error updating status:", statusError);
        Modal.error({ content: 'Không thể cập nhật trạng thái đơn hàng: ' + statusError.message });
      }
    } catch (err) {
      console.error("Error confirming sketch:", err);
      Modal.error({ content: 'Không thể chọn bản phác thảo: ' + err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to cancel sketch selection
  const handleCancelSelection = () => {
    setSelectedSketchId(null);
    setIsConfirmModalVisible(false);
  };

  // --- Revision Modal Handlers ---
  const handleOpenRevisionModal = () => {
    setRevisionNote(""); // Clear previous note
    setIsRevisionModalVisible(true);
  };

  const handleCloseRevisionModal = () => {
    setIsRevisionModalVisible(false);
  };

  const handleSubmitRevision = async () => {
    if (!revisionNote.trim()) {
      Modal.warning({ content: "Vui lòng nhập lý do yêu cầu phác thảo lại." });
      return;
    }
    
    setSubmitting(true);

    try {
      // 1. Update the order status to ReConsultingAndSketching (19)
      await updateServiceOrderStatus(order.id, 19);
      
      // 2. Find the task ID and userId from the workTasks array
      if (order.workTasks && order.workTasks.length > 0) {
        // Get the latest task (assuming tasks are ordered by creation date)
        const latestTask = order.workTasks[order.workTasks.length - 1];
        
        // 3. Update the task status to ConsultingAndSket (0)
        await api.put(`/api/worktask/${latestTask.id}`, {
          serviceOrderId: order.id,
          userId: latestTask.userId,
          status: 0, // ConsultingAndSket status code
          note: revisionNote // Add customer's note to the task
        });
      } else {
        console.warn("No work tasks found for this order");
      }
      
      Modal.success({ content: "Đã gửi yêu cầu phác thảo lại thành công." });
      setIsRevisionModalVisible(false);
      
      // 4. Refresh the order data to reflect the changes
      const updatedOrder = await getServiceOrderById(order.id);
      
      // 5. Refresh sketch records
      await getRecordSketch(order.id);
      
      // 6. Call window.refreshOrderData if available (to trigger parent refresh)
      if (window.refreshOrderData) {
        window.refreshOrderData(order.id);
      }
      
    } catch (error) {
      console.error("Error requesting revision:", error);
      Modal.error({ 
        title: "Lỗi khi gửi yêu cầu phác thảo lại", 
        content: error.message || "Vui lòng thử lại sau"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel order handler passed from parent
  const handleCancelOrder = async () => {
    setIsSubmitting(true);
    try {
      // Use cancelServiceOrder from useServiceOrderStore (passed from parent)
      await updateServiceForCus(order.id, { 
        serviceType: 1,
        status: "OrderCancelled" 
      });
      Modal.success({ content: "Đã hủy đơn hàng thành công." });
      
      // Refresh all data
      const updatedOrder = await getServiceOrderById(order.id); 
      
      // Refresh sketch records as well
      await getRecordSketch(order.id);
      
      // Call global refresh function if available
      if (window.refreshOrderData) {
        window.refreshOrderData(order.id);
      }
    } catch (err) {
      Modal.error({ content: "Hủy đơn hàng thất bại: " + (err.response?.data?.message || err.message) });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (recordLoading && !sketchRecords) {
    return <Card title="Bản phác thảo & Hình ảnh gốc" loading={true} style={{ marginBottom: '24px' }} />;
  }

  // Different title based on whether we're showing sketches
  const cardTitle = canViewDesignSketches() && maxPhase > 0
    ? "Bản vẽ phác thảo & Hình ảnh gốc"
    : "Hình ảnh khách hàng cung cấp (Ban đầu)";

  if (!sketchRecords || sketchRecords.length === 0) {
    return (
      <Card 
        title={
          <span style={{ fontSize: '18px', fontWeight: '600', color: '#4caf50', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PictureOutlined /> {cardTitle}
          </span>
        } 
        style={{ marginBottom: '24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
      >
        <Empty description={recordLoading ? "Đang tải bản phác thảo..." : "Chưa có bản phác thảo hoặc hình ảnh gốc nào."} />
      </Card>
    );
  }

  // Get original images (phase 0)
  const originalImages = sketchRecords.filter(record => record.phase === 0);
  
  // Get design sketches (phase > 0) only if status permits
  const designSketches = canViewDesignSketches() 
    ? sketchRecords.filter(record => record.phase > 0)
    : [];

  // Determine phases to display based on status permissions
  const getPhasesToDisplay = () => {
    // Always include phase 0
    const phases = [0];
    
    // Add phase 1 if status permits
    if (canViewPhase1Sketches() && maxPhase >= 1) {
      phases.push(1);
    }
    
    // Add phase 2 if status permits and it exists
    if (canViewPhase2Sketches() && maxPhase >= 2) {
      phases.push(2);
    }
    
    // Add any higher phases if they exist and status permits phase 2
    if (canViewPhase2Sketches() && maxPhase > 2) {
      for (let i = 3; i <= maxPhase; i++) {
        phases.push(i);
      }
    }
    
    return phases.sort();
  };

  const phasesToDisplay = getPhasesToDisplay();

  return (
    <>
      <Card
        title={
          <span style={{ fontSize: '18px', fontWeight: '600', color: '#4caf50', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PictureOutlined /> {cardTitle}
          </span>
        }
        style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}
        loading={recordLoading && sketchRecords.length > 0}
      >
        {phasesToDisplay.map(phase => {
          const phaseRecords = sketchRecords.filter(record => record.phase === phase);
          if (phaseRecords.length === 0) return null;

          const phaseTitle = phase === 0
            ? "Hình ảnh khách hàng cung cấp (Ban đầu)"
            : `Bản phác thảo lần ${phase}`;

          const isAnySelectedInPhase = phaseRecords.some(record => record.isSelected);
          
          // Determine if selection is allowed for this record
          // Only allow selection when status is DoneDeterminingDesignPrice or 22 AND it's not phase 0
          const isSelectionAllowed = 
            (order?.status === 'DoneDeterminingDesignPrice' || order?.status === 22) && 
            phase > 0 && 
            !sketchRecords.some(r => r.isSelected);

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
                              alt={`${phase === 0 ? 'Ảnh gốc' : `Phác thảo ${phase}`} 1`}
                              style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                          </Col>
                        )}
                        {record.image?.image2 && (
                          <Col xs={24} sm={12} md={8}>
                            <Image
                              src={record.image.image2}
                              alt={`${phase === 0 ? 'Ảnh gốc' : `Phác thảo ${phase}`} 2`}
                              style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                          </Col>
                        )}
                        {record.image?.image3 && (
                          <Col xs={24} sm={12} md={8}>
                            <Image
                              src={record.image.image3}
                              alt={`${phase === 0 ? 'Ảnh gốc' : `Phác thảo ${phase}`} 3`}
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
                      loading={isSubmitting || externalIsSubmitting}
                      onClick={() => handleConfirmSketch(record.id)}
                    >
                      Chọn bản này
                    </Button>
                  )}
                </div>
              ))}
            </div>
          );
        })}

        {/* Action buttons for sketch selection - only show when in DoneDeterminingDesignPrice status */}
        {(order?.status === 'DoneDeterminingDesignPrice' || order?.status === 22) && (
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
            {maxPhase === 1 || maxPhase === 2 && (
              <Button
                icon={<EditOutlined />}
                onClick={handleOpenRevisionModal}
                disabled={isSubmitting || externalIsSubmitting || recordLoading || submitting}
                loading={submitting}
              >
                Yêu cầu phác thảo lại
              </Button>
            )}
            {/* Show Cancel button if maxPhase is 1 OR 2 */}
            {maxPhase >= 1 && (
              <Popconfirm
                title="Bạn chắc chắn muốn hủy đơn hàng này?"
                onConfirm={handleCancelOrder}
                okText="Xác nhận hủy"
                cancelText="Không"
                okButtonProps={{ danger: true }}
                disabled={isSubmitting || externalIsSubmitting || recordLoading || order?.status === 'WaitDeposit'}
              >
                <Button
                  danger
                  icon={<StopOutlined />}
                  loading={isSubmitting && order?.status === 'OrderCancelled'}
                  disabled={isSubmitting || externalIsSubmitting || recordLoading || order?.status === 'WaitDeposit'}
                >
                  Hủy đơn hàng
                </Button>
              </Popconfirm>
            )}
            {!sketchRecords.some(r => r.isSelected) && maxPhase >= 1 && (
              <Text type="secondary" style={{ alignSelf: 'center' }}>Vui lòng chọn một bản phác thảo hoặc thực hiện hành động khác.</Text>
            )}
          </div>
        )}
      </Card>

      {/* Add Confirmation Modal */}
      <Modal
        title="Xác nhận chọn bản phác thảo"
        open={isConfirmModalVisible}
        onOk={handleConfirmSelection}
        onCancel={handleCancelSelection}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={isSubmitting || externalIsSubmitting}
      >
        <p>Bạn có chắc chắn muốn chọn bản phác thảo này không?</p>
        <p>Sau khi chọn, hệ thống sẽ tự động tạo hợp đồng và bạn sẽ cần thanh toán 50% phí thiết kế để tiếp tục.</p>
      </Modal>

      {/* Add Revision Request Modal */}
      <Modal
        title="Yêu cầu phác thảo lại"
        open={isRevisionModalVisible}
        onCancel={handleCloseRevisionModal}
        onOk={handleSubmitRevision}
        confirmLoading={submitting}
        okText="Gửi yêu cầu"
        cancelText="Hủy bỏ"
      >
        <p>Vui lòng cho chúng tôi biết lý do bạn muốn phác thảo lại hoặc những điểm cần chỉnh sửa:</p>
        <TextArea
          rows={4}
          value={revisionNote}
          onChange={(e) => setRevisionNote(e.target.value)}
          placeholder="Ví dụ: Tôi muốn thay đổi màu sắc chủ đạo, thêm nhiều cây xanh hơn..."
        />
      </Modal>
    </>
  );
};

export default RecordSketch; 