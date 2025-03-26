import { useState } from 'react';
import { Link } from "react-router-dom";
import { Button, Drawer, Menu, Input, Select } from "antd";
import {
  MenuOutlined,
  ShoppingCartOutlined,
  PhoneOutlined,
  SearchOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import reactLogo from "../../assets/logo.png";
import "./styles.scss";

const { Option } = Select;

const Header = () => {
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };



  const menuItems = [
    { key: "home", label: "Trang chủ", path: "/" },
    { key: "design", label: "Thiết kế", path: "/design" },
    { key: "products", label: "Sản phẩm", path: "/products" },
    { key: "about", label: "Giới thiệu", path: "/about" },
  ];

  return (
    <>
      <header className="header">
        {/* Top header with phone, login, register */}
        <div className="header-top">
          <div className="container">
            <div className="phone-number">
              <PhoneOutlined />
              <span>0963202427</span>
            </div>
            <div className="auth-links">
              <Link to="/login" className="login-link">
                Đăng nhập
              </Link>
              <Link to="/register" className="register-link">
                Đăng ký
              </Link>
              <Link to="/cart" className="cart-link">
                <ShoppingCartOutlined />
                <span>Giỏ hàng</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main header with logo and search */}
        <div className="header-main">
          <div className="container">
            {/* Logo */}
            <div>
              <Link to="/">
                <img src={reactLogo} alt="Logo" className="logo" />
              </Link>
            </div>

            {/* Search bar */}
            <div className="search-container">
              <Input placeholder="Search for..." size="large" />
              <Select defaultValue="all" size="large">
                <Option value="all">All Categories</Option>
                <Option value="plants">Plants</Option>
                <Option value="pots">Pots</Option>
                <Option value="tools">Tools</Option>
              </Select>
            </div>
            <div>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                size="large"
                className="search-button"
              >
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation menu */}
        <div className="header-nav">
          <div className="container">
            <div className="menu-container">
              {/* Mobile menu button */}
              <Button
                className="mobile-menu-button"
                onClick={showDrawer}
                icon={<MenuOutlined />}
              >
                Menu
              </Button>

              {/* Desktop menu */}
              <nav className="nav-menu">
                <ul>
                  {menuItems.map((item) => (
                    <li key={item.key} className="nav-item">
                      <Link to={item.path} className="nav-link">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Support link */}
              <Link to="/support" className="support-link">
                <CustomerServiceOutlined />
                <span>Support</span>
              </Link>

              {/* Mobile Navigation Drawer */}
              <Drawer
                title="Menu"
                placement="right"
                onClose={onClose}
                open={open}
              >
                <Menu mode="vertical">
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
                      <CustomerServiceOutlined /> Support
                    </Link>
                  </Menu.Item>
                </Menu>
              </Drawer>
            </div>
          </div>
        </div>
      </header>


    </>
  );
};

export default Header;
