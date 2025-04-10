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
    <Sider trigger={null} collapsible collapsed={collapsed} width={250} theme="light">
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
        <Menu.Item key="/accountant/dashboard" icon={<DashboardOutlined />}>
          <Link to="/accountant/dashboard">Dashboard</Link>
        </Menu.Item>
        
        {/* <SubMenu key="finance" icon={<DollarOutlined />} title="Tài chính">
          <Menu.Item key="/accountant/finance/revenue">
            <Link to="/accountant/finance/revenue">Doanh thu</Link>
          </Menu.Item>
          <Menu.Item key="/accountant/finance/expenses">
            <Link to="/accountant/finance/expenses">Chi phí</Link>
          </Menu.Item>
          <Menu.Item key="/accountant/finance/invoices">
            <Link to="/accountant/finance/invoices">Hóa đơn</Link>
          </Menu.Item>
        </SubMenu> */}

        <SubMenu key="service-orders" icon={<FileImageOutlined />} title="Đơn đặt thiết kế">
          <Menu.Item key="/accountant/service-orders">
            <Link to="/accountant/service-orders">Danh sách đơn thiết kế</Link>
          </Menu.Item>
          {/* <Menu.Item key="/accountant/design-orders/pending">
            <Link to="/accountant/design-orders/pending">Đơn chờ xử lý</Link>
          </Menu.Item> */}
        </SubMenu>
        
        {/* <Menu.Item key="/accountant/orders" icon={<ShoppingOutlined />}>
          <Link to="/accountant/orders">Đơn hàng</Link>
        </Menu.Item>
        
        <Menu.Item key="/accountant/transactions" icon={<BankOutlined />}>
          <Link to="/accountant/transactions">Giao dịch</Link>
        </Menu.Item> */}
        
        {/* <SubMenu key="reports" icon={<FileTextOutlined />} title="Báo cáo">
          <Menu.Item key="/accountant/reports/financial">
            <Link to="/accountant/reports/financial">Báo cáo tài chính</Link>
          </Menu.Item>
          <Menu.Item key="/accountant/reports/tax">
            <Link to="/accountant/reports/tax">Báo cáo thuế</Link>
          </Menu.Item>
          <Menu.Item key="/accountant/reports/sales">
            <Link to="/accountant/reports/sales">Báo cáo bán hàng</Link>
          </Menu.Item>
        </SubMenu> */}
        
        {/* <Menu.Item key="/accountant/analytics" icon={<BarChartOutlined />}>
          <Link to="/accountant/analytics">Phân tích</Link>
        </Menu.Item>
        
        <Menu.Item key="/accountant/settings" icon={<SettingOutlined />}>
          <Link to="/accountant/settings">Cài đặt</Link>
        </Menu.Item> */}
      </Menu>
    </Sider>
  );
};

export default AccountantSidebar; 