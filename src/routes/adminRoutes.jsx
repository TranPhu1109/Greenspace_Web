// import UsersList from "../pages/Admin/Users/UsersList";
import UserDetail from "../pages/Admin/Users/UserDetail";
import StaffRoles from "../pages/Admin/Staff/StaffRoles";
import DesignOrdersList from "../pages/Admin/DesignOrders/DesignOrdersList";
import DesignOrderDetail from "../pages/Admin/DesignOrders/DesignOrderDetail";
import CustomOrdersList from "../pages/Admin/DesignOrders/CustomOrders/CustomOrdersList";
import OrdersList from "../components/Staff/Orders/OrdersList";
import OrderDetail from "../components/Staff/Orders/OrderDetail";
import ProductsList from "../components/Staff/Products/ProductsList";
import ProductDetail from "../components/Staff/Products/ProductDetail";
import Categories from "../components/Staff/Products/Categories";
import UsersList from "@/components/Admin/Users/UsersList";
import StaffList from "@/components/Admin/Users/StaffList";
import BannedAccounts from "@/components/Admin/Users/BannedAccounts";
import Profile from "@/components/Account/Profile";
import Settings from "@/components/Account/Settings";
import Dashboard from "@/pages/Admin/Dashboard";

export const adminRoutes = {
  path: "/admin",
  children: [
    {
      index: true,
      element: <Dashboard />,
    },
    {
      path: "dashboard",
      element: <Dashboard />,
    },
    {
      path: "users",
      // element: <UsersList />,
      children: [
        {
          index: true,
          element: <UsersList />,
        },
        {
          path: ":id",
          // element: <UserDetail />,
        },
      ],
    },
    {
      path: "staff",
      children: [
        {
          index: true,
          element: <StaffList />,
        },
        {
          path: "roles",
          element: <StaffRoles />,
        },
      ],
    },
    {
      path: "account-banned",
      element: <BannedAccounts/>
    },
    {
      path: '/admin/profile',
      element: <Profile />,
    },
    {
      path: '/admin/settings',
      element: <Settings />,
    },
    {
      path: "design-orders",
      children: [
        {
          index: true,
          element: <DesignOrdersList />,
        },
        {
          path: ":id",
          element: <DesignOrderDetail />,
        },
        {
          path: "custom",
          element: <CustomOrdersList />,
        },
      ],
    },
    {
      path: "orders",
      children: [
        {
          index: true,
          element: <OrdersList />,
        },
        {
          path: ":id",
          element: <OrderDetail />,
        },
      ],
    },
    {
      path: "products",
      children: [
        {
          index: true,
          element: <ProductsList />,
        },
        {
          path: ":id",
          element: <ProductDetail />,
        },
        {
          path: "categories",
          element: <Categories />,
        },
      ],
    },
  ],
};
