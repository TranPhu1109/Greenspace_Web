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
      // Đang chờ xử lý
      Pending: "orange",
      WaitDeposit: "orange",
      WaitForScheduling: "orange",
  
      // Quá trình tư vấn / thiết kế
      ConsultingAndSketching: "processing",
      ReConsultingAndSketching: "processing",
      DeterminingDesignPrice: "processing",
      ReDeterminingDesignPrice: "processing",
      DoneDeterminingDesignPrice: "cyan",
      AssignToDesigner: "processing",
      ReDesign: "processing",
      DoneDesign: "cyan",
  
      // Quá trình đặt cọc và thanh toán
      DepositSuccessful: "cyan",
      PaymentSuccess: "cyan",
  
      // Quá trình xác định vật liệu
      DeterminingMaterialPrice: "processing",
      DoneDeterminingMaterialPrice: "cyan",
  
      // Giao hàng, lắp đặt
      Processing: "processing",
      PickedPackageAndDelivery: "blue",
      DeliveryFail: "red",
      ReDelivery: "orange",
      DeliveredSuccessfully: "green",
  
      Installing: "blue",
      ReInstall: "orange",
      DoneInstalling: "green",
  
      // Xác nhận và hoàn thành
      CustomerConfirm: "cyan",
      Successfully: "green",
      CompleteOrder: "green",
  
      // Hủy và cảnh báo
      OrderCancelled: "red",
      Warning: "volcano",
      StopService: "red",
  
      // Hoàn tiền
      Refund: "purple",
      DoneRefund: "purple",
  
      // Đổi sản phẩm
      ExchangeProduct: "geekblue",
    };
  
    return statusColors[status] || "default";
  };
  

  const getStatusText = (status) => {
    const statusTexts = {
      Pending: "Chờ xử lý",
      ConsultingAndSketching: "Đang tư vấn & phác thảo",
      DeterminingDesignPrice: "Xác định giá bản vẽ",
      DepositSuccessful: "Đã đặt cọc thành công",
      ReDesign: "Thiết kế lại",
      AssignToDesigner: "Đã giao cho designer",
      DeterminingMaterialPrice: "Xác định giá vật liệu",
      DoneDesign: "Đã hoàn thành thiết kế",
      PaymentSuccess: "Đã thanh toán thành công",
      Processing: "Đang xử lý",
      PickedPackageAndDelivery: "Đã lấy hàng & giao hàng",
      DeliveryFail: "Giao hàng thất bại",
      ReDelivery: "Đang giao hàng lại",
      DeliveredSuccessfully: "Đã giao hàng thành công",
      CompleteOrder: "Đã hoàn thành đơn hàng",
      OrderCancelled: "Đơn hàng đã bị hủy",
      Warning: "Cảnh báo",
      Refund: "Hoàn tiền",
      DoneRefund: "Đã hoàn tiền",
      StopService: "Đã dừng dịch vụ",
      ReConsultingAndSketching: "Đang tư vấn & phác thảo lại",
      WaitDeposit: "Chờ đặt cọc",
      DoneDeterminingDesignPrice: "Đã xác định giá bản vẽ",
      DoneDeterminingMaterialPrice: "Đã xác định giá vật liệu",
      ReDeterminingDesignPrice: "Đang xác định lại giá bản vẽ",
      ExchangeProduct: "Đang đổi sản phẩm",
      WaitForScheduling : "Chờ lên lịch",
      Installing : "Đang lắp đặt",
      DoneInstalling : "Đã lắp đặt",
      ReInstall : "Đang lắp đặt lại",
      CustomerConfirm : "Khách hàng xác nhận",
      Successfully : "Thành công",
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