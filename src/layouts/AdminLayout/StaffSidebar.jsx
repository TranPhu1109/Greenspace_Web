import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  ProjectOutlined,
  SettingOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SignatureOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import logo from "../../assets/logo.png";
import "./AdminSidebar.scss";
import { MdOutlineFeedback } from "react-icons/md";

const { Sider } = Layout;
const { SubMenu } = Menu;

const StaffSidebar = ({ collapsed }) => {
  const location = useLocation();

  const getSelectedKey = (pathname) => {
    // For blog section
    if (pathname.startsWith("/staff/blog/")) {
      return pathname === "/staff/blog/new-blog" ? pathname : "/staff/blog";
    }
    // For design orders section
    if (pathname.startsWith("/staff/design-orders/")) {
      const subPath = pathname.split("/")[3];
      return `/staff/design-orders/${subPath}`;
    }
    // For other sections
    return pathname;
  };

  // Get open keys based on current path
  const getOpenKeys = () => {
    if (location.pathname.includes("/design-orders")) {
      return ["design-orders"];
    }
    return [];
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
        </div>
        <div className="menu-container">
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[getSelectedKey(location.pathname)]}
            defaultOpenKeys={collapsed ? [] : getOpenKeys()}
          >
            <Menu.Item key="/staff/dashboard" icon={<DashboardOutlined />}>
              <Link to="/staff/dashboard">Dashboard</Link>
            </Menu.Item>

            <SubMenu
              key="design-orders"
              icon={<ProjectOutlined />}
              title="Quản lý đơn thiết kế"
            >
              <Menu.Item key="/staff/design-orders/template-orders">
                <Link to="/staff/design-orders/template-orders">
                  Đơn đặt theo mẫu
                </Link>
              </Menu.Item>

              <Menu.Item key="/staff/design-orders/custom-template-orders">
                <Link to="/staff/design-orders/custom-template-orders">
                  Đơn tùy chỉnh từ mẫu
                </Link>
              </Menu.Item>

              <Menu.Item key="/staff/design-orders/new-design-orders">
                <Link to="/staff/design-orders/new-design-orders">
                  Đơn thiết kế mới
                </Link>
              </Menu.Item>
            </SubMenu>

            <Menu.Item key="/staff/orders" icon={<ShoppingCartOutlined />}>
              <Link to="/staff/orders">Đơn hàng</Link>
            </Menu.Item>

            <Menu.Item key="/staff/products" icon={<AppstoreOutlined />}>
              <Link to="/staff/products">Sản phẩm</Link>
            </Menu.Item>

            <Menu.Item key="/staff/schedule" icon={<CalendarOutlined />}>
              <Link to="/staff/schedule">Lịch làm việc</Link>
            </Menu.Item>

            <Menu.Item key="/staff/feedback" icon={<MdOutlineFeedback />}>
              <Link to="/staff/feedback">Phản hồi</Link>
            </Menu.Item>
            <SubMenu
              key="blog"
              icon={<FileTextOutlined />}
              title="Quản lý Blog"
            >
              <Menu.Item key="/staff/blog" icon={<UnorderedListOutlined />}>
                <Link to="/staff/blog">Danh sách bài đăng</Link>
              </Menu.Item>
              <Menu.Item key="/staff/blog/new-blog" icon={<SignatureOutlined />}>
                <Link to="/staff/blog/new-blog">Tạo bài viết</Link>
              </Menu.Item>
            </SubMenu>
            <Menu.Item key="/staff/settings" icon={<SettingOutlined />}>
              <Link to="/staff/settings">Cài đặt</Link>
            </Menu.Item>
          </Menu>
        </div>
      </Sider>
    </div>
  );
};

export default StaffSidebar;
