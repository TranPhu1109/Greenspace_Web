import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { Button } from 'antd';
import { CustomerServiceOutlined, WalletOutlined, MenuOutlined } from '@ant-design/icons';
import MobileMenu from './MobileMenu';
import './styles/NavigationMenu.scss';

function NavigationMenu({ user }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const menuItems = React.useMemo(() => [
    { key: "home", label: "Trang chủ", path: "/home" },
    { key: "design", label: "Thiết kế", path: "/designs" },
    { key: "products", label: "Sản phẩm", path: "/products" },
    { key: "about", label: "Giới thiệu", path: "/about" },
  ], []);

  const isActivePath = React.useCallback((path) => {
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
                  <Link to={item.path} className="nav-link">
                    {item.label}
                  </Link>
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