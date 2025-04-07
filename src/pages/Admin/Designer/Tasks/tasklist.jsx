import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, message } from 'antd';
import { Link } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const userId = localStorage.getItem('user');
        const response = await axios.get(`/api/worktask/${userId}/users`);
        setTasks(response.data);
      } catch (error) {
        message.error('Không thể tải danh sách công việc');
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const getStatusColor = (status) => {
    const statusColors = {
      ConsultingAndSket: 'blue',
      ConsultingAndSketching: 'blue',
      Designing: 'processing',
      Completed: 'success',
      Cancelled: 'error'
    };
    return statusColors[status] || 'default';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      ConsultingAndSket: 'Tư vấn & Phác thảo',
      ConsultingAndSketching: 'Tư vấn & Phác thảo',
      Designing: 'Đang thiết kế',
      Completed: 'Hoàn thành',
      Cancelled: 'Đã hủy'
    };
    return statusTexts[status] || status;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <span className="font-mono">{text.slice(0, 8)}...</span>,
    },
    {
      title: 'Khách hàng',
      dataIndex: ['serviceOrder', 'userName'],
      key: 'customerName',
    },
    {
      title: 'Loại dịch vụ',
      dataIndex: ['serviceOrder', 'serviceType'],
      key: 'serviceType',
      render: (text) => text === 'UsingDesignIdea' ? 'Sử dụng mẫu thiết kế' : 'Thiết kế tùy chỉnh',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'creationDate',
      key: 'creationDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Link to={`/designer/tasks/${record.id}`} className="text-blue-500 hover:text-blue-700">
            Xem chi tiết
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Danh sách công việc</h1>
      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} công việc`,
        }}
      />
    </div>
  );
};

export default TaskList;