import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Space, Button, Input, Select, Tooltip, Badge, Typography, Dropdown, Modal, message } from 'antd';
import { SearchOutlined, CalendarOutlined, UserOutlined, FilterOutlined, SortAscendingOutlined, SortDescendingOutlined, EyeOutlined, DeleteOutlined, ExclamationCircleOutlined, MoreOutlined } from '@ant-design/icons';
import moment from 'moment';
import TaskDetailDrawer from './TaskDetailDrawer';
import useScheduleStore from '@/stores/useScheduleStore';
import useDesignOrderStore from '@/stores/useDesignOrderStore';
import './styles/DesignerTasksList.scss';

const { Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const DesignerTasksList = ({ tasks, designers, selectedDesignerId, onRefresh }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [sortField, setSortField] = useState('creationDate');
  const [sortDirection, setSortDirection] = useState('descend');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Get functions from stores
  const { deleteTask } = useScheduleStore();
  const { updateStatus } = useDesignOrderStore();

  // Status options for filter
  const statusOptions = [
    // { value: 0, label: 'Tư vấn & phác thảo', color: 'blue' },
    // { value: 1, label: 'Đã phác thảo', color: 'cyan' },
    // { value: 2, label: 'Thiết kế', color: 'purple' },
    // { value: 3, label: 'Đã thiết kế', color: 'green' },
    { value: 'ConsultingAndSket', label: 'Tư vấn & phác thảo', color: 'blue' },
    { value: 'DoneConsulting', label: 'Đã phác thảo', color: 'cyan' },
    { value: 'Design', label: 'Thiết kế', color: 'purple' },
    { value: 'DoneDesign', label: 'Đã thiết kế', color: 'green' },
  ];

  // Get status display info
  const getStatusInfo = (status) => {
    const statusMap = {
      0: { text: 'Tư vấn & phác thảo', color: 'blue', status: 'processing' },
      1: { text: 'Đã phác thảo', color: 'cyan', status: 'success' },
      2: { text: 'Thiết kế', color: 'purple', status: 'processing' },
      3: { text: 'Đã thiết kế', color: 'green', status: 'success' },
      'ConsultingAndSket': { text: 'Tư vấn & phác thảo', color: 'blue', status: 'processing' },
      'DoneConsulting': { text: 'Đã phác thảo', color: 'cyan', status: 'success' },
      'Design': { text: 'Thiết kế', color: 'purple', status: 'processing' },
      'DoneDesign': { text: 'Đã thiết kế', color: 'green', status: 'success' },
    };
    return statusMap[status] || { text: `Trạng thái #${status}`, color: 'default', status: 'default' };
  };

  // Filter and sort tasks
  useEffect(() => {
    let result = [...tasks];
    
    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(task => 
        task.id.toLowerCase().includes(searchLower) || 
        (task.serviceOrderId && task.serviceOrderId.toLowerCase().includes(searchLower)) ||
        (task.note && task.note.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply status filter
    if (statusFilter.length > 0) {
      result = result.filter(task => statusFilter.includes(task.status));
    }
    
    // Apply sorting
    result = result.sort((a, b) => {
      let valueA, valueB;
      
      // Determine value based on sort field
      switch (sortField) {
        case 'creationDate':
          valueA = moment(a.creationDate).valueOf();
          valueB = moment(b.creationDate).valueOf();
          break;
        case 'modificationDate':
          valueA = a.modificationDate ? moment(a.modificationDate).valueOf() : 0;
          valueB = b.modificationDate ? moment(b.modificationDate).valueOf() : 0;
          break;
        case 'status':
          valueA = typeof a.status === 'number' ? a.status : String(a.status);
          valueB = typeof b.status === 'number' ? b.status : String(b.status);
          break;
        default:
          valueA = a[sortField] || '';
          valueB = b[sortField] || '';
      }
      
      // Apply direction
      const factor = sortDirection === 'ascend' ? 1 : -1;
      
      if (valueA < valueB) return -1 * factor;
      if (valueA > valueB) return 1 * factor;
      return 0;
    });
    
    setFilteredTasks(result);
  }, [tasks, searchText, statusFilter, sortField, sortDirection]);
  
  // Handle viewing task details
  const handleViewTask = (task) => {
    setSelectedTask(task);
    setDrawerVisible(true);
  };
  
  // Close drawer and refresh if needed
  const handleCloseDrawer = (refreshNeeded = false) => {
    setDrawerVisible(false);
    if (refreshNeeded) {
      onRefresh();
    }
  };
  
  // Handle sort change
  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'ascend' ? 'descend' : 'ascend');
    } else {
      setSortField(field);
      setSortDirection('descend'); // Default to descending for new field
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Handle task deletion
  const handleDeleteTask = (taskId, serviceOrderId) => {
    if (deleteLoading) return;

    confirm({
      title: 'Xác nhận xóa task',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn xóa task này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setDeleteLoading(true);
          
          // 1. Delete the task
          await deleteTask(taskId);
          // message.success('Đã xóa task thành công!');
          
          // 2. If the task has an associated order, reset the order status to Pending
          if (serviceOrderId) {
            try {
              // Update order status to Pending (0)
              await updateStatus(serviceOrderId, "Pending");
              message.success('Đã xóa task và cập nhật trạng thái đơn hàng về Chờ xử lý!');
            } catch (orderError) {
              message.warning('Xóa task thành công nhưng không thể cập nhật trạng thái đơn hàng: ' + 
                (orderError.message || 'Lỗi không xác định'));
              console.error('Error updating order status:', orderError);
            }
          }
          
          // 3. Refresh task list
          onRefresh();
        } catch (error) {
          message.error('Không thể xóa task: ' + (error.message || 'Lỗi không xác định'));
        } finally {
          setDeleteLoading(false);
        }
      },
    });
  };
  
  // Action menu for each row
  const getActionMenuItems = (record) => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'Chi tiết',
      onClick: () => handleViewTask(record)
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Xóa',
      danger: true,
      disabled: deleteLoading || record.status !== 'ConsultingAndSket' || moment().diff(moment(record.creationDate), 'minutes') > 15,
      onClick: () => handleDeleteTask(record.id, record.serviceOrderId)
    }
  ];

  // Table columns
  const columns = [
    {
      title: 'Mã task',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Text copyable>{id.substring(0, 8)}</Text>,
      width: 120,
    },
    {
      title: 'Đơn hàng',
      dataIndex: 'serviceOrderId',
      key: 'serviceOrderId',
      render: (serviceOrderId, record) => 
        serviceOrderId ? (
          <Text copyable>{serviceOrderId.substring(0, 8)}</Text>
        ) : (
          <Text type="secondary">Không có đơn</Text>
        ),
      width: 120,
    },
    {
      title: (
        <Space>
          <span>Designer</span>
          <Button 
            type="text" 
            size="small" 
            icon={<SortAscendingOutlined />} 
            onClick={() => handleSortChange('userName')}
            className={sortField === 'userName' ? 'active-sort' : ''}
          />
        </Space>
      ),
      dataIndex: 'userId',
      key: 'userId',
      render: (userId, record) => {
        const designer = designers.find(d => d.id === userId);
        return (
          <Space>
            <UserOutlined />
            {designer?.name || record.userName || 'Chưa xác định'}
          </Space>
        );
      },
      width: 150,
    },
    {
      title: (
        <Space>
          <span>Trạng thái</span>
          <Button 
            type="text" 
            size="small" 
            icon={<SortAscendingOutlined />} 
            onClick={() => handleSortChange('status')}
            className={sortField === 'status' ? 'active-sort' : ''}
          />
        </Space>
      ),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusInfo = getStatusInfo(status);
        return (
          <Space>
            <Badge status={statusInfo.status} />
            <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
          </Space>
        );
      },
      width: 180,
    },
    {
      title: (
        <Space>
          <span>Ngày tạo</span>
          <Button 
            type="text" 
            size="small" 
            icon={sortDirection === 'ascend' ? <SortAscendingOutlined /> : <SortDescendingOutlined />} 
            onClick={() => handleSortChange('creationDate')}
            className={sortField === 'creationDate' ? 'active-sort' : ''}
          />
        </Space>
      ),
      dataIndex: 'creationDate',
      key: 'creationDate',
      render: (date) => formatDate(date),
      width: 180,
    },
    {
      title: (
        <Space>
          <span>Cập nhật</span>
          <Button 
            type="text" 
            size="small" 
            icon={<SortAscendingOutlined />} 
            onClick={() => handleSortChange('modificationDate')}
            className={sortField === 'modificationDate' ? 'active-sort' : ''}
          />
        </Space>
      ),
      dataIndex: 'modificationDate',
      key: 'modificationDate',
      render: (date) => date ? formatDate(date) : <Text type="secondary">Chưa cập nhật</Text>,
      width: 180,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      render: (note) => note || <Text type="secondary">Không có ghi chú</Text>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 90,
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionMenuItems(record) }}
          placement="bottomRight"
          trigger={['hover']}
          arrow={{ pointAtCenter: true }}
        >
          <Button 
            type="text" 
            icon={<MoreOutlined />}
            className="action-button"
            style={{ fontSize: '18px' }}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="designer-tasks-list">
      <div className="filter-toolbar">
        <Space wrap>
          <Input 
            placeholder="Tìm kiếm theo mã task hoặc mã đơn hàng..." 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            prefix={<SearchOutlined />}
            style={{ width: 280 }}
          />
          
          <Select
            mode="multiple"
            placeholder="Lọc theo trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 220 }}
            allowClear
            maxTagCount={2}
          >
            {statusOptions.map(option => (
              <Option key={option.value} value={option.value}>
                <Tag color={option.color}>{option.label}</Tag>
              </Option>
            ))}
          </Select>
        </Space>
      </div>

      <Card bordered={false} className="tasks-list-card">
        <Table 
          columns={columns} 
          dataSource={filteredTasks}
          rowKey="id"
          pagination={{ 
            pageSize: 10, 
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} công việc`
          }}
        />
      </Card>
      
      {selectedTask && (
        <TaskDetailDrawer 
          visible={drawerVisible}
          task={selectedTask} 
          onClose={handleCloseDrawer}
          designers={designers}
        />
      )}
    </div>
  );
};

export default DesignerTasksList; 