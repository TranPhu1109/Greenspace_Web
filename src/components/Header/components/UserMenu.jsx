import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Dropdown, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined, WalletOutlined, DashboardOutlined } from '@ant-design/icons';
import useAuthStore from '../../../stores/useAuthStore';
import './styles/UserMenu.scss';
import { MdDashboardCustomize, MdOutlineDashboardCustomize } from 'react-icons/md';

function UserMenu({ user }) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const savedUserRaw = localStorage.getItem("user");
  let savedRole = null;

  try {
    const savedUser = JSON.parse(savedUserRaw);
    savedRole = savedUser?.roleName || null;
  } catch (e) {
    console.warn("Failed to parse saved user from localStorage", e);
  }


  const rolesWithDashboard = ["staff", "manager", "designer", "accountant", "contructor", "admin"];
  const rolesHideWallet = ["staff", "admin", "designer", "accountant", "contructor", "manager"];

  const userMenuItems = React.useMemo(() => {
    const items = [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "Thông tin tài khoản",
        onClick: () => navigate("/profile"),
      },
      // {
      //   key: "userwallets",
      //   icon: <WalletOutlined />,
      //   label: "Ví tiền",
      //   onClick: () => navigate("/userwallets"),
      // },
    ];

    if (!savedRole || !rolesHideWallet.includes(savedRole.toLowerCase())) {
      items.push({
        key: "userwallets",
        icon: <WalletOutlined />,
        label: "Ví tiền",
        onClick: () => navigate("/userwallets"),
      });
    }

    if (savedRole && rolesWithDashboard.includes(savedRole.toLowerCase())) {
      items.push({
        key: "admin-dashboard",
        icon: <MdOutlineDashboardCustomize />,
        label: "Trang quản lý",
        onClick: () => navigate(`/${savedRole.toLowerCase()}/dashboard`),
      });
    }

    items.push(
      { type: "divider" },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Đăng xuất",
        onClick: () => {
          logout();
          navigate("/");
        },
      }
    );

    return items;
  }, [navigate, logout, savedRole]);

  // const userMenuItems = React.useMemo(() => [
  //   {
  //     key: "profile",
  //     icon: <UserOutlined />,
  //     label: "Thông tin tài khoản",
  //     onClick: () => navigate("/profile"),
  //   },
  //   {
  //     key: "userwallets",
  //     icon: <WalletOutlined />,
  //     label: "Ví tiền",
  //     onClick: () => navigate("/userwallets"),
  //   },
  //   {
  //     type: "divider",
  //   },
  //   {
  //     key: "logout",
  //     icon: <LogoutOutlined />,
  //     label: "Đăng xuất",
  //     onClick: () => {
  //       logout();
  //       navigate("/");
  //     },
  //   },
  // ], [navigate, logout]);

  return (
    <Dropdown
      menu={{ items: userMenuItems }}
      placement="bottomRight"
      arrow
      trigger={["click"]}
    >
      <div className="user-profile-trigger">
        <Avatar
          size="small"
          icon={<UserOutlined />}
          src={user.avatar}
          className="user-avatar"
          style={{
            marginRight: "5px",
          }}
        />
        <span className="user-name">{user.name || "Tài khoản"}</span>
      </div>
    </Dropdown>
  );
}

UserMenu.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
  }).isRequired,
};

export default React.memo(UserMenu); 