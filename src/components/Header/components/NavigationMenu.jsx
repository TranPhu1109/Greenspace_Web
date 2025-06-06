import React from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";

import { Button, Dropdown } from "antd";
import {
  CustomerServiceOutlined,
  WalletOutlined,
  MenuOutlined,
  DownOutlined,
} from "@ant-design/icons";

import MobileMenu from "./MobileMenu";
import "./styles/NavigationMenu.scss";

function NavigationMenu({ user }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const HIDDEN_ROLES = [
    "Staff",
    "Admin",
    "Designer",
    "Accountant",
    "Contructor",
    "Manager",
  ];
  const localUser = getLocalUser();
  const roleName = localUser?.roleName;
  const shouldHide = HIDDEN_ROLES.includes(roleName);

  // Lấy user từ localStorage (bạn có thể để ngoài component hoặc trong component)
  function getLocalUser() {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  }

  const historyMenuItems = [
    {
      key: "product-history",
      label: <Link to="/orderhistory">Lịch sử đặt sản phẩm</Link>,
    },
    {
      key: "service-history",
      label: (
        <Link to="/serviceorderhistory">
          Lịch sử đặt thiết kế mẫu kèm sản phẩm
        </Link>
      ),
    },
    {
      key: "booking-history",
      label: (
        <Link to="/history-booking-services">Lịch sử đặt thiết kế mới</Link>
      ),
    },
  ];

  const menuItems = React.useMemo(() => {
    const items = [
      { key: "home", label: "Trang chủ", path: "/home" },
      { key: "products", label: "Sản phẩm", path: "/products" },
      { key: "designs", label: "Thiết kế mẫu", path: "/designs" },
      ...(!shouldHide
        ? [{ key: "create-design", label: "Tạo thiết kế mới", path: "/create-design" }]
        : []),
      { key: "about", label: "Giới thiệu", path: "/about" },
    ];

    if (user && !shouldHide) {
      items.splice(4, 0, {
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
        path: "/orderhistory",
      });
    }

    return items;
  }, [user]);

  const isActivePath = React.useCallback(
    (path) => {
      // Logic kiểm tra active cho các mục thiết kế
      if (path === "/designs" && location.pathname === "/designs") {
        return true; // Chỉ active khi đúng là trang /designs
      }
      if (path === "/create-design" && location.pathname === "/create-design") {
        return true; // Chỉ active khi đúng là trang /create-design
      }
      // Không active /designs nếu đang ở /create-design và ngược lại
      if (
        (path === "/designs" && location.pathname === "/create-design") ||
        (path === "/create-design" && location.pathname === "/designs")
      ) {
        return false;
      }
      // Nếu là trang chi tiết thiết kế, vẫn active mục "Thiết kế mẫu"
      if (path === "/designs" && location.pathname.startsWith("/design/")) {
        return true;
      }

      // Cập nhật logic cho lịch sử
      if (path === "/orderhistory") {
        return (
          location.pathname.includes("/orderhistory") ||
          location.pathname.includes("/order/") ||
          location.pathname.includes("/serviceorderhistory") ||
          location.pathname.includes("/service-order/") ||
          location.pathname.includes("/history-booking-services")
        );
      }

      return location.pathname === path;
    },
    [location.pathname]
  );

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
                  {item.key === "orderHistory" ? (
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
            {user && !shouldHide && (
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
