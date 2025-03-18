import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  FileImageOutlined,
  ProjectOutlined,
  SettingOutlined,
  AppstoreOutlined,
  TeamOutlined,
  MessageOutlined,
  CalendarOutlined,
  DesktopOutlined,
  FileTextOutlined,
  ScheduleOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import logo from "../../assets/logo.png";
import { MdOutlineFeedback } from "react-icons/md";

const { Sider } = Layout;
const { SubMenu } = Menu;

const StaffSidebar = ({ collapsed }) => {
  const location = useLocation();

  // const items = [
  //   {
  //     key: 'design-orders',
  //     icon: <FileTextOutlined />,
  //     label: 'Quản lý đơn thiết kế',
  //     children: [
  //       {
  //         key: 'template-orders',
  //         label: 'Đơn đặt từ mẫu',
  //         path: '/staff/design-orders/template-orders'
  //       },
  //       {
  //         key: 'custom-template-orders',
  //         label: 'Đơn tùy chỉnh từ mẫu',
  //         path: '/staff/design-orders/custom-template-orders'
  //       }
  //     ]
  //   },
  // ];

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={250}
      theme="light"
    >
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
        {/* {!collapsed && <span className="logo-text">GreenSpace</span>} */}
      </div>
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={collapsed ? [] : ["design-orders"]}
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

          {/* <Menu.Item key="/staff/design-orders/pending">
            <Link to="/staff/design-orders/pending">
              Đơn chờ xử lý
            </Link>
          </Menu.Item> */}
        </SubMenu>

        <Menu.Item key="/staff/orders" icon={<ShoppingCartOutlined />}>
          <Link to="/staff/orders">Đơn hàng</Link>
        </Menu.Item>

        <Menu.Item key="/staff/products" icon={<AppstoreOutlined />}>
          <Link to="/staff/products">Sản phẩm</Link>
        </Menu.Item>

        {/* <Menu.Item key="/staff/customers" icon={<TeamOutlined />}>
          <Link to="/staff/customers">Khách hàng</Link>
        </Menu.Item> */}

        <Menu.Item key="/staff/schedule" icon={<CalendarOutlined />}>
          <Link to="/staff/schedule">Lịch làm việc</Link>
        </Menu.Item>

        <Menu.Item key="/staff/messages" icon={<MessageOutlined />}>
          <Link to="/staff/messages">Tin nhắn</Link>
        </Menu.Item>

        <Menu.Item key="/staff/feedback" icon={<MdOutlineFeedback />}>
          <Link to="/staff/feedback">Phản hồi</Link>
        </Menu.Item>

        {/* <Menu.Item key="/designer/schedule" icon={<CalendarOutlined />}>
          <Link to="/designer/schedule">Lịch làm việc</Link>
        </Menu.Item> */}

        <Menu.Item key="/staff/settings" icon={<SettingOutlined />}>
          <Link to="/staff/settings">Cài đặt</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default StaffSidebar;
