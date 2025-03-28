import React from 'react';
import { Card, Row, Col, Image, Descriptions, Empty, Typography } from 'antd';
import './RequirementsSection.scss';

const { Text } = Typography;

const RequirementsSection = ({ requirements, attachments = [], dimensions, budget }) => {
  return (
    <Card title="Yêu cầu thiết kế" className="requirements-section">
      <div className="requirements-content">
        <h4>Mô tả yêu cầu:</h4>
        <p>{requirements || 'Không có mô tả yêu cầu'}</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <h4>Thông số kỹ thuật:</h4>
          {dimensions ? (
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Chiều rộng">{dimensions.width} m</Descriptions.Item>
              <Descriptions.Item label="Chiều dài">{dimensions.length} m</Descriptions.Item>
              <Descriptions.Item label="Chiều cao">{dimensions.height} m</Descriptions.Item>
              <Descriptions.Item label="Diện tích">{dimensions.area} m²</Descriptions.Item>
              {budget && (
                <Descriptions.Item label="Ngân sách">
                  <Text strong>{budget.toLocaleString('vi-VN')} VNĐ</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          ) : (
            <Empty description="Không có thông số kỹ thuật" />
          )}
        </Col>

        <Col xs={24} md={12}>
          <h4>Hình ảnh tham khảo:</h4>
          {attachments && attachments.length > 0 ? (
            <div className="attachments-gallery">
              <Row gutter={[16, 16]}>
                {attachments.map((attachment, index) => (
                  <Col xs={12} sm={8} md={12} lg={8} key={index}>
                    <div className="attachment-item">
                      <Image
                        src={attachment.url}
                        alt={attachment.name}
                        style={{ width: '100%', height: 120, objectFit: 'cover' }}
                      />
                      <div className="attachment-name">{attachment.name}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          ) : (
            <Empty description="Không có hình ảnh tham khảo" />
          )}
        </Col>
      </Row>
    </Card>
  );
};

export default RequirementsSection;