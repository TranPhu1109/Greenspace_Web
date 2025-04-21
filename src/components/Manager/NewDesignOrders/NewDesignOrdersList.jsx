import React, { useEffect, useState } from 'react';
import { Table, Tag, Spin, Alert, Button, Typography, Space } from 'antd';
import { Link } from 'react-router-dom';
import useServiceOrderStore from '@/stores/useServiceOrderStore';
import { format } from 'date-fns';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title } = Typography;

const NewDesignOrdersList = () => {
  const {
    serviceOrders,
    loading,
    error,
    getServiceOrdersNoIdea,
  } = useServiceOrderStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getServiceOrdersNoIdea();
      } catch (error) {
        console.error('Error fetching design orders:', error);
        // Error is already set in the store, so no need to set it here
      }
    };
    
    fetchData();
  }, [getServiceOrdersNoIdea]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await getServiceOrdersNoIdea();
    } catch (error) {
      console.error('Error refreshing design orders:', error);
      // Error is already set in the store, so no need to set it here
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      Pending: "orange",
      ConsultingAndSketching: "blue",
      // Thêm các màu khác nếu cần
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      Pending: "Chờ xử lý",
      ConsultingAndSketching: "Đang tư vấn & phác thảo",
      // Thêm các text khác nếu cần
    };
    return statusTexts[status] || status;
  };

  const columns = [
    {
      title: 'Mã Đơn',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `#${id.substring(0, 8)}`,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'cusPhone',
      key: 'cusPhone',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'creationDate',
      key: 'creationDate',
      render: (date) => format(new Date(date), 'dd/MM/yyyy HH:mm'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Link to={`/manager/new-design-orders/${record.id}`}>
            <Button type="primary" icon={<EyeOutlined />} />
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={3}>Danh sách đơn đặt thiết kế mới</Title>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={refreshing}
        >
          Làm mới
        </Button>
      </div>
      {error && (
        <Alert
          message="Lỗi"
          description={
            <div>
              <p>{error}</p>
              <Button 
                type="primary" 
                size="small" 
                onClick={handleRefresh} 
                loading={refreshing}
                style={{ marginTop: '8px' }}
              >
                Thử lại
              </Button>
            </div>
          }
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}
      <Table
        columns={columns}
        dataSource={serviceOrders}
        loading={loading && !refreshing}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
        }}
      />
    </div>
  );
};

export default NewDesignOrdersList; 