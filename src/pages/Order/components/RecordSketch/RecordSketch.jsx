import React, { useState, useEffect } from "react";
import { Card, Image, Row, Col, Empty, Tag, Button, Popconfirm, Typography, Modal, Input, message, notification } from "antd";
import { PictureOutlined, CheckCircleOutlined, EditOutlined, StopOutlined } from "@ant-design/icons";
import api from "@/api/api";
import EditorComponent from '@/components/Common/EditorComponent';

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

  // For testing/debugging in the browser
  const debugLogPhases = () => {
    console.log('DEBUG RecordSketch - Current Status:', order?.status);
    console.log('DEBUG RecordSketch - Max Phase:', maxPhase);
    console.log('DEBUG RecordSketch - Can View Phase 1:', canViewPhase1Sketches());
    console.log('DEBUG RecordSketch - Can View Phase 2:', canViewPhase2Sketches());
    console.log('DEBUG RecordSketch - All Sketch Records:', sketchRecords);
    console.log('DEBUG RecordSketch - Phases to Display:', getPhasesToDisplay());
  };

  // Call this once per render to help with debugging
  React.useEffect(() => {
    console.log('DEBUG RecordSketch - Initial render');
  }, []);

  // Check which statuses allow viewing phase 1 sketches
  const canViewPhase1Sketches = () => {
    const phase1Statuses = [
      'DoneDesign', 'PaymentSuccess', 'Processing', 'PickedPackageAndDelivery',
      'DeliveryFail', 'ReDelivery', 'DeliveredSuccessfully', 'CompleteOrder',
      'WaitDeposit', 'DoneDeterminingDesignPrice', 'ReConsultingAndSketching',
      'DepositSuccessful', 'DeterminingMaterialPrice', 'ReDesign'
    ];

    const phase1StatusCodes = [6, 7, 8, 9, 10, 11, 12, 13, 21, 22, 23];

    // Special case: Check if there's a record with phase 2 or higher and status is DeterminingDesignPrice
    const hasPhase2OrHigherRecord = sketchRecords?.some(record => record.phase >= 2);

    if (hasPhase2OrHigherRecord && (order?.status === 'DeterminingDesignPrice' || order?.status === 2)) {
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
      // 'DeterminingDesignPrice' is NOT included for phase 2 by default
    ];
    const phase2StatusCodes = [6, 7, 8, 9, 10, 11, 12, 13, 21, 22, 23, 24];  // Status code 2 is NOT included by default

    // Special case: If there's a phase 3 record and status is DeterminingDesignPrice, allow viewing phase 2
    const hasPhase3OrHigherRecord = sketchRecords?.some(record => record.phase >= 3);

    if (hasPhase3OrHigherRecord && (order?.status === 'DeterminingDesignPrice' || order?.status === 2)) {
      return true;
    }

    return phase2Statuses.includes(order?.status) || phase2StatusCodes.includes(order?.status);
  };

  // Function to check if a specific phase (3 or higher) should be visible
  const canViewHigherPhase = (phase) => {
    // For phase 3+, only show when status is DoneDeterminingDesignPrice or later
    if (phase >= 3) {
      // Don't show phase 3+ during DeterminingDesignPrice regardless of other conditions
      if (order?.status === 'DeterminingDesignPrice' || order?.status === 2) {
        console.log(`DEBUG: Hiding phase ${phase} because status is DeterminingDesignPrice`);
        return false;
      }

      // Don't show phase 3+ during ReConsultingAndSketching
      if (order?.status === 'ReConsultingAndSketching' || order?.status === 19) {
        console.log(`DEBUG: Hiding phase ${phase} because status is ReConsultingAndSketching`);
        return false;
      }

      const allowedStatuses = [
        'DoneDesign', 'PaymentSuccess', 'Processing', 'PickedPackageAndDelivery',
        'DeliveryFail', 'ReDelivery', 'DeliveredSuccessfully', 'CompleteOrder',
        'WaitDeposit', 'DoneDeterminingDesignPrice', 'DepositSuccessful',
        'DeterminingMaterialPrice'
      ];
      const allowedStatusCodes = [6, 7, 8, 9, 10, 11, 12, 13, 21, 22, 23];

      return allowedStatuses.includes(order?.status) || allowedStatusCodes.includes(order?.status);
    }

    return true; // For phases below 3, use the standard checks
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
      setIsConfirmModalVisible(false);

      // Second step: Update status to WaitDeposit (status code 21)
      try {
        await updateStatus(order.id, 21);

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
  const handleShowRevisionModal = () => {
    // Template mẫu cho phản hồi
    const revisionTemplate = `<h3>Yêu cầu phác thảo lại</h3>
<p>Sau khi xem xét bản phác thảo, tôi muốn yêu cầu một số điều chỉnh sau:</p>

<h4>Những điểm cần thay đổi:</h4>
<ul>
  <li>...</li>
  <li>...</li>
</ul>

<h4>Ý tưởng mới:</h4>
<p>...</p>

<h4>Các yếu tố cần giữ nguyên:</h4>
<ul>
  <li>...</li>
</ul>`;

    setRevisionNote(revisionTemplate);
    setIsRevisionModalVisible(true);
  };

  const handleCloseRevisionModal = () => {
    setIsRevisionModalVisible(false);
  };

  const handleSubmitRevision = async () => {
    // Kiểm tra nội dung rich text có trống không 
    // (loại bỏ các thẻ HTML trống và khoảng trắng)
    const isEmptyContent = !revisionNote ||
      revisionNote.replace(/<[^>]*>/g, '').trim() === '';

    if (isEmptyContent) {
      message.error('Vui lòng nhập lý do bạn muốn phác thảo lại');
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
          dateAppointment: latestTask.dateAppointment,
          timeAppointment: latestTask.timeAppointment,
          status: 0, // ConsultingAndSket status code
          note: revisionNote // Add customer's note to the task
        });
      } else {
        console.warn("No work tasks found for this order");
      }

      notification.success({ content: "Đã gửi yêu cầu phác thảo lại thành công." });
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

    // Special case: For DeterminingDesignPrice with phase 3 sketches, forcibly include phase 2
    const hasPhase3 = sketchRecords?.some(record => record.phase >= 3);
    const isDeterminingPrice = order?.status === 'DeterminingDesignPrice' || order?.status === 2;
    const isReConsulting = order?.status === 'ReConsultingAndSketching' || order?.status === 19;

    // Add phase 2 if status permits and it exists
    if ((canViewPhase2Sketches() && maxPhase >= 2) || 
        ((hasPhase3 || maxPhase >= 3) && (isDeterminingPrice || isReConsulting) && maxPhase >= 2)) {
      phases.push(2);
    }

    // Add any higher phases if they exist and status permits viewing them
    if (maxPhase > 2) {
      for (let i = 3; i <= maxPhase; i++) {
        // Check if this higher phase should be visible based on current status
        if (canViewHigherPhase(i)) {
          phases.push(i);
        }
      }
    }

    return phases.sort();
  };

  const phasesToDisplay = getPhasesToDisplay();

  // Call debug logging function after all other functions are defined
  React.useEffect(() => {
    if (order && sketchRecords) {
      debugLogPhases();
    }
  }, [order?.status, sketchRecords, maxPhase]);

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
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              {!sketchRecords.some(r => r.isSelected) && maxPhase >= 1 && (
                <Text type="secondary" style={{ marginTop: '8px' }}>Vui lòng chọn một bản phác thảo hoặc thực hiện hành động khác.</Text>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(maxPhase === 1 || maxPhase === 2) && !sketchRecords.some(r => r.isSelected) && (
                  <Button
                    icon={<EditOutlined />}
                    onClick={handleShowRevisionModal}
                    disabled={isSubmitting || externalIsSubmitting || recordLoading || submitting}
                    loading={submitting}
                  >
                    Yêu cầu phác thảo lại
                  </Button>
                )}
                {maxPhase >= 1 && !sketchRecords.some(r => r.isSelected) && order?.status !== 'WaitDeposit' && order?.status !== 21 && (
                  <Popconfirm
                    title="Bạn chắc chắn muốn hủy đơn hàng này?"
                    onConfirm={handleCancelOrder}
                    okText="Xác nhận hủy"
                    cancelText="Không"
                    okButtonProps={{ danger: true }}
                    disabled={isSubmitting || externalIsSubmitting || recordLoading}
                  >
                    <Button
                      danger
                      icon={<StopOutlined />}
                      loading={isSubmitting && order?.status === 'OrderCancelled'}
                      disabled={isSubmitting || externalIsSubmitting || recordLoading}
                    >
                      Hủy đơn hàng
                    </Button>
                  </Popconfirm>
                )}
              </div>
            </div>
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
        width={800}
      >
        <div style={{
          backgroundColor: '#f6ffed',
          border: '1px solid #b7eb8f',
          padding: '12px 16px',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          <Typography.Title level={5} style={{ color: '#52c41a', marginTop: 0 }}>
            Hướng dẫn phản hồi
          </Typography.Title>
          <Typography.Paragraph>
            Vui lòng cung cấp chi tiết về những điều bạn muốn thay đổi hoặc điều chỉnh trong bản phác thảo.
          </Typography.Paragraph>
          <Typography.Paragraph strong>
            Những thông tin cần đề cập:
          </Typography.Paragraph>
          <ul style={{ paddingLeft: '20px', marginBottom: '8px' }}>
            <li>Mô tả cụ thể những phần bạn muốn thay đổi</li>
            <li>Ý tưởng hoặc phong cách mới mà bạn mong muốn</li>
            <li>Các yếu tố cần giữ nguyên từ bản phác thảo hiện tại</li>
          </ul>
        </div>

        <EditorComponent
          value={revisionNote}
          onChange={(content) => setRevisionNote(content)}
          height={450}
        />
      </Modal>
    </>
  );
};

export default RecordSketch; 