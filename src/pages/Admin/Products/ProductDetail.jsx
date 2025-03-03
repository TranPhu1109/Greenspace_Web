import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Descriptions, 
  Button, 
  Space, 
  Tabs, 
  Tag, 
  Image, 
  Divider,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  message,
  Modal,
  Upload,
  Statistic,
  Table
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  SaveOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  UploadOutlined,
  ShoppingOutlined,
  DollarOutlined,
  InboxOutlined,
  TagOutlined,
  ExclamationCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetail.scss';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  
  // Dữ liệu mẫu cho sản phẩm
  const [productData, setProductData] = useState({
    id,
    name: 'Ghế Sofa Scandinavian',
    thumbnail: 'https://via.placeholder.com/150',
    category: 'Sofa',
    type: 'furniture',
    price: 5500000,
    stock: 15,
    status: 'active',
    description: 'Ghế sofa phong cách Scandinavian với thiết kế tối giản, màu sắc trung tính, phù hợp với nhiều không gian nội thất.',
    features: [
      'Thiết kế tối giản, hiện đại',
      'Chất liệu vải bọc cao cấp, dễ vệ sinh',
      'Khung gỗ tự nhiên chắc chắn',
      'Đệm mút đàn hồi, êm ái'
    ],
    specifications: {
      material: 'Khung gỗ tự nhiên, vải bọc polyester',
      dimensions: 'D220 x R85 x C75 cm',
      weight: '45 kg',
      warranty: '24 tháng',
      origin: 'Việt Nam',
      assembly: 'Cần lắp ráp',
    },
    careInstructions: 'Vệ sinh bằng khăn ẩm, tránh ánh nắng trực tiếp, không đặt gần nguồn nhiệt.',
    images: [
      'https://via.placeholder.com/800x600',
      'https://via.placeholder.com/800x600',
      'https://via.placeholder.com/800x600',
    ],
    variants: [
      {
        key: '1',
        name: 'Xám',
        price: 5500000,
        stock: 5
      },
      {
        key: '2',
        name: 'Xanh dương',
        price: 5700000,
        stock: 5
      },
      {
        key: '3',
        name: 'Be',
        price: 5500000,
        stock: 5
      }
    ],
    relatedProducts: [
      {
        key: '2',
        name: 'Bàn cà phê gỗ sồi',
        thumbnail: 'https://via.placeholder.com/150',
        price: 1800000
      },
      {
        key: '3',
        name: 'Đèn sàn Minimalist',
        thumbnail: 'https://via.placeholder.com/150',
        price: 950000
      },
      {
        key: '4',
        name: 'Thảm lông ngắn Bohemian',
        thumbnail: 'https://via.placeholder.com/150',
        price: 1200000
      }
    ],
    createdAt: '15/01/2025',
    updatedAt: '20/01/2025',
    salesCount: 12,
    views: 245
  });
  
  // Xử lý khi chuyển tab
  const handleTabChange = (key) => {
    setActiveTab(key);
  };
  
  // Xử lý khi bật/tắt chế độ chỉnh sửa
  const toggleEdit = () => {
    if (isEditing) {
      // Nếu đang ở chế độ chỉnh sửa, chuyển sang chế độ xem
      setIsEditing(false);
    } else {
      // Nếu đang ở chế độ xem, chuyển sang chế độ chỉnh sửa
      form.setFieldsValue({
        name: productData.name,
        category: productData.category,
        type: productData.type,
        price: productData.price,
        stock: productData.stock,
        description: productData.description,
        features: productData.features.join('\n'),
        material: productData.specifications.material,
        dimensions: productData.specifications.dimensions,
        weight: productData.specifications.weight,
        warranty: productData.specifications.warranty,
        origin: productData.specifications.origin,
        assembly: productData.specifications.assembly,
        careInstructions: productData.careInstructions,
        status: productData.status === 'active',
      });
      setIsEditing(true);
    }
  };
  
  // Xử lý khi lưu thông tin sản phẩm
  const handleSave = () => {
    form.validateFields().then(values => {
      const updatedProduct = {
        ...productData,
        name: values.name,
        category: values.category,
        type: values.type,
        price: values.price,
        stock: values.stock,
        description: values.description,
        features: values.features.split('\n').filter(item => item.trim() !== ''),
        specifications: {
          material: values.material,
          dimensions: values.dimensions,
          weight: values.weight,
          warranty: values.warranty,
          origin: values.origin,
          assembly: values.assembly,
        },
        careInstructions: values.careInstructions,
        status: values.status ? 'active' : 'inactive',
        updatedAt: new Date().toLocaleDateString('vi-VN'),
      };
      
      setProductData(updatedProduct);
      setIsEditing(false);
      message.success('Cập nhật sản phẩm thành công!');
    });
  };
  
  // Xử lý khi xóa sản phẩm
  const handleDelete = () => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        message.success('Xóa sản phẩm thành công!');
        navigate('/admin/products');
      },
    });
  };
  
  // Cấu hình upload ảnh
  const uploadProps = {
    name: 'file',
    multiple: true,
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    onChange(info) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} tải lên thành công.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} tải lên thất bại.`);
      }
    },
  };
  
  return (
    <div className="product-detail-container">
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
              <Title level={4}>Chi tiết sản phẩm</Title>
            </Space>
          </Col>
          <Col>
            <Space>
              {isEditing ? (
                <>
                  <Button onClick={() => setIsEditing(false)}>
                    Hủy
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />} 
                    onClick={handleSave}
                  >
                    Lưu
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />} 
                    onClick={toggleEdit}
                  >
                    Chỉnh sửa
                  </Button>
                  <Button 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={handleDelete}
                  >
                    Xóa
                  </Button>
                </>
              )}
            </Space>
          </Col>
        </Row>
      </Card>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <div className="product-main-info">
              <div className="product-thumbnail">
                <Image
                  src={productData.thumbnail}
                  alt={productData.name}
                  width="100%"
                />
              </div>
              
              <div className="product-basic-info">
                {isEditing ? (
                  <Form
                    form={form}
                    layout="vertical"
                  >
                    <Form.Item
                      name="name"
                      label="Tên sản phẩm"
                      rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
                    >
                      <Input placeholder="Nhập tên sản phẩm" />
                    </Form.Item>
                    
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="category"
                          label="Danh mục"
                          rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                        >
                          <Select placeholder="Chọn danh mục">
                            <Option value="Sofa">Sofa</Option>
                            <Option value="Bàn">Bàn</Option>
                            <Option value="Ghế">Ghế</Option>
                            <Option value="Kệ sách">Kệ sách</Option>
                            <Option value="Đèn">Đèn</Option>
                            <Option value="Thảm">Thảm</Option>
                            <Option value="Cây cảnh">Cây cảnh</Option>
                            <Option value="Gối trang trí">Gối trang trí</Option>
                            <Option value="Tủ">Tủ</Option>
                            <Option value="Tranh & Khung ảnh">Tranh & Khung ảnh</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="type"
                          label="Loại"
                          rules={[{ required: true, message: 'Vui lòng chọn loại!' }]}
                        >
                          <Select placeholder="Chọn loại">
                            <Option value="furniture">Nội thất</Option>
                            <Option value="decoration">Trang trí</Option>
                          </Select>
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
                          label="Tồn kho"
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
                      name="status"
                      label="Trạng thái"
                      valuePropName="checked"
                    >
                      <Switch 
                        checkedChildren="Đang bán" 
                        unCheckedChildren="Ngừng bán" 
                      />
                    </Form.Item>
                  </Form>
                ) : (
                  <>
                    <Title level={4}>{productData.name}</Title>
                    <Space>
                      <Tag color={productData.type === 'furniture' ? 'blue' : 'green'}>
                        {productData.type === 'furniture' ? 'Nội thất' : 'Trang trí'}
                      </Tag>
                      <Tag color="default">{productData.category}</Tag>
                    </Space>
                    <div className="product-price">
                      <Title level={5}>{productData.price.toLocaleString('vi-VN')} VND</Title>
                    </div>
                    <div className="product-stock">
                      <Text>Tồn kho: {productData.stock}</Text>
                    </div>
                    <div className="mt-4">
                      <Tag color={productData.status === 'active' ? 'green' : 'red'}>
                        {productData.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                      </Tag>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic 
                  title="Đã bán" 
                  value={productData.salesCount} 
                  prefix={<ShoppingOutlined />} 
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Lượt xem" 
                  value={productData.views} 
                  prefix={<EyeOutlined />} 
                />
              </Col>
            </Row>
            
            <Divider />
            
            <div>
              <Text type="secondary">Ngày tạo: {productData.createdAt}</Text>
              <br />
              <Text type="secondary">Cập nhật lần cuối: {productData.updatedAt}</Text>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={16}>
          <Card>
            <Tabs activeKey={activeTab} onChange={handleTabChange}>
              <TabPane tab="Thông tin sản phẩm" key="info">
                <div className="product-info-content">
                  {isEditing ? (
                    <Form
                      form={form}
                      layout="vertical"
                    >
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
                      
                      <Form.Item
                        name="features"
                        label="Đặc điểm nổi bật"
                        rules={[{ required: true, message: 'Vui lòng nhập đặc điểm nổi bật!' }]}
                        extra="Mỗi đặc điểm một dòng"
                      >
                        <TextArea 
                          placeholder="Nhập đặc điểm nổi bật" 
                          rows={4}
                        />
                      </Form.Item>
                      
                      <Title level={5}>Thông số kỹ thuật</Title>
                      
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            name="material"
                            label="Chất liệu"
                          >
                            <Input placeholder="Nhập chất liệu" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="dimensions"
                            label="Kích thước"
                          >
                            <Input placeholder="Nhập kích thước" />
                          </Form.Item>
                        </Col>
                      </Row>
                      
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            name="weight"
                            label="Trọng lượng"
                          >
                            <Input placeholder="Nhập trọng lượng" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="warranty"
                            label="Bảo hành"
                          >
                            <Input placeholder="Nhập thời gian bảo hành" />
                          </Form.Item>
                        </Col>
                      </Row>
                      
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            name="origin"
                            label="Xuất xứ"
                          >
                            <Input placeholder="Nhập xuất xứ" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="assembly"
                            label="Lắp ráp"
                          >
                            <Input placeholder="Nhập thông tin lắp ráp" />
                          </Form.Item>
                        </Col>
                      </Row>
                      
                      <Form.Item
                        name="careInstructions"
                        label="Hướng dẫn bảo quản"
                      >
                        <TextArea 
                          placeholder="Nhập hướng dẫn bảo quản" 
                          rows={3}
                        />
                      </Form.Item>
                    </Form>
                  ) : (
                    <>
                      <Title level={5}>Mô tả sản phẩm</Title>
                      <Paragraph>{productData.description}</Paragraph>
                      
                      <Divider />
                      
                      <Title level={5}>Đặc điểm nổi bật</Title>
                      <ul className="features-list">
                        {productData.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                      
                      <Divider />
                      
                      <Title level={5}>Thông số kỹ thuật</Title>
                      <Descriptions column={{ xs: 1, sm: 2 }}>
                        <Descriptions.Item label="Chất liệu">{productData.specifications.material}</Descriptions.Item>
                        <Descriptions.Item label="Kích thước">{productData.specifications.dimensions}</Descriptions.Item>
                        <Descriptions.Item label="Trọng lượng">{productData.specifications.weight}</Descriptions.Item>
                        <Descriptions.Item label="Bảo hành">{productData.specifications.warranty}</Descriptions.Item>
                        <Descriptions.Item label="Xuất xứ">{productData.specifications.origin}</Descriptions.Item>
                        <Descriptions.Item label="Lắp ráp">{productData.specifications.assembly}</Descriptions.Item>
                      </Descriptions>
                      
                      <Divider />
                      
                      <Title level={5}>Hướng dẫn bảo quản</Title>
                      <Paragraph>{productData.careInstructions}</Paragraph>
                    </>
                  )}
                </div>
              </TabPane>
              
              <TabPane tab="Hình ảnh" key="images">
                <div className="product-images">
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    style={{ marginBottom: 16 }}
                  >
                    Thêm hình ảnh
                  </Button>
                  
                  <Row gutter={[16, 16]}>
                    {productData.images.map((image, index) => (
                      <Col xs={24} sm={12} md={8} key={index}>
                        <div className="image-item">
                          <Image 
                            src={image} 
                            alt={`${productData.name} - ${index + 1}`}
                            width="100%"
                          />
                          <div className="image-actions">
                            <Space>
                              <Button 
                                type="primary" 
                                icon={<EditOutlined />}
                                size="small"
                              />
                              <Button 
                                type="primary" 
                                danger 
                                icon={<DeleteOutlined />}
                                size="small"
                              />
                            </Space>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              </TabPane>
              
              <TabPane tab="Biến thể" key="variants">
                <div className="product-variants">
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    style={{ marginBottom: 16 }}
                  >
                    Thêm biến thể
                  </Button>
                  
                  <Table 
                    dataSource={productData.variants} 
                    pagination={false}
                    columns={[
                      {
                        title: 'Tên biến thể',
                        dataIndex: 'name',
                        key: 'name',
                      },
                      {
                        title: 'Giá bán',
                        dataIndex: 'price',
                        key: 'price',
                        render: price => `${price.toLocaleString('vi-VN')} VND`
                      },
                      {
                        title: 'Tồn kho',
                        dataIndex: 'stock',
                        key: 'stock',
                      },
                      {
                        title: 'Hành động',
                        key: 'action',
                        render: (_, record) => (
                          <Space size="small">
                            <Button 
                              type="text" 
                              icon={<EditOutlined />} 
                              title="Chỉnh sửa"
                            />
                            <Button 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined />}
                              title="Xóa"
                            />
                          </Space>
                        ),
                      },
                    ]}
                  />
                </div>
              </TabPane>
              
              <TabPane tab="Sản phẩm liên quan" key="related">
                <div className="related-products">
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    style={{ marginBottom: 16 }}
                  >
                    Thêm sản phẩm liên quan
                  </Button>
                  
                  <Row gutter={[16, 16]}>
                    {productData.relatedProducts.map(product => (
                      <Col xs={24} sm={12} md={8} key={product.key}>
                        <Card hoverable className="related-product-card">
                          <div className="related-product-info">
                            <Image 
                              src={product.thumbnail} 
                              alt={product.name}
                              width={80}
                              height={80}
                              className="related-product-thumbnail"
                            />
                            <div className="related-product-details">
                              <Text strong>{product.name}</Text>
                              <Text>{product.price.toLocaleString('vi-VN')} VND</Text>
                              <Button 
                                type="text" 
                                danger 
                                icon={<DeleteOutlined />}
                                size="small"
                              >
                                Xóa
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProductDetail; 