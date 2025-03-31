import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Dropdown, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined, WalletOutlined } from '@ant-design/icons';
import useAuthStore from '../../../stores/useAuthStore';
import './styles/UserMenu.scss';

function UserMenu({ user }) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const userMenuItems = React.useMemo(() => [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin tài khoản",
      onClick: () => navigate("/profile"),
    },
    {
      key: "userwallets",
      icon: <WalletOutlined />,
      label: "Ví tiền",
      onClick: () => navigate("/userwallets"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: () => {
        logout();
        navigate("/");
      },
    },
  ], [navigate, logout]);

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