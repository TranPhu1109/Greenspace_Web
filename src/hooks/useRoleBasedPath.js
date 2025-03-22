import { useLocation } from 'react-router-dom';

export const useRoleBasedPath = () => {
  const location = useLocation();
  const isManagerRoute = location.pathname.includes('');
  
const getBasePath = () => {
  const path = location.pathname.toLowerCase();
  if (path.includes('admin')) return '/admin';
  if (path.includes('manager')) return '/manager';
  if (path.includes('staff')) return '/staff';
  if (path.includes('accountant')) return '/accountant';
  if (path.includes('designer')) return '/designer';
  return '/staff'; // default path
};

  return {
    getBasePath,
    isManagerRoute
  };
};