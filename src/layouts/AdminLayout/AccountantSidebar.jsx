import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  DollarOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  BankOutlined,
  BarChartOutlined,
  SettingOutlined,
  FileImageOutlined
} from '@ant-design/icons';
import logo from '../../assets/logo.png';

const { Sider } = Layout;
const { SubMenu } = Menu;

const AccountantSidebar = ({ collapsed }) => {
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
        defaultOpenKeys={collapsed ? [] : ['finance', 'reports']}
      >
        <Menu.Item key="/admin/dashboard" icon={<DashboardOutlined />}>
          <Link to="/admin/dashboard">Dashboard</Link>
        </Menu.Item>
        
        <SubMenu key="finance" icon={<DollarOutlined />} title="Tài chính">
          <Menu.Item key="/admin/finance/revenue">
            <Link to="/admin/finance/revenue">Doanh thu</Link>
          </Menu.Item>
          <Menu.Item key="/admin/finance/expenses">
            <Link to="/admin/finance/expenses">Chi phí</Link>
          </Menu.Item>
          <Menu.Item key="/admin/finance/invoices">
            <Link to="/admin/finance/invoices">Hóa đơn</Link>
          </Menu.Item>
        </SubMenu>
        
        <Menu.Item key="/admin/orders" icon={<ShoppingOutlined />}>
          <Link to="/admin/orders">Đơn hàng</Link>
        </Menu.Item>
        
        <Menu.Item key="/admin/transactions" icon={<BankOutlined />}>
          <Link to="/admin/transactions">Giao dịch</Link>
        </Menu.Item>
        
        <SubMenu key="reports" icon={<FileTextOutlined />} title="Báo cáo">
          <Menu.Item key="/admin/reports/financial">
            <Link to="/admin/reports/financial">Báo cáo tài chính</Link>
          </Menu.Item>
          <Menu.Item key="/admin/reports/tax">
            <Link to="/admin/reports/tax">Báo cáo thuế</Link>
          </Menu.Item>
          <Menu.Item key="/admin/reports/sales">
            <Link to="/admin/reports/sales">Báo cáo bán hàng</Link>
          </Menu.Item>
        </SubMenu>
        
        <Menu.Item key="/admin/analytics" icon={<BarChartOutlined />}>
          <Link to="/admin/analytics">Phân tích</Link>
        </Menu.Item>
        
        <Menu.Item key="/admin/settings" icon={<SettingOutlined />}>
          <Link to="/admin/settings">Cài đặt</Link>
        </Menu.Item>
        
        <Menu.Item key="/admin/design-orders" icon={<FileImageOutlined />}>
          <Link to="/admin/design-orders">Đơn đặt thiết kế</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default AccountantSidebar; 