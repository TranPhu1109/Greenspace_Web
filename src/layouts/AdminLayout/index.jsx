import { useState, useEffect } from "react";
import { Layout, Menu, Dropdown, Avatar, Badge } from "antd";
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AccountantSidebar from "./AccountantSidebar";
import StaffSidebar from "./StaffSidebar";
import DesignerSidebar from "./DesignerSidebar";
import ManagerSidebar from "./ManagerSidebar";
import "./AdminLayout.scss";
import useAuthStore from "@/stores/useAuthStore";
import { useRoleBasedPath } from "@/hooks/useRoleBasedPath";

const { Header, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user"));
  const { getAccountPath } = useRoleBasedPath();
  // console.log(userData);

  useEffect(() => {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setRole(userData.roleName.toLowerCase());
      setUsername(userData.name);
    } else {
      // Redirect to login if no user data
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    useAuthStore.getState().logout();
    navigate("/login");
  };

  useEffect(() => {
    const savedRole = localStorage.getItem("selectedRole");
    if (savedRole) {
      setRole(savedRole);
      navigate(`/${savedRole}/dashboard`);
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const renderSidebar = () => {
    switch (role) {
      case "admin":
        return <AdminSidebar collapsed={collapsed} />;
      case "accountant":
        return <AccountantSidebar collapsed={collapsed} />;
      case "staff":
        return <StaffSidebar collapsed={collapsed} />;
      case "designer":
        return <DesignerSidebar collapsed={collapsed} />;
      case "manager":
        return <ManagerSidebar collapsed={collapsed} />;
      default:
        return <AdminSidebar collapsed={collapsed} />;
    }
  };

  const userMenu = (
    <Menu>
      <Menu.Item
        key="profile"
        icon={<UserOutlined />}
        onClick={() => navigate(getAccountPath("profile"))}
      >
        Thông tin cá nhân
      </Menu.Item>
      <Menu.Item
        key="settings"
        icon={<SettingOutlined />}
        onClick={() => navigate(getAccountPath("settings"))}
      >
        Cài đặt tài khoản
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  const notificationMenu = (
    <Menu>
      <Menu.Item key="notification1">
        <div className="notification-item">
          <div className="notification-title">Đơn hàng mới</div>
          <div className="notification-time">5 phút trước</div>
          <div className="notification-content">Có đơn hàng mới cần xử lý</div>
        </div>
      </Menu.Item>
      <Menu.Item key="notification2">
        <div className="notification-item">
          <div className="notification-title">Yêu cầu thiết kế</div>
          <div className="notification-time">30 phút trước</div>
          <div className="notification-content">
            Khách hàng gửi yêu cầu thiết kế mới
          </div>
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="viewAll">
        <div className="view-all">Xem tất cả</div>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="admin-layout">
      {renderSidebar()}
      <Layout className={`site-layout ${collapsed ? "collapsed" : ""}`}>
        <Header className="admin-header">
          <div className="header-left">
            <div className="trigger" onClick={toggleCollapsed}>
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
          </div>
          <div className="header-right">
            <Dropdown
              overlay={notificationMenu}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Badge count={2} className="notification-badge">
                <BellOutlined className="header-icon" />
              </Badge>
            </Dropdown>
            <Dropdown
              overlay={userMenu}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div className="user-info">
                <div className="user-avatar">
                  <Avatar
                    size={32}
                    src={userData?.avatarUrl}
                    style={{
                      backgroundColor: userData?.avatarUrl
                        ? "transparent"
                        : "#4caf50",
                    }}
                  >
                    {!userData?.avatarUrl &&
                      userData?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                </div>
                <div className="user-details">
                  <span className="user-name">{userData?.name}</span>
                  <span className="user-email">{userData?.email}</span>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
