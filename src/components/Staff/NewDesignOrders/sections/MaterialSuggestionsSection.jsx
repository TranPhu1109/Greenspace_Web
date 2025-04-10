import React, { useMemo } from 'react';
import { Card, Table, Image, Tag, Typography, Tooltip } from 'antd';
import './MaterialSuggestionsSection.scss';

const { Text } = Typography;

const MaterialSuggestionsSection = ({ materials = [] }) => {
  // Nhóm vật liệu theo danh mục
  const groupedMaterials = useMemo(() => {
    const grouped = {};
    materials.forEach(material => {
      if (!grouped[material.category]) {
        grouped[material.category] = [];
      }
      grouped[material.category].push(material);
    });
    return grouped;
  }, [materials]);

  const columns = [
    {
      title: 'Vật liệu',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="material-name">
          <span>{text}</span>
          <span className="material-price">{record.price.toLocaleString('vi-VN')}đ/{record.unit}</span>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 120,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: image => (
        <Image
          src={image}
          alt="Material"
          width={80}
          height={80}
          style={{ objectFit: 'cover' }}
        />
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: status => {
        let color = 'default';
        let text = 'Không xác định';
        
        if (status === 'recommended') {
          color = 'success';
          text = 'Đề xuất';
        } else if (status === 'alternative') {
          color = 'processing';
          text = 'Thay thế';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  return (
    <Card title="Đề xuất vật liệu" className="material-suggestions-section">
      {materials.length > 0 ? (
        <>
          <Table
            dataSource={materials}
            columns={columns}
            rowKey="id"
            pagination={false}
            rowClassName={(record) => record.status === 'recommended' ? 'recommended-material' : ''}
            expandable={{
              expandedRowRender: (record) => (
                <p style={{ margin: 0 }}>
                  <Text strong>Mô tả chi tiết:</Text> {record.description || record.note}
                </p>
              ),
              rowExpandable: (record) => record.description || record.note?.length > 50,
            }}
          />
          
          <div className="material-suggestions-summary">
            <Card size="small" title="Tổng chi phí vật liệu ước tính" className="cost-summary">
              {Object.keys(groupedMaterials).map(category => {
                const recommendedMaterial = groupedMaterials[category].find(m => m.status === 'recommended');
                if (recommendedMaterial) {
                  return (
                    <div key={category} className="category-cost">
                      <span className="category-name">{category}:</span>
                      <span className="category-price">{recommendedMaterial.price.toLocaleString('vi-VN')}đ/{recommendedMaterial.unit}</span>
                    </div>
                  );
                }
                return null;
              })}
              <div className="total-cost">
                <Text strong>Tổng chi phí ước tính:</Text>
                <Text strong className="total-price">
                  {materials
                    .filter(m => m.status === 'recommended')
                    .reduce((sum, item) => sum + item.price, 0)
                    .toLocaleString('vi-VN')}đ
                </Text>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <div className="empty-materials">
          <Text>Chưa có đề xuất vật liệu nào.</Text>
        </div>
      )}
    </Card>
  );
};

export default MaterialSuggestionsSection;