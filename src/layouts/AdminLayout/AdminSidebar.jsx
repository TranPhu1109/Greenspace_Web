import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import logo from "../../assets/logo.png";
import "./AdminSidebar.scss";
import { useRoleBasedPath } from "@/hooks/useRoleBasedPath";

const { Sider } = Layout;
const { SubMenu } = Menu;

const AdminSidebar = ({ collapsed }) => {
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
            <Menu.Item key="/admin/dashboard" icon={<DashboardOutlined />}>
              <Link to="/admin/dashboard">Dashboard</Link>
            </Menu.Item>

            <SubMenu
              key="users"
              icon={<UserOutlined />}
              title="Quản lý người dùng"
            >
              <Menu.Item key="/admin/users">
                <Link to="/admin/users">Danh sách khách hàng</Link>
              </Menu.Item>
              <Menu.Item key="/admin/staff">
                <Link to="/admin/staff">Danh sách nhân viên</Link>
              </Menu.Item>
              <Menu.Item key="/admin/account-banned">
                <Link to="/admin/account-banned">Tài khoản bị khóa</Link>
              </Menu.Item>
            </SubMenu>

            {/* <SubMenu
              key="products"
              icon={<ShoppingOutlined />}
              title="Quản lý sản phẩm"
            >
              <Menu.Item key="/admin/products">
                <Link to="/admin/products">Danh sách sản phẩm</Link>
              </Menu.Item>
              <Menu.Item key="/admin/products/categories">
                <Link to="/admin/products/categories">Danh mục sản phẩm</Link>
              </Menu.Item>
              <Menu.Item key="/admin/products/inventory">
                <Link to="/admin/products/inventory">Kho hàng</Link>
              </Menu.Item>
            </SubMenu> */}

            {/* <SubMenu
              key="orders"
              icon={<ShoppingOutlined />}
              title="Quản lý đơn hàng"
            >
              <Menu.Item key="/admin/orders">
                <Link to="/admin/orders">Danh sách đơn hàng</Link>
              </Menu.Item>
              <Menu.Item key="/admin/orders/shipping">
                <Link to="/admin/orders/shipping">Vận chuyển</Link>
              </Menu.Item>
            </SubMenu> */}

            {/* <SubMenu
              key="staff"
              icon={<TeamOutlined />}
              title="Quản lý nhân viên"
            >
              <Menu.Item key="/admin/staff">
                <Link to="/admin/staff">Danh sách nhân viên</Link>
              </Menu.Item>
              <Menu.Item key="/admin/staff/roles">
                <Link to="/admin/staff/roles">Phân quyền</Link>
              </Menu.Item>
            </SubMenu> */}

            {/* <div className="menu-section-divider">
          <span className="menu-section-title">Accountant</span>
        </div> */}
            {/* <SubMenu
              key="design-orders"
              icon={<FileImageOutlined />}
              title="Đơn đặt thiết kế"
            >
              <Menu.Item key="/admin/design-orders">
                <Link to="/admin/design-orders">Danh sách đơn thiết kế</Link>
              </Menu.Item>
              <Menu.Item key="/admin/design-orders/pending">
                <Link to="/admin/design-orders/pending">Đơn chờ xử lý</Link>
              </Menu.Item>
            </SubMenu> */}
            {/* <div className="menu-section-divider">
          <span className="menu-section-title">Designer</span>
        </div>

        <div className="menu-section-divider">
          <span className="menu-section-title">Staff</span>
        </div> */}

            {/* <Menu.Item key="/admin/reports" icon={<FileTextOutlined />}>
              <Link to="/admin/reports">Báo cáo</Link>
            </Menu.Item> */}
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

export default AdminSidebar;
