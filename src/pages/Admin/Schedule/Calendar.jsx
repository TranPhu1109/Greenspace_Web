import React, { useState } from 'react';
import { Calendar as AntCalendar, Badge, Tooltip, Row, Col, Card, Select, Button, Tag, List, Avatar, Timeline, Modal, Form, Input, DatePicker, TimePicker, Space, message } from 'antd';
import { PlusOutlined, ClockCircleOutlined, UserOutlined, EnvironmentOutlined, CheckCircleOutlined, CloseCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './Calendar.scss';

const { Option } = Select;

const Calendar = ({ tasks, designers, onAddNew, pendingOrders }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState('calendar');
  const [selectedTasks, setSelectedTasks] = useState('all');
  const [addTaskModal, setAddTaskModal] = useState(false);
  const [selectedDesigner, setSelectedDesigner] = useState(null);
  const [form] = Form.useForm();

  const dateCellRender = (value) => {
    const date = value.format('YYYY-MM-DD');
    // Kiểm tra và lọc tasks hợp lệ
    const listData = tasks?.filter(item => {
      // Kiểm tra item.date có hợp lệ không
      return item.date && dayjs(item.date).isValid() && 
             dayjs(item.date).format('YYYY-MM-DD') === date;
    }) || [];

    const sortedData = listData.sort((a, b) => {
      // Kiểm tra time hợp lệ trước khi so sánh
      if (!a.time || !b.time) return 0;
      return dayjs(`${a.date} ${a.time}`).diff(dayjs(`${b.date} ${b.time}`));
    });

    // Lấy danh sách designers làm việc trong ngày
    const workingDesigners = [...new Set(listData.map(task => task.designer))];
    const availableDesigners = designers.filter(d => !workingDesigners.includes(d.name));

    const isToday = value.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
    const isSelected = value.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD');

    return (
      <div className={`date-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`} 
           onClick={() => setSelectedDate(value)}>
        <div className="date-header">
          <span className="date-number">{value.date()}</span>
          <div className="designer-avatars">
            {workingDesigners.map((designer, index) => {
              const designerData = designers.find(d => d.name === designer);
              if (!designerData) return null;
              return (
                <Tooltip key={designer} title={designer}>
                  <Avatar 
                    src={designerData.avatar}
                    size="small"
                    className={`designer-avatar ${index > 0 ? 'overlapped' : ''}`}
                  />
                </Tooltip>
              );
            })}
          </div>
        </div>
        
        {(listData.length > 0 || workingDesigners.length > 0) && (
          <div className="date-stats">
            <div className="stat-item tasks">
              <CalendarOutlined /> {listData.length}
            </div>
            <Tooltip title={`${workingDesigners.length} designers đang làm việc / ${designers.length} tổng số`}>
              <div className="stat-item designers">
                <UserOutlined /> {workingDesigners.length}/{designers.length}
              </div>
            </Tooltip>
          </div>
        )}

        <div className="events-list">
          {sortedData.map(item => (
            <Tooltip 
              key={item.id} 
              title={
                <div className="event-tooltip">
                  <h4>{item.title}</h4>
                  <p><ClockCircleOutlined /> {item.time}</p>
                  <p><UserOutlined /> {item.designer}</p>
                  <p><EnvironmentOutlined /> {item.location}</p>
                </div>
              }
            >
              <div className={`event-item ${item.status}`}>
                <span className="event-time">{item.time}</span>
                <span className="event-title">{item.title}</span>
              </div>
            </Tooltip>
          ))}
        </div>
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'ongoing': return 'processing';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'ongoing': return 'Đang thực hiện';
      case 'pending': return 'Chờ thực hiện';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const headerRender = ({ value, onChange }) => {
    const start = 0;
    const end = 12;
    const monthOptions = [];

    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push(value.month(i));
    }

    for (let i = start; i < end; i++) {
      monthOptions.push(
        <Select.Option key={i} value={i}>
          {months[i].format('MMMM')}
        </Select.Option>
      );
    }

    return (
      <div className="calendar-header">
        <Row justify="space-between" align="middle">
          <Col>
            <div className="calendar-nav">
              <Button.Group>
                <Button onClick={() => onChange(value.clone().subtract(1, 'month'))}>
                  Tháng trước
                </Button>
                <Button onClick={() => onChange(value.clone().add(1, 'month'))}>
                  Tháng sau
                </Button>
              </Button.Group>
            </div>
          </Col>
          <Col>
            <Row gutter={8} align="middle">
              <Col>
                <Select
                  size="large"
                  dropdownMatchSelectWidth={false}
                  value={selectedTasks}
                  onChange={setSelectedTasks}
                >
                  <Select.Option value="all">Tất cả công việc</Select.Option>
                  <Select.Option value="pending">Đang chờ</Select.Option>
                  <Select.Option value="completed">Đã hoàn thành</Select.Option>
                </Select>
              </Col>
              <Col>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={onAddNew}
                >
                  Thêm công việc mới
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  };

  const handleAddTask = (designer) => {
    setSelectedDesigner(designer);
    form.setFieldsValue({
      date: selectedDate,
      designer: designer.id
    });
    setAddTaskModal(true);
  };

  const handleAddTaskSubmit = () => {
    form.validateFields().then(values => {
      console.log('Add task values:', values);
      // Xử lý thêm task
      message.success('Đã thêm công việc thành công!');
      setAddTaskModal(false);
      form.resetFields();
    });
  };

  const renderSideDetail = () => {
    const date = selectedDate.format('YYYY-MM-DD');
    const dayTasks = tasks?.filter(item => dayjs(item.date).format('YYYY-MM-DD') === date) || [];
    const workingDesigners = [...new Set(dayTasks.map(task => task.designer))];
    
    return (
      <div className="calendar-side-detail">
        <div className="date-overview">
          <Row justify="space-between" align="middle">
            <Col>
              <h3>{selectedDate.format('DD/MM/YYYY')}</h3>
              <div className="stats">
                <Tag color="blue">{dayTasks.length} công việc</Tag>
                <Tag color="orange">{workingDesigners.length} designers làm việc</Tag>
              </div>
            </Col>
            <Col>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={onAddNew}
              >
                Thêm công việc mới
              </Button>
            </Col>
          </Row>
        </div>

        <div className="designers-status">
          <h4>Trạng thái Designers</h4>
          <List
            itemLayout="horizontal"
            dataSource={designers}
            renderItem={designer => {
              const designerTasks = dayTasks.filter(task => task.designer === designer.name);
              return (
                <List.Item
                  actions={[
                    <Button 
                      type="link" 
                      onClick={() => handleAddTask(designer)}
                      disabled={designerTasks.length >= designer.maxTasksPerDay}
                    >
                      Thêm task
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        src={designer.avatar} 
                        icon={!designer.avatar && <UserOutlined />}
                      />
                    }
                    title={
                      <Space align="center">
                        <span className="designer-name">{designer.name}</span>
                        {designerTasks.length > 0 ? (
                          <Tag color="orange">Đang bận</Tag>
                        ) : (
                          <Tag color="green">Đang rảnh</Tag>
                        )}
                        <Tooltip title="Số task tối đa trong ngày">
                          <Tag color="blue">{designerTasks.length}/{designer.maxTasksPerDay} tasks</Tag>
                        </Tooltip>
                      </Space>
                    }
                    description={
                      <div>
                        <div className="designer-info">
                          <Tag>{designer.role}</Tag>
                          <Tag>{designer.experience} năm kinh nghiệm</Tag>
                        </div>
                        {designerTasks.length > 0 ? (
                          <div className="designer-tasks">
                            {designerTasks.map(task => (
                              <div key={task.id} className="task-item">
                                <ClockCircleOutlined /> {dayjs(task.time).format('HH:mm')} - {task.title}
                              </div>
                            ))}
                          </div>
                        ) : "Không có công việc"}
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        </div>

        {dayTasks.length > 0 && (
          <div className="day-schedule">
            <h4>Lịch công việc trong ngày</h4>
            <Timeline>
              {dayTasks
                .sort((a, b) => dayjs(a.time).diff(dayjs(b.time)))
                .map(task => (
                  <Timeline.Item 
                    key={task.id}
                    color={getStatusColor(task.status)}
                    dot={task.status === 'ongoing' ? <ClockCircleOutlined /> : null}
                  >
                    <div className="timeline-task">
                      <div className="task-time">{dayjs(task.time).format('HH:mm')}</div>
                      <div className="task-info">
                        <div className="task-title">{task.title}</div>
                        <div className="task-details">
                          <span><UserOutlined /> {task.designer}</span>
                          <span><EnvironmentOutlined /> {task.location}</span>
                        </div>
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
            </Timeline>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Row gutter={16} className="calendar-layout">
        <Col xs={24} lg={16}>
          <Card className="calendar-container">
            <AntCalendar 
              headerRender={headerRender}
              dateCellRender={dateCellRender}
              mode="month"
              value={selectedDate}
              onChange={setSelectedDate}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="side-detail-container">
            {renderSideDetail()}
          </Card>
        </Col>
      </Row>

      <Modal
        title={`Thêm công việc cho ${selectedDesigner?.name}`}
        open={addTaskModal}
        onOk={handleAddTaskSubmit}
        onCancel={() => setAddTaskModal(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="orderId"
            label="Đơn thiết kế"
            rules={[{ required: true, message: 'Vui lòng chọn đơn thiết kế!' }]}
          >
            <Select placeholder="Chọn đơn thiết kế">
              {pendingOrders?.map(order => (
                <Option key={order.id} value={order.id}>
                  {order.orderNumber} - {order.customerName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Ngày"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="time"
                label="Thời gian"
                rules={[{ required: true }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Calendar; 