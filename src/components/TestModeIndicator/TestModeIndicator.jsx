import React, { useState } from 'react';
import { Alert, Collapse, Space, Tag, Tooltip, Typography } from 'antd';
import { ExperimentOutlined, ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import useTimeAdjustmentStore from '@/stores/useTimeAdjustmentStore';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Panel } = Collapse;

const TestModeIndicator = ({ style = {} }) => {
  const { isEnabled, getCurrentAdjustedTime, getAdjustmentInfo } = useTimeAdjustmentStore();

  // const [activeKey, setActiveKey] = useState([]);

  if (!isEnabled) return null;

  const adjustmentInfo = getAdjustmentInfo();
  const currentAdjustedTime = getCurrentAdjustedTime();
  const realTime = dayjs();

  // const handleCollapseChange = (key) => {
  //   setActiveKey(key);
  // };  

  // const isExpanded = Array.isArray(activeKey) ? activeKey.includes('1') : activeKey === '1';

  return (
    // <Alert
    //   message={
    //     <Space>
    //       {/* <ClockCircleOutlined /> */}
    //       <Text strong style={{ fontSize: '16px' }}>Đang giả lập thời gian</Text>
    //     </Space>
    //   }
    //   description={
    //     <Space direction="vertical" size="small" style={{ width: '100%' }}>
    //       <div>
    //         <Space>
    //           <ClockCircleOutlined />
    //           <Text>Thời gian thực:</Text>
    //           <Tag color="default">{realTime.format('DD/MM/YYYY HH:mm:ss')}</Tag>
    //         </Space>
    //       </div>
    //       <div>
    //         <Space>
    //           <ExperimentOutlined />
    //           <Text>Thời gian đã cài đặt:</Text>
    //           <Tag color="orange">{currentAdjustedTime.format('DD/MM/YYYY HH:mm:ss')}</Tag>
    //         </Space>
    //       </div>
    //       {adjustmentInfo.isActive && (
    //         <div>
    //           <Text type="secondary" style={{ fontSize: '12px' }}>
    //             {adjustmentInfo.message}
    //           </Text>
    //         </div>
    //       )}
    //     </Space>
    //   }
    //   type="warning"
    //   showIcon
    //   style={{
    //     marginBottom: 16,
    //     border: '2px solid #faad14',
    //     backgroundColor: '#fff7e6',
    //     ...style
    //   }}
    // />
    <Tooltip title="Hệ thống đang chạy với thời gian giả lập">
      <div className="test-mode-indicator">
        <Space size={4}>
          <ExperimentOutlined style={{ color: '#fa8c16' }} />
          <Text strong>Đang giả lập thời gian</Text>
          <Tag color="orange" style={{ marginLeft: 4 }}>
            {currentAdjustedTime.format('DD/MM/YYYY HH:mm:ss')}
          </Tag>
        </Space>
      </div>
    </Tooltip>
    // <Collapse
    //   bordered={false}
    //   expandIconPosition="end"
    //   activeKey={activeKey}
    //   onChange={handleCollapseChange}
    //   style={{
    //     backgroundColor: '#fff7e6',
    //     border: '2px solid #faad14',
    //     borderRadius: 8,
    //     ...style,
    //   }}
    // >
    //   <Panel
    //     key="1"
    //     header={
    //       <Space>
    //         {/* <ExperimentOutlined style={{ color: '#fa8c16' }} /> */}
    //         <Text strong style={{ fontSize: 16 }}>
    //           Đang giả lập thời gian
    //         </Text>
    //         {!isExpanded && (
    //           <Tag color="orange" style={{ marginLeft: 8 }}>
    //             {currentAdjustedTime.format('DD/MM/YYYY HH:mm:ss')}
    //           </Tag>
    //         )}
    //       </Space>
    //     }
    //   >
    //     <Space direction="vertical" size="small" style={{ width: '100%', marginLeft: 20 }}>
    //       <div>
    //         <Space>
    //           <ClockCircleOutlined />
    //           <Text>Thời gian thực:</Text>
    //           <Tag>{realTime.format('DD/MM/YYYY HH:mm:ss')}</Tag>
    //         </Space>
    //       </div>
    //       <div>
    //         <Space>
    //           <ExperimentOutlined />
    //           <Text>Thời gian đã cài đặt:</Text>
    //           <Tag color="volcano">{currentAdjustedTime.format('DD/MM/YYYY HH:mm:ss')}</Tag>
    //         </Space>
    //       </div>
    //       {adjustmentInfo.isActive && (
    //         <div>
    //           <Space>
    //             <InfoCircleOutlined />
    //             <Text type="secondary">{adjustmentInfo.message}</Text>
    //           </Space>
    //         </div>
    //       )}
    //     </Space>
    //   </Panel>
    // </Collapse>
  );
};

export default TestModeIndicator;
