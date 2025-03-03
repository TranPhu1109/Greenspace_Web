import React from 'react';
import { Typography, Card, List, Tag } from 'antd';

const { Title, Paragraph } = Typography;

const DesignRequirements = ({ requirements }) => {
  // Giả sử requirements là một chuỗi với mỗi yêu cầu được phân tách bằng dấu chấm
  const requirementsList = requirements.split('.').filter(item => item.trim() !== '');
  
  return (
    <div className="design-requirements-container">
      <Title level={5}>Yêu cầu thiết kế</Title>
      <Card>
        <List
          dataSource={requirementsList.length > 0 ? requirementsList : [requirements]}
          renderItem={(item, index) => (
            <List.Item>
              <Tag color="blue">{index + 1}</Tag>
              <Paragraph style={{ margin: 0 }}>{item.trim()}</Paragraph>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default DesignRequirements; 