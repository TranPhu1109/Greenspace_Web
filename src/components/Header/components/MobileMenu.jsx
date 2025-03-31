import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { Drawer, Menu } from 'antd';
import { CustomerServiceOutlined, WalletOutlined } from '@ant-design/icons';
import './styles/MobileMenu.scss';

function MobileMenu({ open, onClose, user }) {
  const location = useLocation();

  const menuItems = React.useMemo(() => [
    { key: "home", label: "Trang chủ", path: "/home" },
    { key: "design", label: "Thiết kế", path: "/designs" },
    { key: "products", label: "Sản phẩm", path: "/products" },
    { key: "about", label: "Giới thiệu", path: "/about" },
  ], []);

  const isActivePath = React.useCallback((path) => {
    return location.pathname === path;
  }, [location.pathname]);

  const selectedKeys = React.useMemo(() => [
    menuItems.find((item) => isActivePath(item.path))?.key
  ], [menuItems, isActivePath]);

  return (
    <Drawer
      title="Menu"
      placement="right"
      onClose={onClose}
      open={open}
      className="mobile-menu-drawer"
    >
      <Menu
        mode="vertical"
        selectedKeys={selectedKeys}
      >
        {menuItems.map((item) => (
          <Menu.Item key={item.key}>
            <Link to={item.path} onClick={onClose}>
              {item.label}
            </Link>
          </Menu.Item>
        ))}
        <Menu.Divider />
        <Menu.Item key="support">
          <Link to="/support" onClick={onClose}>
            <CustomerServiceOutlined /> Hỗ trợ
          </Link>
        </Menu.Item>
        {user && (
          <Menu.Item key="userwallets">
            <Link to="/userwallets" onClick={onClose}>
              <WalletOutlined /> Ví tiền
            </Link>
          </Menu.Item>
        )}
      </Menu>
    </Drawer>
  );
}

MobileMenu.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
  }),
};

MobileMenu.defaultProps = {
  user: null,
};

export default React.memo(MobileMenu); 