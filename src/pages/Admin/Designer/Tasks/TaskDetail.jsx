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
  Upload, 
  message, 
  Timeline, 
  Form, 
  Input, 
  Select,
  Modal,
  Divider
} from 'antd';
import { 
  ArrowLeftOutlined, 
  UploadOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  UserOutlined, 
  EnvironmentOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  PictureOutlined,
  FileImageOutlined,
  PhoneOutlined,
  MailOutlined,
  DollarOutlined,
  BorderOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import './TaskDetail.scss';

// Mock data - sẽ được thay thế bằng API call
import { getTaskById } from './mockData';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [form] = Form.useForm();
  const [updateNoteVisible, setUpdateNoteVisible] = useState(false);

  useEffect(() => {
    // Giả lập API call
    const fetchTask = async () => {
      try {
        // Trong thực tế, đây sẽ là API call
        const taskData = getTaskById(id);
        setTask(taskData);
        
        // Khởi tạo fileList từ task.images nếu có
        if (taskData.images && taskData.images.length > 0) {
          const initialFileList = taskData.images.map((url, index) => ({
            uid: `-${index + 1}`,
            name: `image-${index + 1}.jpg`,
            status: 'done',
            url,
          }));
          setFileList(initialFileList);
        }
        
        setLoading(false);
      } catch (error) {
        message.error('Không thể tải thông tin task');
        setLoading(false);
      }
    };
    
    fetchTask();
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handlePreview = async (file) => {
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải lên</div>
    </div>
  );

  const handleUpdateStatus = (newStatus) => {
    // Gọi API để cập nhật trạng thái
    setTask({
      ...task,
      status: newStatus,
      lastUpdated: dayjs().format('YYYY-MM-DD HH:mm:ss')
    });
    
    message.success(`Đã cập nhật trạng thái thành ${getStatusText(newStatus)}`);
  };

  const handleSaveImages = () => {
    // Gọi API để lưu hình ảnh
    const images = fileList.map(file => file.url || file.response?.url);
    
    setTask({
      ...task,
      images,
      lastUpdated: dayjs().format('YYYY-MM-DD HH:mm:ss')
    });
    
    message.success('Đã lưu hình ảnh thành công');
  };

  const showUpdateNoteModal = () => {
    form.setFieldsValue({
      note: task.note || '',
      status: task.status
    });
    setUpdateNoteVisible(true);
  };

  const handleUpdateNote = (values) => {
    // Gọi API để cập nhật ghi chú và trạng thái
    setTask({
      ...task,
      note: values.note,
      status: values.status,
      lastUpdated: dayjs().format('YYYY-MM-DD HH:mm:ss')
    });
    
    setUpdateNoteVisible(false);
    message.success('Đã cập nhật thông tin task');
  };

  // Lấy text trạng thái
  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'ongoing': return 'Đang thực hiện';
      case 'pending': return 'Chờ thực hiện';
      case 'cancelled': return 'Đã hủy';
      case 'consulting': return 'Đang tư vấn';
      default: return 'Không xác định';
    }
  };

  // Lấy màu trạng thái
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'ongoing': return 'processing';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'consulting': return 'geekblue';
      default: return 'default';
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!task) {
    return <div>Không tìm thấy thông tin task</div>;
  }

  return (
    <div className="task-detail-container">
      <div className="page-header">
        <Button icon={<ArrowLeftOutlined />} onClick={handleGoBack}>
          Quay lại
        </Button>
        <Title level={4}>Chi tiết công việc: {task.title}</Title>
      </div>
      
      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card>
            <Tabs defaultActiveKey="info">
              <TabPane tab="Thông tin" key="info">
                <Descriptions title="Thông tin cơ bản" bordered column={1}>
                  <Descriptions.Item label="Tên công việc">{task.title}</Descriptions.Item>
                  <Descriptions.Item label="Khách hàng">{task.customer}</Descriptions.Item>
                  <Descriptions.Item label="Ngày">{dayjs(task.date).format('DD/MM/YYYY')}</Descriptions.Item>
                  <Descriptions.Item label="Thời gian">{task.time}</Descriptions.Item>
                  <Descriptions.Item label="Địa điểm">{task.location || 'Không có'}</Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag color={getStatusColor(task.status)}>{getStatusText(task.status)}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Cập nhật lần cuối">
                    {task.lastUpdated ? dayjs(task.lastUpdated).format('DD/MM/YYYY HH:mm:ss') : 'Chưa cập nhật'}
                  </Descriptions.Item>
                </Descriptions>
                
                {task.description && (
                  <>
                    <Title level={5} style={{ marginTop: 24 }}>Mô tả</Title>
                    <Paragraph>{task.description}</Paragraph>
                  </>
                )}
                
                {task.requirements && (
                  <>
                    <Title level={5} style={{ marginTop: 16 }}>Yêu cầu</Title>
                    <Paragraph>{task.requirements}</Paragraph>
                  </>
                )}
                
                {task.note && (
                  <>
                    <Title level={5} style={{ marginTop: 16 }}>Ghi chú</Title>
                    <Paragraph>{task.note}</Paragraph>
                  </>
                )}
              </TabPane>
              
              <TabPane tab="Hình ảnh" key="images">
                <div className="upload-container">
                  <Title level={5}>Hình ảnh thiết kế</Title>
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={handlePreview}
                    onChange={handleChange}
                    beforeUpload={() => false} // Không tự động upload
                  >
                    {fileList.length >= 8 ? null : uploadButton}
                  </Upload>
                  
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />} 
                    onClick={handleSaveImages}
                    disabled={fileList.length === 0}
                  >
                    Lưu hình ảnh
                  </Button>
                  
                  <Modal
                    visible={previewVisible}
                    title={previewTitle}
                    footer={null}
                    onCancel={() => setPreviewVisible(false)}
                  >
                    <img alt="preview" style={{ width: '100%' }} src={previewImage} />
                  </Modal>
                </div>
              </TabPane>
              
              <TabPane tab="Lịch sử" key="history">
                <Timeline>
                  {task.history && task.history.map((item, index) => (
                    <Timeline.Item key={index} color={item.color || 'blue'}>
                      <p><strong>{item.action}</strong> - {dayjs(item.time).format('DD/MM/YYYY HH:mm:ss')}</p>
                      <p>{item.user}</p>
                      {item.note && <p>{item.note}</p>}
                    </Timeline.Item>
                  ))}
                  <Timeline.Item color="green">
                    <p><strong>Tạo task</strong> - {dayjs(task.createdAt).format('DD/MM/YYYY HH:mm:ss')}</p>
                    <p>Admin</p>
                  </Timeline.Item>
                </Timeline>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card className="task-actions-card">
            <Title level={5}>Thao tác</Title>
            
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />} 
                block
                disabled={task.status === 'completed'}
                onClick={() => handleUpdateStatus('completed')}
              >
                Đánh dấu hoàn thành
              </Button>
              
              <Button 
                icon={<ClockCircleOutlined />} 
                block
                disabled={task.status === 'ongoing'}
                onClick={() => handleUpdateStatus('ongoing')}
              >
                Đánh dấu đang thực hiện
              </Button>
              
              <Button 
                icon={<FileImageOutlined />} 
                block
                onClick={showUpdateNoteModal}
              >
                Cập nhật ghi chú
              </Button>
            </Space>
            
            <Divider />
            
            <Title level={5}>Thông tin khách hàng</Title>
            <p><UserOutlined /> {task.customer}</p>
            {task.phone && <p><PhoneOutlined /> {task.phone}</p>}
            {task.email && <p><MailOutlined /> {task.email}</p>}
            {task.location && <p><EnvironmentOutlined /> {task.location}</p>}
          </Card>
        </Col>
      </Row>
      
      <Modal
        title="Cập nhật ghi chú và trạng thái"
        visible={updateNoteVisible}
        onCancel={() => setUpdateNoteVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateNote}
        >
          <Form.Item
            name="note"
            label="Ghi chú"
            rules={[{ required: true, message: 'Vui lòng nhập ghi chú' }]}
          >
            <TextArea rows={4} placeholder="Nhập ghi chú về tiến độ công việc" />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Option value="consulting">Đang tư vấn</Option>
              <Option value="pending">Chờ thực hiện</Option>
              <Option value="ongoing">Đang thực hiện</Option>
              <Option value="completed">Hoàn thành</Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskDetail; 