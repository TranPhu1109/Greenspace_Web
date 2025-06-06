import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  CalendarOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";
import logo from "../../assets/logo.png";
import "./AdminSidebar.scss";
import { useRoleBasedPath } from "@/hooks/useRoleBasedPath";

const { Sider } = Layout;
const { SubMenu } = Menu;

const ContructorSidebar = ({ collapsed }) => {
  const location = useLocation();
  const { getAccountPath } = useRoleBasedPath();

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
            selectedKeys={[location.pathname]}
            defaultOpenKeys={
              collapsed ? [] : ["users", "products", "orders", "staff"]
            }
          >
            <Menu.Item key="/contructor/dashboard" icon={<DashboardOutlined />}>
              <Link to="/contructor/dashboard">Dashboard</Link>
            </Menu.Item>

            {/* <Menu.Item key="/contructor/schedule" icon={<CalendarOutlined />}>
              <Link to="/contructor/schedule">Lịch làm việc</Link>
            </Menu.Item> */}

            <Menu.Item key="/contructor/tasks" icon={<OrderedListOutlined />}>
              <Link to="/contructor/tasks">Quản lý công việc</Link>
            </Menu.Item>

            {/* <SubMenu key="account" icon={<SettingOutlined />} title="Tài khoản">
              <Menu.Item key={getAccountPath("profile")}>
                <Link to={getAccountPath("profile")}>Thông tin cá nhân</Link>
              </Menu.Item>
              <Menu.Item key={getAccountPath("settings")}>
                <Link to={getAccountPath("settings")}>Cài đặt tài khoản</Link>
              </Menu.Item>
            </SubMenu> */}
          </Menu>
        </div>
      </Sider>
    </div>
  );
};

export default ContructorSidebar;
