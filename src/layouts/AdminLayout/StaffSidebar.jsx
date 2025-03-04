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
    <Sider trigger={null} collapsible collapsed={collapsed} width={250} theme="light">
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
        <Menu.Item key="/staff/dashboard" icon={<DashboardOutlined />}>
          <Link to="/staff/dashboard">Dashboard</Link>
        </Menu.Item>
        
        <SubMenu
          key="orders"
          icon={<ShoppingOutlined />}
          title="Quản lý đơn hàng"
        >
          <Menu.Item key="/staff/orders">
            <Link to="/staff/orders">Danh sách đơn hàng</Link>
          </Menu.Item>
          {/* <Menu.Item key="/staff/orders/shipping">
            <Link to="/staff/orders/shipping">Vận chuyển</Link>
          </Menu.Item> */}
        </SubMenu>
        
        <Menu.Item key="/staff/customers" icon={<UserOutlined />}>
          <Link to="/staff/customers">Khách hàng</Link>
        </Menu.Item>
        
        <SubMenu key="products" icon={<AppstoreOutlined />} title="Sản phẩm">
          <Menu.Item key="/staff/products/list">
            <Link to="/staff/products/list">Danh sách sản phẩm</Link>
          </Menu.Item>
          <Menu.Item key="/staff/products/stock">
            <Link to="/staff/products/stock">Kiểm tra tồn kho</Link>
          </Menu.Item>
        </SubMenu>
        
        <Menu.Item key="/staff/messages" icon={<MessageOutlined />}>
          <Link to="/staff/messages">Tin nhắn</Link>
        </Menu.Item>
        
        <Menu.Item key="/staff/schedule" icon={<CalendarOutlined />}>
          <Link to="/staff/schedule">Lịch làm việc</Link>
        </Menu.Item>
        
        <Menu.Item key="/staff/settings" icon={<SettingOutlined />}>
          <Link to="/staff/settings">Cài đặt</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default StaffSidebar; 