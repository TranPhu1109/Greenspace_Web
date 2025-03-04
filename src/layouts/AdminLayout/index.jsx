import { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, Avatar, Badge } from 'antd';
import { 
  BellOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AccountantSidebar from './AccountantSidebar';
import StaffSidebar from './StaffSidebar';
import DesignerSidebar from './DesignerSidebar';
import ManagerSidebar from './ManagerSidebar';
import './AdminLayout.scss';
import logo from '../../assets/logo.png';

const { Header, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState('staff'); // Mặc định là admin, sau này sẽ lấy từ authentication
  const [username, setUsername] = useState('Staff User'); // Thêm biến trạng thái cho tên người dùng
  const location = useLocation();
  const navigate = useNavigate();

  // Giả lập việc lấy role từ API hoặc localStorage
  useEffect(() => {
    // Để demo, bạn có thể thay đổi role bằng cách thêm query param vào URL
    // Ví dụ: /admin?role=manager
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam && ['admin', 'accountant', 'staff', 'designer', 'manager'].includes(roleParam)) {
      setRole(roleParam);
    }
  }, [location]);

  // Giả lập việc lấy tên người dùng từ API hoặc localStorage
  useEffect(() => {
    // Cập nhật tên người dùng dựa trên vai trò
    switch (role) {
      case 'admin':
        setUsername('Admin User');
        break;
      case 'accountant':
        setUsername('Accountant User');
        break;
      case 'staff':
        setUsername('Staff User');
        break;
      case 'designer':
        setUsername('Designer User');
        break;
      case 'manager':
        setUsername('Manager User');
        break;
      default:
        setUsername('Admin User');
    }
  }, [role]); // Cập nhật khi role thay đổi

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    // Xử lý đăng xuất
    console.log('Logout');
    navigate('/');
  };

  const renderSidebar = () => {
    switch (role) {
      case 'admin':
        return <AdminSidebar collapsed={collapsed} />;
      case 'accountant':
        return <AccountantSidebar collapsed={collapsed} />;
      case 'staff':
        return <StaffSidebar collapsed={collapsed} />;
      case 'designer':
        return <DesignerSidebar collapsed={collapsed} />;
      case 'manager':
        return <ManagerSidebar collapsed={collapsed} />;
      default:
        return <AdminSidebar collapsed={collapsed} />;
    }
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Thông tin cá nhân
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Cài đặt tài khoản
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  const notificationMenu = (
    <Menu>
      <Menu.Item key="notification1">
        <div className="notification-item">
          <div className="notification-title">Đơn hàng mới</div>
          <div className="notification-time">5 phút trước</div>
          <div className="notification-content">Có đơn hàng mới cần xử lý</div>
        </div>
      </Menu.Item>
      <Menu.Item key="notification2">
        <div className="notification-item">
          <div className="notification-title">Yêu cầu thiết kế</div>
          <div className="notification-time">30 phút trước</div>
          <div className="notification-content">Khách hàng gửi yêu cầu thiết kế mới</div>
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="viewAll">
        <div className="view-all">Xem tất cả</div>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="admin-layout">
      {renderSidebar()}
      <Layout className="site-layout">
        <Header className="admin-header">
          <div className="header-left">
            <div className="trigger" onClick={toggleCollapsed}>
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
            <div className="header-title">
              {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
            </div>
          </div>
          <div className="header-right">
            <Dropdown overlay={notificationMenu} trigger={['click']} placement="bottomRight">
              <Badge count={2} className="notification-badge">
                <BellOutlined className="header-icon" />
              </Badge>
            </Dropdown>
            <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
              <div className="user-info">
                <Avatar size="small" icon={<UserOutlined />} />
                <span className="username">{username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout; 