import React, { useState } from 'react';
import { 
  Card, Table, Button, Space, Tag, Modal, Form, 
  Select, InputNumber, message, Statistic, Row, Col, Empty 
} from 'antd';
import { 
  EditOutlined, 
  CheckCircleOutlined, 
  ShoppingCartOutlined 
} from '@ant-design/icons';
import { customizableMaterials } from '../../mockData/templateOrders';
import './MaterialSection.scss';

const { Option } = Select;

const MaterialSection = ({ order, onUpdateStatus }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const calculateTotalCost = () => {
    if (!order.selectedMaterials || order.selectedMaterials.length === 0) {
      return {
        materialCost: 0,
        designFee: order.prices?.designFee || 0,
        total: order.prices?.designFee || 0
      };
    }

    const materialCost = order.selectedMaterials.reduce((total, material) => {
      return total + (material.selectedPrice || 0) * (material.quantity || 0);
    }, 0);

    return {
      materialCost,
      designFee: order.prices?.designFee || 0,
      total: materialCost + (order.prices?.designFee || 0)
    };
  };

  const handleEditMaterial = (record) => {
    setEditingMaterial(record);
    form.setFieldsValue({
      material: record.selected,
      quantity: record.quantity
    });
    setIsModalVisible(true);
  };

  const handleUpdateMaterial = async (values) => {
    setLoading(true);
    try {
      const selectedOption = customizableMaterials[editingMaterial.category]
        .options.find(opt => opt.name === values.material);

      const updatedMaterial = {
        ...editingMaterial,
        selected: values.material,
        selectedPrice: selectedOption.price,
        quantity: values.quantity
      };

      const updatedMaterials = order.selectedMaterials.map(item =>
        item.category === editingMaterial.category ? updatedMaterial : item
      );

      const costs = calculateTotalCost();
      const updatedOrder = {
        ...order,
        selectedMaterials: updatedMaterials,
        prices: {
          ...order.prices,
          totalMaterialCost: costs.materialCost,
          totalCost: costs.total
        },
        timeline: [
          ...order.timeline,
          {
            date: new Date().toISOString(),
            status: 'material_updated',
            description: `Cập nhật vật liệu: ${editingMaterial.category}`
          }
        ]
      };

      await onUpdateStatus(updatedOrder);
      setIsModalVisible(false);
      message.success('Đã cập nhật vật liệu');
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật vật liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMaterials = async () => {
    try {
      const updatedOrder = {
        ...order,
        status: 'material_ordered',
        timeline: [
          ...order.timeline,
          {
            date: new Date().toISOString(),
            status: 'material_ordered',
            description: 'Đã đặt vật liệu'
          }
        ]
      };

      await onUpdateStatus(updatedOrder);
      message.success('Đã xác nhận đặt vật liệu');
    } catch (error) {
      message.error('Có lỗi xảy ra khi xác nhận đặt vật liệu');
    }
  };

  const columns = [
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Vật liệu gốc',
      dataIndex: 'original',
      key: 'original',
      render: (text, record) => (
        <div>
          {text}
          <div className="price">
            {record.originalPrice?.toLocaleString('vi-VN')}đ/{record.unit}
          </div>
        </div>
      )
    },
    {
      title: 'Vật liệu đã chọn',
      dataIndex: 'selected',
      key: 'selected',
      render: (text, record) => (
        <div>
          {text}
          <div className="price">
            {record.selectedPrice?.toLocaleString('vi-VN')}đ/{record.unit}
          </div>
        </div>
      )
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record) => `${text} ${record.unit}`
    },
    {
      title: 'Thành tiền',
      key: 'total',
      render: (_, record) => (
        <span className="total-price">
          {((record.selectedPrice || 0) * (record.quantity || 0)).toLocaleString('vi-VN')}đ
        </span>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditMaterial(record)}
          >
            Cập nhật
          </Button>
        </Space>
      ),
    },
  ];

  const costs = calculateTotalCost();

  if (!order.selectedMaterials || order.selectedMaterials.length === 0) {
    return (
      <Card title="Quản lý vật liệu" className="material-section">
        <Empty description="Chưa có vật liệu nào được chọn" />
      </Card>
    );
  }

  return (
    <Card title="Quản lý vật liệu" className="material-section">
      <div className="material-list">
        <Table
          columns={columns}
          dataSource={order.selectedMaterials}
          rowKey="category"
          pagination={false}
        />
      </div>

      <Row gutter={[16, 16]} className="cost-summary">
        <Col span={8}>
          <Statistic
            title="Chi phí vật liệu"
            value={costs.materialCost}
            suffix="đ"
            groupSeparator=","
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Phí thiết kế"
            value={costs.designFee}
            suffix="đ"
            groupSeparator=","
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Tổng chi phí"
            value={costs.total}
            suffix="đ"
            groupSeparator=","
            className="total-cost"
          />
        </Col>
      </Row>

      <div className="actions">
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={handleConfirmMaterials}
          disabled={order.status === 'material_ordered'}
        >
          Xác nhận đặt vật liệu
        </Button>
      </div>

      <Modal
        title="Cập nhật vật liệu"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleUpdateMaterial}
          layout="vertical"
        >
          <Form.Item
            name="material"
            label="Chọn vật liệu"
            rules={[{ required: true, message: 'Vui lòng chọn vật liệu' }]}
          >
            <Select placeholder="Chọn vật liệu">
              {editingMaterial && customizableMaterials[editingMaterial.category]?.options.map(option => (
                <Option 
                  key={option.name} 
                  value={option.name}
                >
                  {option.name} - {option.price.toLocaleString('vi-VN')}đ/{option.unit}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              addonAfter={editingMaterial?.unit}
            />
          </Form.Item>

          <Form.Item className="form-actions">
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default MaterialSection; 