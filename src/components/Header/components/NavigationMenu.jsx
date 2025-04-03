import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';

import { Button, Dropdown } from 'antd';
import { CustomerServiceOutlined, WalletOutlined, MenuOutlined, DownOutlined } from '@ant-design/icons';

import MobileMenu from './MobileMenu';
import './styles/NavigationMenu.scss';

function NavigationMenu({ user }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);


  const designMenuItems = [
    {
      key: 'designs',
      label: <Link to="/designs">Thiết kế mẫu</Link>,
    },
    {
      key: 'create-design',
      label: <Link to="/create-design">Tạo thiết kế mới</Link>,
    },
  ];

  const historyMenuItems = [
    {
      key: 'product-history',
      label: <Link to="/orderhistory">Lịch sử đặt sản phẩm</Link>,
    },
    {
      key: 'service-history',
      label: <Link to="/serviceorderhistory">Lịch sử đặt dịch vụ</Link>,
    },
  ];

  const menuItems = React.useMemo(() => [
    { key: "home", label: "Trang chủ", path: "/home" },
    {
      key: "design",
      label: (
        <Dropdown
          menu={{ items: designMenuItems }}
          placement="bottom"
          overlayClassName="design-dropdown"
        >
          <span className="dropdown-link">
            Thiết kế <DownOutlined />
          </span>
        </Dropdown>
      ),
      path: "/designs"
    },
    { key: "products", label: "Sản phẩm", path: "/products" },
    {
      key: "orderHistory",
      label: (
        <Dropdown
          menu={{ items: historyMenuItems }}
          placement="bottom"
          overlayClassName="history-dropdown"
        >
          <span className="dropdown-link">
            Lịch sử đặt hàng <DownOutlined />
          </span>
        </Dropdown>
      ),
      path: "/orderhistory"
    },
    { key: "about", label: "Giới thiệu", path: "/about" },
  ], []);

  const isActivePath = React.useCallback((path) => {

    if (path === '/designs') {
      return location.pathname.includes('/design');
    }


    return location.pathname === path;
  }, [location.pathname]);

  const handleShowDrawer = React.useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  const handleCloseDrawer = React.useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="header-nav">
      <div className="container">
        <div className="menu-container">
          {/* Mobile Menu Button */}
          <Button
            className="mobile-menu-button"
            onClick={handleShowDrawer}
            icon={<MenuOutlined />}
          />

          {/* Mobile Menu Drawer */}
          <MobileMenu
            open={mobileMenuOpen}
            onClose={handleCloseDrawer}
            user={user}
          />

          {/* Desktop menu */}
          <nav className="nav-menu">
            <ul>
              {menuItems.map((item) => (
                <li
                  key={item.key}
                  className={`nav-item ${
                    isActivePath(item.path) ? "active" : ""
                  }`}
                >

                  {item.key === "design" || item.key === "orderHistory" ? (
                    item.label
                  ) : (
                    <Link to={item.path} className="nav-link">
                      {item.label}
                    </Link>
                  )}

                </li>
              ))}
            </ul>
          </nav>

          {/* Right section with wallet and support */}
          <div className="right-nav-section">
            {/* Wallet link */}
            {user && (
              <Link to="/userwallets" className="wallet-link">
                <WalletOutlined />
                <span>Ví tiền</span>
              </Link>
            )}

            {/* Support link */}
            <Link to="/support" className="support-link">
              <CustomerServiceOutlined />
              <span>Hỗ trợ</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

NavigationMenu.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
  }),
};

NavigationMenu.defaultProps = {
  user: null,
};

export default React.memo(NavigationMenu);