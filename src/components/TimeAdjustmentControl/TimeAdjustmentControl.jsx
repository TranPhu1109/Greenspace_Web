import React, { useState, useEffect } from 'react';
import {
  Card,
  Switch,
  InputNumber,
  Button,
  Space,
  Typography,
  Divider,
  Alert,
  Modal,
  DatePicker,
  TimePicker,
  Row,
  Col,
  Tag,
  Tooltip,
  Select
} from 'antd';
import {
  ClockCircleOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  BugOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import useTimeAdjustmentStore from '@/stores/useTimeAdjustmentStore';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const TimeAdjustmentControl = ({ compact = false }) => {
  const {
    isEnabled,
    adjustmentHours,
    adjustmentMinutes,
    debugMode,
    setEnabled,
    setAdjustmentHours,
    setAdjustmentMinutes,
    setDebugMode,
    setAdjustmentToMatchDateTime,
    reset,
    getCurrentAdjustedTime,
    getAdjustmentInfo,
    getTargetDateTime
  } = useTimeAdjustmentStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [quickSetDate, setQuickSetDate] = useState(null);
  const [quickSetTime, setQuickSetTime] = useState(null);
  const [quickSetMode, setQuickSetMode] = useState('exact'); // 'exact' or 'early'

  // Khôi phục lại date/time từ adjustment khi component mount hoặc khi isEnabled thay đổi
  useEffect(() => {
    if (isEnabled) {
      const targetDateTime = getTargetDateTime();
      if (targetDateTime) {
        // Mặc định hiển thị thời gian đã điều chỉnh (có thể là exact hoặc early)
        setQuickSetDate(dayjs(targetDateTime.date));
        setQuickSetTime(dayjs(`2000-01-01 ${targetDateTime.time}`));

        // Thử phát hiện chế độ bằng cách kiểm tra xem có phải là early mode không
        // Nếu thời gian hiện tại + 15 phút có ý nghĩa hơn thì có thể là early mode
        // Nhưng để đơn giản, ta sẽ mặc định là exact mode
        setQuickSetMode('exact');
      }
    } else {
      setQuickSetDate(null);
      setQuickSetTime(null);
      setQuickSetMode('exact');
    }
  }, [isEnabled, getTargetDateTime]);

  const adjustmentInfo = getAdjustmentInfo();
  const currentAdjustedTime = getCurrentAdjustedTime();

  const handleQuickSet = () => {
    if (quickSetDate && quickSetTime) {
      const dateStr = quickSetDate.format('YYYY-MM-DD');
      const timeStr = quickSetTime.format('HH:mm');

      if (quickSetMode === 'early') {
        // Điều chỉnh sớm hơn 15 phút
        const targetDateTime = dayjs(`${dateStr} ${timeStr}:00`); // Thêm giây để đảm bảo format chính xác
        const earlyDateTime = targetDateTime.subtract(15, 'minute');
        setAdjustmentToMatchDateTime(earlyDateTime.format('YYYY-MM-DD'), earlyDateTime.format('HH:mm'));
      } else {
        // Đảm bảo format chính xác với giây
        const targetDateTime = dayjs(`${dateStr} ${timeStr}:00`);
        setAdjustmentToMatchDateTime(dateStr, timeStr);
      }

      setIsModalVisible(false);
      setQuickSetDate(null);
      setQuickSetTime(null);
    }
  };

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Tooltip title={isEnabled ? "Tắt giả lập thời gian" : "Bật giả lập thời gian"}>
          <Button
            type={isEnabled ? 'text' : 'text'}
            icon={<SettingOutlined />}
            // size="middle"
            onClick={() => setIsModalVisible(true)}
            danger={isEnabled}
          >
            {isEnabled ? 'Cài đặt thời gian' : 'Cài đặt thời gian'}
          </Button>
        </Tooltip>

        {/* {adjustmentInfo.isActive && (
          <Tag color="orange" icon={<ClockCircleOutlined />}>
            Thời gian được cài đặt: {currentAdjustedTime.format('DD/MM/YYYY - HH:mm')}
          </Tag>
        )} */}

        <Modal
          title={
            <Space>
              <ClockCircleOutlined />
              <span>Giả lập thời gian</span>
            </Space>
          }
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={700}
        >
          <TimeAdjustmentControl compact={false} />
        </Modal>
      </div>
    );
  }

  return (
    <Card
      title={
        <Space>
          {/* <ExperimentOutlined /> */}
          <span>Điều chỉnh thời gian</span>
        </Space>
      }
      size="small"
    >
      <Alert
        message="Giả lập thời gian cho phép điều chỉnh thời gian để kiểm tra các tính năng liên quan đến thời gian trong tương lai"
        description="Có thể điều chỉnh đúng thời gian hoặc sớm hơn 15 phút so với thời gian hẹn"
        type="warning"
        icon={<ExperimentOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <Space size="large">
            <div>
              <Text strong>Giả lập thời gian:</Text>
              <br />
              <Switch
                checked={isEnabled}
                onChange={setEnabled}
                checkedChildren="Bật"
                unCheckedChildren="Tắt"
                size="default"
              />
            </div>

            {isEnabled && (
              <div>
                <Text strong>Thời gian giả lập:</Text>
                <br />
                <Tag color="orange" style={{ fontSize: '14px', padding: '4px 8px' }}>
                  {currentAdjustedTime.format('DD/MM/YYYY HH:mm:ss')}
                </Tag>
              </div>
            )}
          </Space>
        </div>

        {isEnabled && (
          <>
            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Chọn ngày hẹn:</Text>
                  <DatePicker
                    placeholder="Chọn ngày"
                    value={quickSetDate}
                    onChange={setQuickSetDate}
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                  />
                </Space>
              </Col>

              <Col span={12}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Chọn giờ hẹn:</Text>
                  <TimePicker
                    placeholder="Chọn giờ"
                    value={quickSetTime}
                    onChange={setQuickSetTime}
                    style={{ width: '100%' }}
                    format="HH:mm"
                  />
                </Space>
              </Col>
            </Row>

            <Row gutter={8}>
              <Col span={12}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Chế độ điều chỉnh:</Text>
                  <Select
                    value={quickSetMode}
                    onChange={setQuickSetMode}
                    style={{ width: '100%' }}
                    options={[
                      { value: 'exact', label: 'Đúng thời gian hẹn' },
                      { value: 'early', label: 'Sớm hơn 15 phút' }
                    ]}
                  />
                </Space>
              </Col>

              <Col span={12}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>&nbsp;</Text>
                  <Button
                    type="primary"
                    icon={<CalendarOutlined />}
                    onClick={handleQuickSet}
                    disabled={!quickSetDate || !quickSetTime}
                    style={{ width: '100%' }}
                    size="large"
                  >
                    Áp dụng
                  </Button>
                </Space>
              </Col>
            </Row>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Button
                icon={<CloseCircleOutlined />}
                onClick={reset}
                type="default"
                danger
              >
                Tắt giả lập thời gian
              </Button>
            </div>
          </>
        )}
      </Space>
    </Card>
  );
};

export default TimeAdjustmentControl;
