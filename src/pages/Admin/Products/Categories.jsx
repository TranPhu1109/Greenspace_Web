import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Modal, 
  Form, 
  message, 
  Popconfirm,
  Tag,
  Tooltip,
  Switch,
  Select
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Categories.scss';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;

const Categories = () => {
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  
  // Dữ liệu mẫu cho danh mục
  const [categoriesData, setCategoriesData] = useState([
    {
      key: '1',
      name: 'Ghế',
      type: 'furniture',
      description: 'Các loại ghế cho phòng khách, phòng ăn, văn phòng',
      productsCount: 25,
      status: 'active',
      createdAt: '15/01/2025',
    },
    {
      key: '2',
      name: 'Bàn',
      type: 'furniture',
      description: 'Các loại bàn cho phòng khách, phòng ăn, văn phòng',
      productsCount: 18,
      status: 'active',
      createdAt: '20/01/2025',
    },
    {
      key: '3',
      name: 'Kệ sách',
      type: 'furniture',
      description: 'Các loại kệ sách và kệ trưng bày',
      productsCount: 15,
      status: 'active',
      createdAt: '25/01/2025',
    },
    {
      key: '4',
      name: 'Đèn',
      type: 'decoration',
      description: 'Các loại đèn trang trí và đèn chiếu sáng',
      productsCount: 22,
      status: 'active',
      createdAt: '30/01/2025',
    },
    {
      key: '5',
      name: 'Thảm',
      type: 'decoration',
      description: 'Các loại thảm trang trí cho phòng khách, phòng ngủ',
      productsCount: 12,
      status: 'active',
      createdAt: '05/02/2025',
    },
    {
      key: '6',
      name: 'Cây cảnh',
      type: 'decoration',
      description: 'Các loại cây cảnh trang trí không gian sống',
      productsCount: 30,
      status: 'active',
      createdAt: '10/02/2025',
    },
    {
      key: '7',
      name: 'Gối trang trí',
      type: 'decoration',
      description: 'Các loại gối trang trí cho sofa, giường ngủ',
      productsCount: 20,
      status: 'active',
      createdAt: '15/02/2025',
    },
    {
      key: '8',
      name: 'Tủ',
      type: 'furniture',
      description: 'Các loại tủ quần áo, tủ giày, tủ kệ',
      productsCount: 16,
      status: 'active',
      createdAt: '20/02/2025',
    },
    {
      key: '9',
      name: 'Tranh & Khung ảnh',
      type: 'decoration',
      description: 'Các loại tranh và khung ảnh trang trí tường',
      productsCount: 25,
      status: 'active',
      createdAt: '25/02/2025',
    },
    {
      key: '10',
      name: 'Sofa',
      type: 'furniture',
      description: 'Các loại sofa và ghế dài cho phòng khách',
      productsCount: 14,
      status: 'active',
      createdAt: '01/03/2025',
    },
  ]);

  // Hiển thị modal thêm/sửa danh mục
  const showModal = (category = null) => {
    setEditingCategory(category);
    setIsModalVisible(true);
    
    if (category) {
      form.setFieldsValue({
        name: category.name,
        type: category.type,
        description: category.description,
        status: category.status === 'active',
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: true,
        type: 'furniture',
      });
    }
  };

  // Đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
    form.resetFields();
  };

  // Xử lý khi submit form
  const handleSubmit = (values) => {
    if (editingCategory) {
      // Cập nhật danh mục
      const updatedCategories = categoriesData.map(item => {
        if (item.key === editingCategory.key) {
          return {
            ...item,
            name: values.name,
            type: values.type,
            description: values.description,
            status: values.status ? 'active' : 'inactive',
          };
        }
        return item;
      });
      
      setCategoriesData(updatedCategories);
      message.success('Cập nhật danh mục thành công!');
    } else {
      // Thêm danh mục mới
      const newCategory = {
        key: `${categoriesData.length + 1}`,
        name: values.name,
        type: values.type,
        description: values.description,
        productsCount: 0,
        status: values.status ? 'active' : 'inactive',
        createdAt: new Date().toLocaleDateString('vi-VN'),
      };
      
      setCategoriesData([...categoriesData, newCategory]);
      message.success('Thêm danh mục thành công!');
    }
    
    setIsModalVisible(false);
    setEditingCategory(null);
    form.resetFields();
  };

  // Xóa danh mục
  const handleDelete = (key) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa danh mục này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        const updatedCategories = categoriesData.filter(item => item.key !== key);
        setCategoriesData(updatedCategories);
        message.success('Xóa danh mục thành công!');
      },
    });
  };

  // Xóa nhiều danh mục
  const handleBulkDelete = () => {
    confirm({
      title: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} danh mục đã chọn?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        const updatedCategories = categoriesData.filter(item => !selectedRowKeys.includes(item.key));
        setCategoriesData(updatedCategories);
        setSelectedRowKeys([]);
        message.success(`Đã xóa ${selectedRowKeys.length} danh mục!`);
      },
    });
  };

  // Tìm kiếm danh mục
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredData = categoriesData.filter(item => 
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.description.toLowerCase().includes(searchText.toLowerCase())
  );

  // Cấu hình cột cho bảng
  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        let color = type === 'furniture' ? 'blue' : 'green';
        let text = type === 'furniture' ? 'Nội thất' : 'Trang trí';
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: 'Nội thất', value: 'furniture' },
        { text: 'Trang trí', value: 'decoration' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        showTitle: false,
      },
      render: (description) => (
        <Tooltip placement="topLeft" title={description}>
          {description}
        </Tooltip>
      ),
    },
    {
      title: 'Số sản phẩm',
      dataIndex: 'productsCount',
      key: 'productsCount',
      sorter: (a, b) => a.productsCount - b.productsCount,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = status === 'active' ? 'green' : 'red';
        let text = status === 'active' ? 'Hoạt động' : 'Không hoạt động';
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: 'Hoạt động', value: 'active' },
        { text: 'Không hoạt động', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
            title="Chỉnh sửa"
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa danh mục này?"
            onConfirm={() => handleDelete(record.key)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              title="Xóa"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Cấu hình chọn hàng
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  return (
    <div className="categories-container">
      <Card className="mb-4">
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/admin/products')}
              >
                Quay lại
              </Button>
              <Title level={4} style={{ margin: 0 }}>
                Quản lý danh mục sản phẩm
              </Title>
            </Space>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              Thêm danh mục
            </Button>
          </Col>
        </Row>
      </Card>
      
      <Card>
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input 
              placeholder="Tìm kiếm danh mục..." 
              prefix={<SearchOutlined />} 
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
        </Row>
        
        {selectedRowKeys.length > 0 && (
          <Row className="mb-4">
            <Col>
              <Space>
                <Text>Đã chọn {selectedRowKeys.length} mục</Text>
                <Button 
                  type="primary" 
                  danger 
                  onClick={handleBulkDelete}
                >
                  Xóa đã chọn
                </Button>
                <Button 
                  onClick={() => setSelectedRowKeys([])}
                >
                  Bỏ chọn
                </Button>
              </Space>
            </Col>
          </Row>
        )}
        
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredData}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} danh mục`,
          }}
          className="categories-table"
        />
      </Card>
      
      {/* Modal thêm/sửa danh mục */}
      <Modal
        title={editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="Loại danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn loại danh mục!' }]}
          >
            <Select placeholder="Chọn loại danh mục">
              <Option value="furniture">Nội thất</Option>
              <Option value="decoration">Trang trí</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả danh mục!' }]}
          >
            <TextArea 
              placeholder="Nhập mô tả danh mục" 
              rows={4}
            />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Hoạt động" 
              unCheckedChildren="Không hoạt động" 
            />
          </Form.Item>
          
          <Form.Item className="form-actions">
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {editingCategory ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories; 