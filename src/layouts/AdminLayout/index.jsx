import { useState, useEffect } from "react";
import { Layout, Menu, Dropdown, Avatar, message } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AccountantSidebar from "./AccountantSidebar";
import StaffSidebar from "./StaffSidebar";
import DesignerSidebar from "./DesignerSidebar";
import ManagerSidebar from "./ManagerSidebar";
import Notifications from "@/components/Notifications";
import "./AdminLayout.scss";
import useAuthStore from "@/stores/useAuthStore";
import useNotificationStore from "@/stores/useNotificationStore";
import { useRoleBasedPath } from "@/hooks/useRoleBasedPath";
import ContructorSidebar from "./ContructorSidebar";
import { setupForegroundFCMListener } from "@/firebase/firebase-messaging-handler";
import TimeAdjustmentControl from "@/components/TimeAdjustmentControl";
import TestModeIndicator from "@/components/TestModeIndicator";

const { Header, Content } = Layout;

// List of roles allowed to access the admin layout
const ALLOWED_ROLES = ["admin", "accountant", "staff", "designer", "manager", "contructor"];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user"));
  const { getAccountPath } = useRoleBasedPath();
  const { fetchNotifications } = useNotificationStore();

  // Fetch notifications when component mounts
  useEffect(() => {
    setupForegroundFCMListener();
  }, []);
  // useEffect(() => {
  //   if (userData && userData.id) {
  //     fetchNotifications();
  //   }
  // }, [fetchNotifications]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      const userRole = userData.roleName.toLowerCase();
      setRole(userRole);
      setUsername(userData.name);
      
      // Check if the user's role is allowed to access admin layout
      if (!ALLOWED_ROLES.includes(userRole)) {
        navigate('/');
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const savedRole = localStorage.getItem("selectedRole");
    const location = window.location.pathname;
    if (savedRole && location === `/${savedRole}`) {
      // Verify the role is allowed before setting it
      if (ALLOWED_ROLES.includes(savedRole)) {
        setRole(savedRole);
        navigate(`/${savedRole}/dashboard`);
      } else {
        navigate('/');
      }
    } else if (savedRole && ALLOWED_ROLES.includes(savedRole)) {
      setRole(savedRole);
    }
  }, []);

  const handleLogout = () => {
    useAuthStore.getState().logout();
    navigate("/login");
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleNotificationClick = (notification) => {
    // Extract ID and determine navigation path based on notification content/type
    if (notification.content) {
      // Try to extract ID from content using regex (looking for patterns like "Mã đơn: uuid")
      const orderIdMatch = notification.content.match(/Mã đơn: ([a-f0-9-]+)/i);
      
      if (orderIdMatch && orderIdMatch[1]) {
        const orderId = orderIdMatch[1].trim();
        let detailPath = "";

        // Determine the path based on notification title and user role
        if (notification.title.includes("dịch vụ thiết kế")) {
          switch (role) {
            case 'staff':
              detailPath = `/staff/design-orders/new-design-orders/${orderId}`;
              break;
            case 'designer':
              detailPath = `/designer/tasks/${orderId}`;
              break;
            case 'manager':
              detailPath = `/manager/new-design-orders/${orderId}`;
              break;
            case 'accountant':
              detailPath = `/accountant/service-orders/${orderId}`;
              break;
            case 'admin':
              detailPath = `/${role}/orders/${orderId}`;
              break;
            default:
              console.warn(`Unhandled role '${role}' for design order notification.`);
              break;
          }
        } else {
          // Handle other notification types as needed
          console.log("Unrecognized notification type:", notification.title);
        }

        if (detailPath) {
          console.log(`Navigating to: ${detailPath}`);
          navigate(detailPath);
        } else {
          console.log("No navigation path determined for this notification.");
        }
      }
    }
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
      case "contructor":
        return <ContructorSidebar collapsed={collapsed} />;
      default:
        // Redirect to home if role is not allowed
        navigate('/');
        return null;
    }
  };

  const userMenu = (
    <Menu>
      <Menu.Item
        key="profile"
        icon={<UserOutlined />}
        onClick={() => navigate("profile")}
      >
        Thông tin cá nhân
      </Menu.Item>
      {/* <Menu.Item
        key="settings"
        icon={<SettingOutlined />}
        onClick={() => navigate(getAccountPath("settings"))}
      >
        Cài đặt tài khoản
      </Menu.Item> */}
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  // If user has an unauthorized role, don't render the admin layout
  if (!ALLOWED_ROLES.includes(role)) {
    return null;
  }

  return (
    <Layout className="admin-layout">
      {renderSidebar()}
      <Layout className={`site-layout ${collapsed ? "collapsed" : ""}`}>
        <Header className="admin-header">
          <div className="header-left">
            <div className="trigger" onClick={toggleCollapsed}>
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
            {/* Only show TimeAdjustmentControl for Contructor and Designer roles */}
            {(role === "contructor" || role === "designer") && (
              <TimeAdjustmentControl compact={true} />
            )}
          </div>
          <div className="header-right">
            {/* Only show TestModeIndicator for Contructor and Designer roles */}
            {(role === "contructor" || role === "designer") && (
              <TestModeIndicator/>
            )}
            <Notifications onNotificationClick={handleNotificationClick} />
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
