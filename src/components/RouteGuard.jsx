import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

/**
 * Component to protect routes based on user role
 * @param {Object} props
 * @param {Array} props.allowedRoles - Array of roles allowed to access the route
 * @param {React.ReactNode} props.children - Child components to render if user is authorized
 * @param {string} props.redirectPath - Path to redirect if user is not authorized
 */
const RouteGuard = ({ allowedRoles, children, redirectPath = '/' }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
      message.error('Vui lòng đăng nhập để truy cập trang này');
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      const userRole = user.roleName.toLowerCase();

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(userRole)) {
        // message.error('Bạn không có quyền truy cập trang này');
        navigate(redirectPath);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate(redirectPath);
    }
  }, [allowedRoles, navigate, redirectPath]);

  return children;
};

export default RouteGuard; 