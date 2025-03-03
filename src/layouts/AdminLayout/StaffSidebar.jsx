import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  MessageOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  SettingOutlined
} from '@ant-design/icons';
import logo from '../../assets/logo.png';

const { Sider } = Layout;
const { SubMenu } = Menu;

const StaffSidebar = ({ collapsed }) => {
  const location = useLocation();
  
  return (
    <Sider trigger={null} collapsible collapsed={collapsed} width={250}>
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
        {/* {!collapsed && <span className="logo-text">GreenSpace</span>} */}
      </div>
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={collapsed ? [] : ['orders', 'products']}
      >
        <Menu.Item key="/admin/dashboard" icon={<DashboardOutlined />}>
          <Link to="/admin/dashboard">Dashboard</Link>
        </Menu.Item>
        
        <SubMenu key="orders" icon={<ShoppingOutlined />} title="Đơn hàng">
          <Menu.Item key="/admin/orders/new">
            <Link to="/admin/orders/new">Đơn hàng mới</Link>
          </Menu.Item>
          <Menu.Item key="/admin/orders/processing">
            <Link to="/admin/orders/processing">Đang xử lý</Link>
          </Menu.Item>
          <Menu.Item key="/admin/orders/completed">
            <Link to="/admin/orders/completed">Đã hoàn thành</Link>
          </Menu.Item>
        </SubMenu>
        
        <Menu.Item key="/admin/customers" icon={<UserOutlined />}>
          <Link to="/admin/customers">Khách hàng</Link>
        </Menu.Item>
        
        <SubMenu key="products" icon={<AppstoreOutlined />} title="Sản phẩm">
          <Menu.Item key="/admin/products/list">
            <Link to="/admin/products/list">Danh sách sản phẩm</Link>
          </Menu.Item>
          <Menu.Item key="/admin/products/stock">
            <Link to="/admin/products/stock">Kiểm tra tồn kho</Link>
          </Menu.Item>
        </SubMenu>
        
        <Menu.Item key="/admin/messages" icon={<MessageOutlined />}>
          <Link to="/admin/messages">Tin nhắn</Link>
        </Menu.Item>
        
        <Menu.Item key="/admin/schedule" icon={<CalendarOutlined />}>
          <Link to="/admin/schedule">Lịch làm việc</Link>
        </Menu.Item>
        
        <Menu.Item key="/admin/settings" icon={<SettingOutlined />}>
          <Link to="/admin/settings">Cài đặt</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default StaffSidebar; 