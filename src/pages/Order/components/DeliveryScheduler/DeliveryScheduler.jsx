import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  DatePicker,
  TimePicker,
  Button,
  Typography,
  Space,
  message,
  Spin,
  Alert,
  Divider
} from 'antd';
import { CalendarOutlined, ClockCircleOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import locale from 'antd/es/date-picker/locale/vi_VN';

const { Title, Text } = Typography;

const DeliveryScheduler = ({ order, refreshAllData, api }) => {
  // Keep a reference to the latest order data for debugging
  const orderRef = useRef(order);
  useEffect(() => {
    orderRef.current = order;
    console.log("Order updated:", order?.id, "contructionDate:", order?.contructionDate);
  }, [order]);

  // Calculate the earliest available delivery date (2 days after modification date)
  const modificationDate = order?.modificationDate ? dayjs(order.modificationDate) : null;
  const earliestDeliveryDate = modificationDate ? 
    modificationDate.add(2, 'day') : 
    dayjs().add(2, 'day');
  const formattedEarliestDate = earliestDeliveryDate.format('DD/MM/YYYY');

  // Initialize with existing date/time if available
  const existingDate = order?.contructionDate ? dayjs(order.contructionDate) : null;
  const existingTime = order?.contructionTime ? dayjs(order.contructionTime, 'HH:mm:ss') : null;

  // State declarations
  const [selectedDate, setSelectedDate] = useState(existingDate || earliestDeliveryDate);
  const [selectedTime, setSelectedTime] = useState(existingTime);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(!existingDate); // Start in editing mode if no date set
  const [localConstruction, setLocalConstruction] = useState({
    date: order?.contructionDate || null,
    time: order?.contructionTime || null
  });

  // Update local state when order changes (after refreshAllData)
  useEffect(() => {
    
    // Only update if order construction date exists and has changed
    if (order?.contructionDate && 
        (order.contructionDate !== localConstruction.date || 
         order.contructionTime !== localConstruction.time)) {
      
      
      const newExistingDate = dayjs(order.contructionDate);
      const newExistingTime = dayjs(order.contructionTime, 'HH:mm:ss');
      
      setSelectedDate(newExistingDate);
      setSelectedTime(newExistingTime);
      setIsEditing(false);
      
      // Update local tracking state
      setLocalConstruction({
        date: order.contructionDate,
        time: order.contructionTime
      });
    }
  }, [order?.contructionDate, order?.contructionTime]);

  const disabledDate = (current) => {
    // Get the modification date from the order
    const modDate = order?.modificationDate ? dayjs(order.modificationDate) : null;
    
    // If modificationDate exists, disable dates before modificationDate + 2 days
    // Otherwise, just disable dates before today
    if (modDate) {
      const minAllowedDate = modDate.add(2, 'day');
      return current && current < minAllowedDate.startOf('day');
    }
    
    // Fallback to disabling dates before today
    return current && current < dayjs().endOf('day');
  };

  const formatTime = (time) => {
    if (!time) return null;
    return time.format('HH:mm:00');
  };

  const formatDate = (date) => {
    if (!date) return null;
    return date.format('YYYY-MM-DD');
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      message.error('Vui lòng chọn ngày và giờ giao hàng');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formattedDate = formatDate(selectedDate);
      const formattedTime = formatTime(selectedTime);
      
      console.log("Submitting new date/time:", formattedDate, formattedTime);
      
      const response = await api.put(`/api/serviceorder/contructor/${order.id}`, {
        contructionDate: formattedDate,
        contructionTime: formattedTime,
        contructionPrice: 0
      });

      if (response.status === 200) {
        // Immediately update local tracking state to reflect the change
        setLocalConstruction({
          date: formattedDate,
          time: formattedTime
        });
        
        message.success('Đã cập nhật lịch giao hàng thành công!');
        setIsEditing(false);
        
        try {
          // Refresh order data to update the status and construction date/time
          const updatedOrder = await refreshAllData(order.id);
          console.log("After refresh - updated order:", updatedOrder?.contructionDate);
        } catch (refreshError) {
          console.error("Error refreshing order data:", refreshError);
        }
        
        // Force update of local state with the submitted values
        // This ensures the UI reflects the user's choice even if the refreshAllData didn't update the order object
        setSelectedDate(dayjs(formattedDate));
        setSelectedTime(dayjs(formattedTime, 'HH:mm:ss'));
        
        // Force exit edit mode
        setIsEditing(false);
      } else {
        throw new Error('Cập nhật không thành công');
      }
    } catch (error) {
      message.error('Không thể cập nhật lịch giao hàng: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format existing date/time for display using local state first, then falling back to order object
  const displayDate = localConstruction.date || order?.contructionDate;
  const displayTime = localConstruction.time || order?.contructionTime;
  
  const formattedExistingDate = displayDate ? dayjs(displayDate).format('DD/MM/YYYY') : '';
  const formattedExistingTime = displayTime ? 
    (typeof displayTime === 'string' ? displayTime : dayjs(displayTime).format('HH:mm')) : '';

  return (
    <Card
      title={
        <Space>
          <CalendarOutlined style={{ color: '#4caf50' }} />
          <span>{(localConstruction.date || displayDate) && !isEditing ? 'Lịch giao hàng đã đặt' : 'Đặt lịch giao hàng'}</span>
        </Space>
      }
      style={{ 
        marginBottom: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}
      extra={
        (localConstruction.date || displayDate) && !isEditing && order?.status === 'PaymentSuccess' ? (
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => setIsEditing(true)}
          >
            Điều chỉnh lịch
          </Button>
        ) : null
      }
    >
      {(localConstruction.date || displayDate) && !isEditing ? (
        // Show current scheduled delivery
        <>
          <Alert
            message="Lịch giao hàng đã được xác nhận"
            description={
              <Space direction="vertical">
                <Text>
                  <Space>
                    <CalendarOutlined style={{ color: '#4caf50' }} />
                    <strong>Ngày giao hàng:</strong> {formattedExistingDate}
                  </Space>
                </Text>
                <Text>
                  <Space>
                    <ClockCircleOutlined style={{ color: '#4caf50' }} />
                    <strong>Thời gian:</strong> {formattedExistingTime}
                  </Space>
                </Text>
                <Text type="secondary">
                  Xin vui lòng đảm bảo có mặt tại địa chỉ đã đăng ký để nhận hàng theo lịch trên.
                </Text>
              </Space>
            }
            type="success"
            showIcon
          />
          
          {order?.status === 'PaymentSuccess' && (
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <Text type="secondary">
                Bạn vẫn có thể điều chỉnh lịch giao hàng bằng cách nhấn vào nút "Điều chỉnh lịch"
              </Text>
            </div>
          )}
        </>
      ) : (
        // Show form to schedule or update delivery
        <>
          {(localConstruction.date || displayDate) && (
            <>
              <Alert
                message="Điều chỉnh lịch giao hàng"
                description={
                  <Space direction="vertical">
                    <Text>Lịch giao hàng hiện tại: <strong>{formattedExistingDate}, {formattedExistingTime}</strong></Text>
                    <Text>Bạn có thể điều chỉnh lại lịch bên dưới.</Text>
                  </Space>
                }
                type="info"
                showIcon
                style={{ marginBottom: '20px' }}
              />
            </>
          )}
          
          <Text style={{ display: 'block', marginBottom: '20px' }}>
            {(localConstruction.date || displayDate) ? 'Vui lòng chọn thời gian mới phù hợp để chúng tôi giao hàng đến địa chỉ của bạn.' : 
            'Thanh toán của bạn đã hoàn tất. Vui lòng chọn ngày và thời gian thích hợp để chúng tôi giao hàng đến địa chỉ của bạn.'}
          </Text>
          
          <Alert
            message="Lưu ý về thời gian giao hàng"
            description={
              <Text>
                Để chuẩn bị sản phẩm và sắp xếp đội thi công, thời gian giao hàng sớm nhất là từ ngày <strong>{formattedEarliestDate}</strong> (sau 2 ngày kể từ ngày thanh toán).
              </Text>
            }
            type="info"
            showIcon
            style={{ marginBottom: '20px' }}
          />
          
          <Space direction="vertical" style={{ width: '100%', marginBottom: '20px' }}>
            <Space align="start" style={{ display: 'flex', marginBottom: '16px' }}>
              <CalendarOutlined style={{ fontSize: '20px', color: '#4caf50', marginTop: '6px' }} />
              <div>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Chọn ngày giao hàng:</Text>
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  disabledDate={disabledDate}
                  onChange={setSelectedDate}
                  placeholder="Chọn ngày"
                  locale={locale}
                  defaultValue={selectedDate}
                  value={selectedDate}
                />
              </div>
            </Space>
            
            <Space align="start" style={{ display: 'flex' }}>
              <ClockCircleOutlined style={{ fontSize: '20px', color: '#4caf50', marginTop: '6px' }} />
              <div>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Chọn thời gian giao hàng:</Text>
                <TimePicker
                  style={{ width: '100%' }}
                  format="HH:mm"
                  onChange={setSelectedTime}
                  placeholder="Chọn giờ"
                  minuteStep={15}
                  defaultValue={selectedTime}
                  value={selectedTime}
                />
              </div>
            </Space>
          </Space>
          
          <div style={{ textAlign: 'right' }}>
            {(localConstruction.date || displayDate) && (
              <Button 
                style={{ marginRight: '8px' }}
                onClick={() => setIsEditing(false)}
              >
                Hủy
              </Button>
            )}
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={!selectedDate || !selectedTime}
              icon={<CalendarOutlined />}
            >
              {(localConstruction.date || displayDate) ? 'Cập nhật lịch giao hàng' : 'Xác nhận lịch giao hàng'}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default DeliveryScheduler; 