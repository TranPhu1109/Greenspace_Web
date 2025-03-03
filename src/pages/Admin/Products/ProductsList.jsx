import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Image, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Dropdown, 
  Menu, 
  Modal, 
  Form, 
  Select, 
  InputNumber, 
  Upload, 
  message, 
  Popconfirm,
  Switch,
  Tooltip,
  Divider,
  Tabs
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  UploadOutlined, 
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownOutlined,
  InboxOutlined,
  TagOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './ProductsList.scss';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;
const { confirm } = Modal;
const { TabPane } = Tabs;

const ProductsList = () => {
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [sortedInfo, setSortedInfo] = useState({});
  
  // Dữ liệu mẫu cho sản phẩm
  const [productsData, setProductsData] = useState([
    {
      key: '1',
      name: 'Ghế Sofa Scandinavian',
      thumbnail: 'https://via.placeholder.com/150',
      category: 'Sofa',
      type: 'furniture',
      price: 5500000,
      stock: 15,
      status: 'active',
      description: 'Ghế sofa phong cách Scandinavian với thiết kế tối giản, màu sắc trung tính, phù hợp với nhiều không gian nội thất.',
      variants: [
        { name: 'Xám', stock: 5 },
        { name: 'Xanh dương', stock: 5 },
        { name: 'Be', stock: 5 }
      ],
      createdAt: '15/01/2025',
    },
    {
      key: '2',
      name: 'Bàn ăn gỗ sồi',
      thumbnail: 'https://via.placeholder.com/150',
      category: 'Bàn',
      type: 'furniture',
      price: 3800000,
      stock: 10,
      status: 'active',
      description: 'Bàn ăn làm từ gỗ sồi tự nhiên, thiết kế hiện đại, bền đẹp theo thời gian.',
      variants: [
        { name: '4 chỗ', stock: 5 },
        { name: '6 chỗ', stock: 3 },
        { name: '8 chỗ', stock: 2 }
      ],
      createdAt: '20/01/2025',
    },
    {
      key: '3',
      name: 'Đèn treo tường Minimalist',
      thumbnail: 'https://via.placeholder.com/150',
      category: 'Đèn',
      type: 'decoration',
      price: 850000,
      stock: 25,
      status: 'active',
      description: 'Đèn treo tường phong cách tối giản, ánh sáng dịu nhẹ, tạo không gian ấm cúng.',
      variants: [
        { name: 'Đen', stock: 10 },
        { name: 'Trắng', stock: 10 },
        { name: 'Đồng', stock: 5 }
      ],
      createdAt: '25/01/2025',
    },
    {
      key: '4',
      name: 'Kệ sách gỗ công nghiệp',
      thumbnail: 'https://via.placeholder.com/150',
      category: 'Kệ sách',
      type: 'furniture',
      price: 2200000,
      stock: 12,
      status: 'active',
      description: 'Kệ sách làm từ gỗ công nghiệp cao cấp, thiết kế nhiều ngăn, phù hợp với phòng làm việc hoặc phòng khách.',
      variants: [
        { name: '3 tầng', stock: 4 },
        { name: '4 tầng', stock: 4 },
        { name: '5 tầng', stock: 4 }
      ],
      createdAt: '30/01/2025',
    },
    {
      key: '5',
      name: 'Thảm lông ngắn Bohemian',
      thumbnail: 'https://via.placeholder.com/150',
      category: 'Thảm',
      type: 'decoration',
      price: 1200000,
      stock: 20,
      status: 'active',
      description: 'Thảm lông ngắn phong cách Bohemian với họa tiết độc đáo, màu sắc tươi sáng, tạo điểm nhấn cho không gian.',
      variants: [
        { name: '120x180cm', stock: 10 },
        { name: '160x230cm', stock: 7 },
        { name: '200x290cm', stock: 3 }
      ],
      createdAt: '05/02/2025',
    },
    {
      key: '6',
      name: 'Cây Monstera',
      thumbnail: 'https://via.placeholder.com/150',
      category: 'Cây cảnh',
      type: 'decoration',
      price: 450000,
      stock: 30,
      status: 'active',
      description: 'Cây Monstera với lá xanh đặc trưng, dễ chăm sóc, phù hợp để trang trí trong nhà.',
      variants: [
        { name: 'Nhỏ', stock: 15 },
        { name: 'Vừa', stock: 10 },
        { name: 'Lớn', stock: 5 }
      ],
      createdAt: '10/02/2025',
    },
    {
      key: '7',
      name: 'Gối trang trí Velvet',
      thumbnail: 'https://via.placeholder.com/150',
      category: 'Gối trang trí',
      type: 'decoration',
      price: 350000,
      stock: 40,
      status: 'active',
      description: 'Gối trang trí chất liệu nhung mềm mại, màu sắc sang trọng, phù hợp với sofa hoặc giường ngủ.',
      variants: [
        { name: 'Xanh ngọc', stock: 10 },
        { name: 'Vàng đồng', stock: 10 },
        { name: 'Hồng pastel', stock: 10 },
        { name: 'Xám đậm', stock: 10 }
      ],
      createdAt: '15/02/2025',
    },
    {
      key: '8',
      name: 'Tủ quần áo gỗ tự nhiên',
      thumbnail: 'https://via.placeholder.com/150',
      category: 'Tủ',
      type: 'furniture',
      price: 7500000,
      stock: 8,
      status: 'active',
      description: 'Tủ quần áo làm từ gỗ tự nhiên, thiết kế hiện đại với nhiều ngăn chứa rộng rãi.',
      variants: [
        { name: '2 cánh', stock: 3 },
        { name: '3 cánh', stock: 3 },
        { name: '4 cánh', stock: 2 }
      ],
      createdAt: '20/02/2025',
    },
  ]);
  
  // Danh sách danh mục sản phẩm
  const categories = [
    'Cây nội thất',
    'Cây phong thủy',
    'Cây để bàn',
    'Cây văn phòng',
    'Cây ăn quả',
    'Cây cảnh sân vườn',
  ];
  
  // Lọc dữ liệu sản phẩm
  const filteredData = productsData
    .filter(item => {
      const nameMatch = item.name.toLowerCase().includes(searchText.toLowerCase());
      const categoryMatch = !filterCategory || item.category === filterCategory;
      const statusMatch = !filterStatus || item.status === filterStatus;
      return nameMatch && categoryMatch && statusMatch;
    });
  
  // Cấu hình cột cho bảng sản phẩm
  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <div className="product-info">
          <Image 
            src={record.thumbnail} 
            alt={record.name}
            width={60}
            height={60}
            className="product-thumbnail"
          />
          <div className="product-details">
            <Text className="product-name">{record.name}</Text>
            <div>
              <Tag color={record.type === 'furniture' ? 'blue' : 'green'}>
                {record.type === 'furniture' ? 'Nội thất' : 'Trang trí'}
              </Tag>
              <Text className="product-category">{record.category}</Text>
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString('vi-VN')} VND`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      sorter: (a, b) => a.stock - b.stock,
    },
    {
      title: 'Biến thể',
      key: 'variants',
      render: (_, record) => (
        <span>{record.variants.length} biến thể</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = status === 'active' ? 'green' : 'red';
        let text = status === 'active' ? 'Đang bán' : 'Ngừng bán';
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: 'Đang bán', value: 'active' },
        { text: 'Ngừng bán', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/admin/products/${record.key}`)}
            title="Xem chi tiết"
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
            title="Chỉnh sửa"
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này?"
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
  
  // Xử lý khi chọn hàng
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
  };
  
  // Xử lý khi thay đổi sắp xếp
  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };
  
  // Xử lý khi tìm kiếm
  const handleSearch = (value) => {
    setSearchText(value);
  };
  
  // Xử lý khi lọc theo danh mục
  const handleCategoryFilter = (value) => {
    setFilterCategory(value);
  };
  
  // Xử lý khi lọc theo trạng thái
  const handleStatusFilter = (value) => {
    setFilterStatus(value);
  };
  
  // Xử lý khi xóa sản phẩm
  const handleDelete = (key) => {
    setProductsData(productsData.filter(item => item.key !== key));
    message.success('Xóa sản phẩm thành công!');
  };
  
  // Xử lý khi xóa nhiều sản phẩm
  const handleBatchDelete = () => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa các sản phẩm đã chọn?',
      icon: <ExclamationCircleOutlined />,
      content: `Số lượng: ${selectedRowKeys.length} sản phẩm`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        setProductsData(productsData.filter(item => !selectedKeys.includes(item.key)));
        setSelectedRowKeys([]);
        message.success(`Đã xóa ${selectedRowKeys.length} sản phẩm!`);
      },
    });
  };
  
  // Xử lý khi thay đổi trạng thái sản phẩm
  const handleToggleStatus = (key) => {
    setProductsData(
      productsData.map(item => 
        item.key === key 
          ? { ...item, status: item.status === 'active' ? 'inactive' : 'active' } 
          : item
      )
    );
    message.success('Cập nhật trạng thái sản phẩm thành công!');
  };
  
  // Cập nhật modal thêm/sửa sản phẩm
  const showModal = (product = null) => {
    setEditingProduct(product);
    setIsModalVisible(true);
    
    if (product) {
      form.setFieldsValue({
        name: product.name,
        category: product.category,
        type: product.type,
        price: product.price,
        stock: product.stock,
        description: product.description,
        status: product.status === 'active',
        // Thêm các trường mới
        material: product.material || '',
        dimensions: product.dimensions || '',
        features: product.features ? product.features.join('\n') : '',
        variants: product.variants || []
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: true,
        type: 'furniture',
        variants: []
      });
    }
  };
  
  // Xử lý khi đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingProduct(null);
    form.resetFields();
  };
  
  // Xử lý khi submit form
  const handleSubmit = (values) => {
    const newProduct = {
      key: editingProduct ? editingProduct.key : `${productsData.length + 1}`,
      name: values.name,
      thumbnail: values.thumbnail || 'https://via.placeholder.com/150',
      category: values.category,
      type: values.type,
      price: values.price,
      stock: values.stock,
      description: values.description,
      status: values.status ? 'active' : 'inactive',
      material: values.material,
      dimensions: values.dimensions,
      features: values.features ? values.features.split('\n').filter(item => item.trim() !== '') : [],
      variants: values.variants || [],
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toLocaleDateString('vi-VN'),
    };

    if (editingProduct) {
      // Cập nhật sản phẩm
      setProductsData(productsData.map(item => 
        item.key === editingProduct.key ? newProduct : item
      ));
      message.success('Cập nhật sản phẩm thành công!');
    } else {
      // Thêm sản phẩm mới
      setProductsData([...productsData, newProduct]);
      message.success('Thêm sản phẩm thành công!');
    }

    setIsModalVisible(false);
    setEditingProduct(null);
    form.resetFields();
  };
  
  // Cấu hình upload ảnh
  const uploadProps = {
    name: 'file',
    multiple: true,
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} tải lên thành công.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} tải lên thất bại.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };
  
  return (
    <div className="products-list-container">
      <Card>
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <Title level={4}>Quản lý sản phẩm</Title>
          </Col>
          <Col>
            <Space>
              <Button 
                onClick={() => navigate('/admin/products/categories')}
                icon={<TagOutlined />}
              >
                Quản lý danh mục
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => showModal()}
              >
                Thêm sản phẩm
              </Button>
            </Space>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={8} md={6}>
            <Input 
              placeholder="Tìm kiếm sản phẩm" 
              prefix={<SearchOutlined />} 
              className="search-input"
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select 
              placeholder="Lọc theo danh mục" 
              style={{ width: '100%' }} 
              onChange={handleCategoryFilter}
              allowClear
            >
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select 
              placeholder="Lọc theo trạng thái" 
              style={{ width: '100%' }} 
              onChange={handleStatusFilter}
              allowClear
            >
              <Option value="active">Đang bán</Option>
              <Option value="inactive">Ngừng bán</Option>
            </Select>
          </Col>
        </Row>
        
        {selectedRowKeys.length > 0 && (
          <Row className="mb-4">
            <Col>
              <Space>
                <Button 
                  type="primary" 
                  danger
                  onClick={handleBatchDelete}
                >
                  Xóa {selectedRowKeys.length} sản phẩm
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
          onChange={handleChange}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} sản phẩm`,
          }}
          className="products-table"
        />
      </Card>
      
      {/* Modal thêm/sửa sản phẩm */}
      <Modal
        title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        visible={isModalVisible}
        onCancel={handleCancel}
        width={800}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Tabs defaultActiveKey="basic">
            <TabPane tab="Thông tin cơ bản" key="basic">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Tên sản phẩm"
                    rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
                  >
                    <Input placeholder="Nhập tên sản phẩm" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="category"
                    label="Danh mục"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                  >
                    <Select placeholder="Chọn danh mục">
                      <Option value="Ghế">Ghế</Option>
                      <Option value="Bàn">Bàn</Option>
                      <Option value="Sofa">Sofa</Option>
                      <Option value="Kệ sách">Kệ sách</Option>
                      <Option value="Tủ">Tủ</Option>
                      <Option value="Đèn">Đèn</Option>
                      <Option value="Thảm">Thảm</Option>
                      <Option value="Cây cảnh">Cây cảnh</Option>
                      <Option value="Gối trang trí">Gối trang trí</Option>
                      <Option value="Tranh & Khung ảnh">Tranh & Khung ảnh</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="type"
                    label="Loại sản phẩm"
                    rules={[{ required: true, message: 'Vui lòng chọn loại sản phẩm!' }]}
                  >
                    <Select placeholder="Chọn loại sản phẩm">
                      <Option value="furniture">Nội thất</Option>
                      <Option value="decoration">Trang trí</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="status"
                    label="Trạng thái"
                    valuePropName="checked"
                  >
                    <Switch 
                      checkedChildren="Đang bán" 
                      unCheckedChildren="Ngừng bán" 
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="price"
                    label="Giá bán"
                    rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
                  >
                    <InputNumber 
                      placeholder="Nhập giá bán" 
                      style={{ width: '100%' }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="stock"
                    label="Số lượng tồn kho"
                    rules={[{ required: true, message: 'Vui lòng nhập số lượng tồn kho!' }]}
                  >
                    <InputNumber 
                      placeholder="Nhập số lượng tồn kho" 
                      style={{ width: '100%' }}
                      min={0}
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="description"
                label="Mô tả sản phẩm"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả sản phẩm!' }]}
              >
                <TextArea 
                  placeholder="Nhập mô tả sản phẩm" 
                  rows={4}
                />
              </Form.Item>
            </TabPane>
            
            <TabPane tab="Thông số & Đặc điểm" key="specs">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="material"
                    label="Chất liệu"
                  >
                    <Input placeholder="Nhập chất liệu sản phẩm" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="dimensions"
                    label="Kích thước"
                  >
                    <Input placeholder="Nhập kích thước sản phẩm (D x R x C)" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="features"
                label="Đặc điểm nổi bật"
                extra="Mỗi đặc điểm một dòng"
              >
                <TextArea 
                  placeholder="Nhập đặc điểm nổi bật của sản phẩm" 
                  rows={4}
                />
              </Form.Item>
            </TabPane>
            
            <TabPane tab="Hình ảnh" key="images">
              <Form.Item
                name="thumbnail"
                label="Hình ảnh đại diện"
              >
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={() => false}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải lên</div>
                  </div>
                </Upload>
              </Form.Item>
              
              <Form.Item
                name="images"
                label="Hình ảnh sản phẩm"
              >
                <Dragger {...uploadProps} multiple>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Nhấp hoặc kéo thả file vào khu vực này để tải lên</p>
                  <p className="ant-upload-hint">
                    Hỗ trợ tải lên một hoặc nhiều file. Chỉ chấp nhận file hình ảnh JPG, PNG, GIF.
                  </p>
                </Dragger>
              </Form.Item>
            </TabPane>
            
            <TabPane tab="Biến thể" key="variants">
              <Form.List name="variants">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card 
                        key={key} 
                        size="small" 
                        style={{ marginBottom: 16 }}
                        extra={
                          <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                            onClick={() => remove(name)} 
                          />
                        }
                      >
                        <Row gutter={16}>
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, 'name']}
                              label="Tên biến thể"
                              rules={[{ required: true, message: 'Vui lòng nhập tên biến thể!' }]}
                            >
                              <Input placeholder="Ví dụ: Màu xám, Kích thước L" />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, 'price']}
                              label="Giá bán"
                              rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
                            >
                              <InputNumber 
                                placeholder="Nhập giá bán" 
                                style={{ width: '100%' }}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                min={0}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[name, 'stock']}
                              label="Tồn kho"
                              rules={[{ required: true, message: 'Vui lòng nhập số lượng tồn kho!' }]}
                            >
                              <InputNumber 
                                placeholder="Nhập tồn kho" 
                                style={{ width: '100%' }}
                                min={0}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                    <Form.Item>
                      <Button 
                        type="dashed" 
                        onClick={() => add()} 
                        block 
                        icon={<PlusOutlined />}
                      >
                        Thêm biến thể
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </TabPane>
          </Tabs>
          
          <Form.Item className="form-actions">
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {editingProduct ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductsList; 