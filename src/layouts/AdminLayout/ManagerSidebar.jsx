import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  FileTextOutlined,
  ProjectOutlined,
  ShopOutlined,
  SettingOutlined
} from '@ant-design/icons';
import logo from '../../assets/logo.png';

const { Sider } = Layout;
const { SubMenu } = Menu;

const ManagerSidebar = ({ collapsed }) => {
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
        defaultOpenKeys={collapsed ? [] : ['staff', 'reports', 'sales']}
      >
        <Menu.Item key="/admin/dashboard" icon={<DashboardOutlined />}>
          <Link to="/admin/dashboard">Dashboard</Link>
        </Menu.Item>
        
        <SubMenu key="staff" icon={<TeamOutlined />} title="Nhân viên">
          <Menu.Item key="/admin/staff/list">
            <Link to="/admin/staff/list">Danh sách nhân viên</Link>
          </Menu.Item>
          <Menu.Item key="/admin/staff/performance">
            <Link to="/admin/staff/performance">Hiệu suất</Link>
          </Menu.Item>
          <Menu.Item key="/admin/staff/schedule">
            <Link to="/admin/staff/schedule">Lịch làm việc</Link>
          </Menu.Item>
        </SubMenu>
        
        <SubMenu key="sales" icon={<ShoppingOutlined />} title="Bán hàng">
          <Menu.Item key="/admin/sales/orders">
            <Link to="/admin/sales/orders">Đơn hàng</Link>
          </Menu.Item>
          <Menu.Item key="/admin/sales/customers">
            <Link to="/admin/sales/customers">Khách hàng</Link>
          </Menu.Item>
          <Menu.Item key="/admin/sales/promotions">
            <Link to="/admin/sales/promotions">Khuyến mãi</Link>
          </Menu.Item>
        </SubMenu>
        
        <Menu.Item key="/admin/products" icon={<AppstoreOutlined />}>
          <Link to="/admin/products">Sản phẩm</Link>
        </Menu.Item>
        
        <Menu.Item key="/admin/projects" icon={<ProjectOutlined />}>
          <Link to="/admin/projects">Dự án</Link>
        </Menu.Item>
        
        <Menu.Item key="/admin/stores" icon={<ShopOutlined />}>
          <Link to="/admin/stores">Cửa hàng</Link>
        </Menu.Item>
        
        <SubMenu key="reports" icon={<FileTextOutlined />} title="Báo cáo">
          <Menu.Item key="/admin/reports/sales">
            <Link to="/admin/reports/sales">Báo cáo bán hàng</Link>
          </Menu.Item>
          <Menu.Item key="/admin/reports/inventory">
            <Link to="/admin/reports/inventory">Báo cáo kho hàng</Link>
          </Menu.Item>
          <Menu.Item key="/admin/reports/financial">
            <Link to="/admin/reports/financial">Báo cáo tài chính</Link>
          </Menu.Item>
        </SubMenu>
        
        <Menu.Item key="/admin/analytics" icon={<BarChartOutlined />}>
          <Link to="/admin/analytics">Phân tích</Link>
        </Menu.Item>
        
        <Menu.Item key="/admin/settings" icon={<SettingOutlined />}>
          <Link to="/admin/settings">Cài đặt</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default ManagerSidebar; 