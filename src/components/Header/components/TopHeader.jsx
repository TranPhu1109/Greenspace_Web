import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Badge } from 'antd';
import { PhoneOutlined, ShoppingCartOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import UserMenu from './UserMenu';
import Notifications from '@/components/Notifications';
import './styles/TopHeader.scss';
import useCartStore from '@/stores/useCartStore';

function TopHeader({
  user,
  scrolled,
  cartItems,
  notificationCount,
  notifications,
  onNotificationClick,
  onViewAllClick,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { getLocalCart } = useCartStore();
  const [localCartCount, setLocalCartCount] = React.useState(0);

  // Lắng nghe thay đổi của localStorage cho giỏ hàng guest
  useEffect(() => {
    // Khởi tạo giá trị ban đầu
    const updateLocalCartCount = () => {
      if (!user) {
        const localCart = getLocalCart();
        setLocalCartCount(localCart.length);
      }
    };

    // Lắng nghe sự kiện storage change
    const handleStorageChange = (e) => {
      if (e.key === 'guest-cart-items') {
        updateLocalCartCount();
      }
    };

    // Đăng ký event listener
    window.addEventListener('storage', handleStorageChange);
    
    // Lắng nghe sự kiện custom cho cùng một tab
    window.addEventListener('localCartUpdated', updateLocalCartCount);
    
    // Khởi tạo giá trị ban đầu
    updateLocalCartCount();
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localCartUpdated', updateLocalCartCount);
    };
  }, [user, getLocalCart]);

  const getCartItemsCount = React.useMemo(() => {
    return user ? (cartItems?.length || 0) : localCartCount;
  }, [cartItems, user, localCartCount]);

  const handleCartClick = (e) => {
    // Không ngăn chặn chuyển hướng đến giỏ hàng
    // Người dùng có thể xem giỏ hàng mà không cần đăng nhập
    // Việc đăng nhập sẽ được kiểm tra khi thanh toán
  };

  const renderAuthButtons = () => {
    if (user) {
      return (
        <div className="auth-section">
          <UserMenu user={user} />
        </div>
      );
    }

    return (
      <div className="auth-buttons">
        <Link to="/login" style={{ marginRight: "10px" }}>
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
    <div className={`header-top ${scrolled ? "collapsed" : ""}`}>
      <div className="container">
        <div className="phone-number">
          <PhoneOutlined />
          <span>0963202427</span>
        </div>
        <div className="auth-links">
          {renderAuthButtons()}
          {user && (
            <Notifications
              count={notificationCount}
              notifications={notifications}
              onNotificationClick={onNotificationClick}
              onViewAllClick={onViewAllClick}
            />
          )}
          <Link to="/cart" className="cart-link" onClick={handleCartClick}>
            <Badge count={getCartItemsCount} showZero>
              <Button type="text" icon={<ShoppingCartOutlined />}>
                Giỏ hàng
              </Button>
            </Badge>
          </Link>
        </div>
      </div>
    </div>
  );
}

TopHeader.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
  }),
  scrolled: PropTypes.bool.isRequired,
  cartItems: PropTypes.array,
  notificationCount: PropTypes.number,
  notifications: PropTypes.arrayOf(PropTypes.object),
  onNotificationClick: PropTypes.func,
  onViewAllClick: PropTypes.func,
};

TopHeader.defaultProps = {
  user: null,
  cartItems: [],
  notificationCount: 0,
  notifications: [],
  onNotificationClick: () => {},
  onViewAllClick: () => {},
};

export default React.memo(TopHeader);