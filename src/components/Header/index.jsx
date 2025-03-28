import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button, Drawer, Menu, Input, Select, Dropdown, Avatar, Badge } from "antd";
import {
  MenuOutlined,
  ShoppingCartOutlined,
  PhoneOutlined,
  SearchOutlined,
  CustomerServiceOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import reactLogo from "../../assets/logo.png";
import "./styles.scss";
import useAuthStore from '../../stores/useAuthStore';

const { Option } = Select;

const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Cập nhật logic scroll để nhạy hơn
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const scrollingDown = currentScrollPos > prevScrollPos;
      
      // Chỉ cần cuộn 20px sẽ kích hoạt
      if (Math.abs(currentScrollPos - prevScrollPos) > 10) {
        setScrolled(scrollingDown);
      }
      
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const menuItems = [
    { key: "home", label: "Trang chủ", path: "/home" },
    { key: "design", label: "Thiết kế", path: "/designs" },
    { key: "products", label: "Sản phẩm", path: "/products" },
    { key: "about", label: "Giới thiệu", path: "/about" },
  ];

  // Kiểm tra active path
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin tài khoản',
      onClick: () => navigate('/profile')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: () => {
        logout();
        navigate('/');
      },
    },
  ];

  const renderAuthButtons = () => {
    if (user) {
      return (
        <div className="auth-section">
          <Dropdown 
            menu={{ items: userMenuItems }} 
            placement="bottomRight" 
            arrow
            trigger={['click']}
          >
            <div className="user-profile-trigger">
              <Avatar 
                size="small" 
                icon={<UserOutlined />} 
                src={user.avatar}
                className="user-avatar"
              />
              <span className="user-name">{user.name || 'Tài khoản'}</span>
            </div>
          </Dropdown>
        </div>
      );
    }

    return (
      <div className="auth-buttons">
        <Link to="/login" style={{ marginRight: '10px' }}>
          <Button type="dashed" icon={<LoginOutlined />}>
            Đăng nhập
          </Button>
        </Link>
        <Link to="/register">
          <Button type="primary" icon={<UserAddOutlined />}>
            Đăng ký
          </Button>
        </Link>
      </div>
    );
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      {/* Top header - collapsible */}
      <div className={`header-top ${scrolled ? 'collapsed' : ''}`}>
        <div className="container">
          <div className="phone-number">
            <PhoneOutlined />
            <span>0963202427</span>
          </div>
          <div className="auth-links">
            {renderAuthButtons()}
            <Link to="/cart" className="cart-link">
              <Badge count={5}>
                <Button type="text" icon={<ShoppingCartOutlined />}>
                  Giỏ hàng
                </Button>
              </Badge>
            </Link>
          </div>
        </div>
      </div>

      {/* Main header - always visible */}
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

      {/* Navigation menu - always visible */}
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
                  <li 
                    key={item.key} 
                    className={`nav-item ${isActivePath(item.path) ? 'active' : ''}`}
                  >
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
              <Menu 
                mode="vertical"
                selectedKeys={[menuItems.find(item => isActivePath(item.path))?.key]}
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
                    <CustomerServiceOutlined /> Support
                  </Link>
                </Menu.Item>
              </Menu>
            </Drawer>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
