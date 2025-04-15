import React from "react";
import { Card, Image, Row, Col, Empty } from "antd";
import { PictureOutlined } from "@ant-design/icons";

const OriginalImages = ({ order, recordLoading }) => {
  if (!order?.image || (!order.image.imageUrl && !order.image.image2 && !order.image.image3)) {
    return (
      <Card 
        title={
          <span style={{ fontSize: '18px', fontWeight: '600', color: '#4caf50', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PictureOutlined /> Hình ảnh khách hàng cung cấp
          </span>
        } 
        style={{ marginBottom: '24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
      >
        <Empty description="Không có hình ảnh nào được cung cấp" />
      </Card>
    );
  }

  return (
    <Card
      title={
        <span style={{ fontSize: '18px', fontWeight: '600', color: '#4caf50', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PictureOutlined /> Hình ảnh khách hàng cung cấp
        </span>
      }
      style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}
      loading={recordLoading}
    >
      <Image.PreviewGroup>
        <Row gutter={[12, 12]}>
          {order.image?.imageUrl && (
            <Col xs={24} sm={12} md={8}>
              <Image
                src={order.image.imageUrl}
                alt="Ảnh gốc 1"
                style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }}
              />
            </Col>
          )}
          {order.image?.image2 && (
            <Col xs={24} sm={12} md={8}>
              <Image
                src={order.image.image2}
                alt="Ảnh gốc 2"
                style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }}
              />
            </Col>
          )}
          {order.image?.image3 && (
            <Col xs={24} sm={12} md={8}>
              <Image
                src={order.image.image3}
                alt="Ảnh gốc 3"
                style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px' }}
              />
            </Col>
          )}
        </Row>
      </Image.PreviewGroup>
    </Card>
  );
};

export default OriginalImages; 