import { useState, useEffect } from "react";
import { Layout, Menu, Dropdown, Avatar, Badge } from "antd";
import {
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
import Notifications from "@/components/Notifications";
import signalRService from "@/services/signalRService";
import "./AdminLayout.scss";
import useAuthStore from "@/stores/useAuthStore";
import { useRoleBasedPath } from "@/hooks/useRoleBasedPath";

const { Header, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user"));
  const { getAccountPath } = useRoleBasedPath();

  useEffect(() => {
    const connectSignalR = async () => {
      try {
        await signalRService.startConnection();

        signalRService.on("messageReceived", (messageType, messageData) => {
          console.log(`SignalR messageReceived - Type: ${messageType}, Data: ${messageData}`);

          setNotifications((prevNotifications) => {
            const isDuplicate = prevNotifications.some(notif => notif.relatedId === messageData);

            if (isDuplicate) {
              // Don't add duplicate, return previous state
              return prevNotifications;
            } else {
              // Not a duplicate, create new notification and update count
              const newNotification = {
                id: Date.now(), // Use timestamp as unique key for React list rendering
                relatedId: messageData, // Store the actual ID for navigation/logic
                messageType: messageType, // Store the original message type
                title: messageType === 'UpdateOrderService' ? "Cập nhật đơn hàng" : "Thông báo",
                message: `Cập nhật cho ID: ${messageData}`,
                timestamp: new Date().toLocaleTimeString(),
                read: false,
              };

              // Increment count since it's a new notification
              setNotificationCount(prevCount => prevCount + 1);

              // Return new state with the notification added and list trimmed
              return [newNotification, ...prevNotifications.slice(0, 9)];
            }
          });
        });

      } catch (err) {
        console.error("SignalR connection failed: ", err);
      }
    };

    connectSignalR();

    return () => {
      signalRService.off("messageReceived");
      signalRService.stopConnection();
    };
  }, []);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setRole(userData.roleName.toLowerCase());
      setUsername(userData.name);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const savedRole = localStorage.getItem("selectedRole");
    const location = window.location.pathname;
    if (savedRole && location === `/${savedRole}`) {
      setRole(savedRole);
      navigate(`/${savedRole}/dashboard`);
    } else if (savedRole) {
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
    console.log("Notification clicked:", notification);

    if (notification.relatedId && notification.messageType) {
      // Extract only the ID part before any dash
      const orderId = notification.relatedId.split(" -")[0].trim();
      const messageType = notification.messageType;
      let detailPath = "";

      // Determine the path based on messageType and role
      switch (messageType) {
        case 'UpdateOrderService':
          switch (role) {
            case 'staff':
              detailPath = `/staff/design-orders/new-design-orders/${orderId}`;
              break;
            case 'designer':
              detailPath = `/designer/tasks/${orderId}`; // Adjust as needed
              break;
            case 'manager':
              detailPath = `/manager/new-design-orders/${orderId}`;
              break;
            case 'accountant':
              detailPath = `/accountant/service-orders/${orderId}`;
              break;
            case 'admin':
              detailPath = `/${role}/orders/${orderId}`; // Adjust as needed
              break;

            default:
              console.warn(`Unhandled role '${role}' for UpdateOrderService notification.`);
              break;
          }
          break;

        default:
          console.warn(`Unhandled messageType '${messageType}' for notification navigation.`);
          break;
      }

      if (detailPath) {
        console.log(`Navigating to: ${detailPath}`);
        navigate(detailPath);

        // Mark notification as read locally
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        // Optional: Decrease count logic if needed
      } else {
        console.log("No navigation path determined for this notification.");
      }
    } else {
      console.log("Notification missing relatedId or messageType, cannot navigate.");
    }
  };

  const handleViewAllClick = () => {
    console.log("View all notifications clicked");
    setNotificationCount(0);
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
            <Notifications
              count={notificationCount}
              notifications={notifications}
              onNotificationClick={handleNotificationClick}
              onViewAllClick={handleViewAllClick}
            />
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
