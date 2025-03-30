import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Badge } from 'antd';
import { PhoneOutlined, ShoppingCartOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import UserMenu from './UserMenu';
import './styles/TopHeader.scss';

function TopHeader({ user, scrolled, cartItems }) {
  const location = useLocation();
  const navigate = useNavigate();

  const getCartItemsCount = React.useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const handleCartClick = (e) => {
    if (!user) {
      e.preventDefault();
      navigate('/login', { state: { from: location.pathname } });
    }
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
            <Link to="/cart" className="cart-link" onClick={handleCartClick}>
              <Badge count={getCartItemsCount} showZero>
                <Button type="text" icon={<ShoppingCartOutlined />}>
                  Giỏ hàng
                </Button>
              </Badge>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

TopHeader.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
  }),
  scrolled: PropTypes.bool.isRequired,
  cartItems: PropTypes.arrayOf(
    PropTypes.shape({
      quantity: PropTypes.number.isRequired,
    })
  ).isRequired,
};

TopHeader.defaultProps = {
  user: null,
  cartItems: [],
};

export default React.memo(TopHeader); 