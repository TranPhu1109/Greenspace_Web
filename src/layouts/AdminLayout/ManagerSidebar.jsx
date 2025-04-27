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

const ManagerSidebar = ({ collapsed }) => {
  const location = useLocation();

  // Add this function to get the base path for selection
  const getSelectedKey = (pathname) => {
    if (pathname.startsWith("/manager/")) {
      return pathname.split("/").slice(0, 3).join("/");
    }
    return pathname;
  };

  // Define menu items using the new items format
  const getItems = () => {
    return [
      {
        key: "/manager/dashboard",
        icon: <DashboardOutlined />,
        label: <Link to="/manager/dashboard">Dashboard</Link>,
      },
      {
        key: "staff",
        icon: <TeamOutlined />,
        label: "Danh sách người dùng",
        children: [
          {
            key: "/manager/customer-list",
            label: <Link to="/manager/customer-list">Danh sách khách hàng</Link>,
          },
          {
            key: "/manager/employee-list",
            label: <Link to="/manager/employee-list">Danh sách nhân viên</Link>,
          },
        ],
      },
      {
        key: "/manager/products",
        icon: <AppstoreOutlined />,
        label: <Link to="/manager/products">Sản phẩm</Link>,
      },
      {
        key: "sales",
        icon: <ShoppingOutlined />,
        label: "Bán hàng",
        children: [
          {
            key: "/manager/orders",
            label: <Link to="/manager/orders">Đơn hàng</Link>,
          },
          {
            key: "/manager/promotions",
            label: <Link to="/manager/promotions">Khuyến mãi</Link>,
          },
          {
            key: "/manager/complaints",
            label: <Link to="/manager/complaints">Xử lý khiếu nại hoàn tiền</Link>,
          },
        ],
      },
      // {
      //   key: "/manager/new-design-orders",
      //   icon: <ProjectOutlined />,
      //   label: <Link to="/manager/new-design-orders">Đơn đặt thiết kế mới</Link>,
      // },
      {
        key: "designOrders",
        icon: <ProjectOutlined />,
        label: "Đơn đặt thiết kế",
        children: [
          {
            key: "/manager/new-design-orders",
            label: <Link to="/manager/new-design-orders">Danh sách đơn</Link>,
          },
          {
            key: "/manager/deposit-management",
            label: <div style={{ whiteSpace: 'normal', lineHeight: '1.2' }}>
            <Link to="/manager/deposit-management">
              Quản lý tỷ lệ đặt cọc / hoàn cọc
            </Link>
          </div>,
          },
        ],
      },      
      {
        key: "/manager/transactions",
        icon: <HistoryOutlined />,
        label: <Link to="/manager/transactions">Lịch sử giao dịch</Link>,
      },
      {
        key: "reports",
        icon: <FileTextOutlined />,
        label: "Báo cáo",
        children: [
          {
            key: "/manager/reports/sales",
            label: <Link to="/manager/reports/sales">Báo cáo bán hàng</Link>,
          },
          {
            key: "/manager/reports/inventory",
            label: <Link to="/manager/reports/inventory">Báo cáo kho hàng</Link>,
          },
          {
            key: "/manager/reports/financial",
            label: <Link to="/manager/reports/financial">Báo cáo tài chính</Link>,
          },
        ],
      },
      {
        key: "/manager/webmanage",
        icon: <SettingOutlined />,
        label: <Link to="/manager/webmanage">Quản lý logo & banner website</Link>,
      },
      // Commented items can be added back if needed
      // {
      //   key: "/manager/analytics",
      //   icon: <BarChartOutlined />,
      //   label: <Link to="/manager/analytics">Phân tích</Link>,
      // },
      // {
      //   key: "/manager/settings",
      //   icon: <SettingOutlined />,
      //   label: <Link to="/manager/settings">Cài đặt</Link>,
      // },
    ];
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
            items={getItems()}
          />
        </div>
      </Sider>
    </div>
  );
};

export default ManagerSidebar;
