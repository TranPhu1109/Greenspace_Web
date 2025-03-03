import { createBrowserRouter } from 'react-router-dom';
// import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import Home from '../pages/Home';
// import AboutPage from '../pages/About';
// import ProductsPage from '../pages/Products';
// import ProductDetailPage from '../pages/ProductDetail';
// import DesignPage from '../pages/Design';
// import ContactPage from '../pages/Contact';
// import CartPage from '../pages/Cart';
// import CheckoutPage from '../pages/Checkout';
import ErrorPage from '../pages/Error';
import OrdersList from '../pages/Admin/Orders/OrdersList';
import OrderDetail from '../pages/Admin/Orders/OrderDetail';
import UsersList from '../pages/Admin/Users/UsersList';
import UserDetail from '../pages/Admin/Users/UserDetail';
import ProductsList from '../pages/Admin/Products/ProductsList';
import ProductDetail from '../pages/Admin/Products/ProductDetail';
import Categories from '../pages/Admin/Products/Categories';
import StaffList from '../pages/Admin/Staff/StaffList';
import StaffRoles from '../pages/Admin/Staff/StaffRoles';
import DesignOrdersList from '../pages/Admin/DesignOrders/DesignOrdersList';
import DesignOrderDetail from '../pages/Admin/DesignOrders/DesignOrderDetail';
import PendingDesignOrders from '../pages/Admin/DesignOrders/PendingDesignOrders';

// Admin Pages
import Dashboard from '../pages/Admin/Dashboard';
// Bỏ các import chưa có

const router = createBrowserRouter([
  {
    path: '/',
    // element: <MainLayout />,
    element: <Home />,
    errorElement: <ErrorPage />,
    children: [
      // {
      //   index: true,
      //   element: <Home />,
      // },
    ],
  },
  
  {
    path: '/admin',
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'orders',
        element: <OrdersList />,
      },
      {
        path: 'orders/:id',
        element: <OrderDetail />,
      },
      {
        path: 'users',
        element: <UsersList />,
      },
      {
        path: 'users/:id',
        element: <UserDetail />,
      },
      {
        path: 'products',
        element: <ProductsList />,
      },
      {
        path: 'products/:id',
        element: <ProductDetail />,
      },
      {
        path: 'products/categories',
        element: <Categories />,
      },
      {
        path: 'staff',
        element: <StaffList />,
      },
      {
        path: 'staff/roles',
        element: <StaffRoles />,
      },
      {
        path: 'design-orders',
        element: <DesignOrdersList />,
      },
      {
        path: 'design-orders/:id',
        element: <DesignOrderDetail />,
      },
      {
        path: 'design-orders/pending',
        element: <PendingDesignOrders />,
      },
      // Bỏ các route chưa có
    ],
  },
  {
    path: '/Accountant',
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
    ],
  },
  {
    path: '*',
    element: <ErrorPage />,
  },
]);

export default router;
