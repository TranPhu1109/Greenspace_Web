import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  TeamOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  FileTextOutlined,
  ProjectOutlined,
  ShopOutlined,
  SettingOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import logo from "../../assets/logo.png";
import "./AdminSidebar.scss";

const { Sider } = Layout;
const { SubMenu } = Menu;

const ManagerSidebar = ({ collapsed }) => {
  const location = useLocation();

  // Add this function to get the base path for selection
  const getSelectedKey = (pathname) => {
    if (pathname.startsWith("/manager/")) {
      return pathname.split("/").slice(0, 3).join("/");
    }
    return pathname;
  };

  return (
    <div>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        theme="light"
        className="admin-sider"
      >
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
          {/* {!collapsed && <span className="logo-text">GreenSpace</span>} */}
        </div>
        <div className="menu-container">
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[getSelectedKey(location.pathname)]}
            defaultOpenKeys={collapsed ? [] : ["staff", "reports", "sales"]}
          >
            <Menu.Item key="/manager/dashboard" icon={<DashboardOutlined />}>
              <Link to="/manager/dashboard">Dashboard</Link>
            </Menu.Item>

            <SubMenu
              key="staff"
              icon={<TeamOutlined />}
              title="Danh sách người dùng"
            >
              <Menu.Item key="/manager/customer-list">
                <Link to="/manager/customer-list">Danh sách khách hàng</Link>
              </Menu.Item>
              <Menu.Item key="/manager/employee-list">
                <Link to="/manager/employee-list">Danh sách nhân viên</Link>
              </Menu.Item>
            </SubMenu>

            <Menu.Item key="/manager/products" icon={<AppstoreOutlined />}>
              <Link to="/manager/products">Sản phẩm</Link>
            </Menu.Item>

            <SubMenu key="sales" icon={<ShoppingOutlined />} title="Bán hàng">
              <Menu.Item key="/manager/orders">
                <Link to="/manager/orders">Đơn hàng</Link>
              </Menu.Item>
              <Menu.Item key="/manager/promotions">
                <Link to="/manager/promotions">Khuyến mãi</Link>
              </Menu.Item>
            </SubMenu>

            <Menu.Item key="/manager/transactions" icon={<HistoryOutlined />}>
              <Link to="/manager/transactions">Lịch sử giao dịch</Link>
            </Menu.Item>

            <SubMenu key="reports" icon={<FileTextOutlined />} title="Báo cáo">
              <Menu.Item key="/manager/reports/sales">
                <Link to="/manager/reports/sales">Báo cáo bán hàng</Link>
              </Menu.Item>
              <Menu.Item key="/manager/reports/inventory">
                <Link to="/manager/reports/inventory">Báo cáo kho hàng</Link>
              </Menu.Item>
              <Menu.Item key="/manager/reports/financial">
                <Link to="/manager/reports/financial">Báo cáo tài chính</Link>
              </Menu.Item>
            </SubMenu>

            {/* <Menu.Item key="/manager/analytics" icon={<BarChartOutlined />}>
              <Link to="/manager/analytics">Phân tích</Link>
            </Menu.Item>

            <Menu.Item key="/manager/settings" icon={<SettingOutlined />}>
              <Link to="/manager/settings">Cài đặt</Link>
            </Menu.Item> */}
          </Menu>
        </div>
      </Sider>
    </div>
  );
};

export default ManagerSidebar;
