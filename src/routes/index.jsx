import { createBrowserRouter } from "react-router-dom";
// import MainLayout from '../layouts/MainLayout';
import AdminLayout from "../layouts/AdminLayout";
import Home from "../pages/Home";
// import AboutPage from '../pages/About';
// import ProductsPage from '../pages/Products';
// import ProductDetailPage from '../pages/ProductDetail';
// import DesignPage from '../pages/Design';
// import ContactPage from '../pages/Contact';
// import CartPage from '../pages/Cart';
// import CheckoutPage from '../pages/Checkout';
import ErrorPage from "../pages/Error";
import OrdersList from "../components/Staff/Orders/OrdersList";
import OrderDetail from "../components/Staff/Orders/OrderDetail";
import UsersList from "../pages/Admin/Users/UsersList";
import UserDetail from "../pages/Admin/Users/UserDetail";
import ProductsList from "../components/Staff/Products/ProductsList";
import ProductDetail from "../components/Staff/Products/ProductDetail";
import Categories from "../components/Staff/Products/Categories";
import StaffList from "../pages/Admin/Staff/StaffList";
import StaffRoles from "../pages/Admin/Staff/StaffRoles";
import DesignOrdersList from "../pages/Admin/DesignOrders/DesignOrdersList";
import DesignOrderDetail from "../pages/Admin/DesignOrders/DesignOrderDetail";
import PendingDesignOrders from "../pages/Admin/DesignOrders/PendingDesignOrders";
import ScheduleList from "../components/Staff/Schedule/ScheduleList";
import TemplateOrdersList from "../components/Staff/TemplateOrders/TemplateOrdersList";
import CustomTemplateOrdersList from "../components/Staff/CustomTemplateOrders/CustomTemplateOrdersList";
import CustomOrdersList from "../pages/Admin/DesignOrders/CustomOrders/CustomOrdersList";
import TemplateOrderDetail from "../components/Staff/TemplateOrders/TemplateOrderDetail";
import CustomTemplateOrderDetail from "../components/Staff/CustomTemplateOrders/CustomTemplateOrderDetail";
import NewDesignOrdersList from "../components/Staff/NewDesignOrders/NewDesignOrdersList";
import NewDesignOrderDetail from "../components/Staff/NewDesignOrders/NewDesignOrderDetail";

// Admin Pages
import Dashboard from "../pages/Admin/Dashboard";
import DesignerScheduleView from "../pages/Admin/Designer/Schedule/DesignerScheduleView";
import TaskDetail from "../pages/Admin/Designer/Tasks/TaskDetail";
import FeedbackManagement from "@/components/Staff/FeedbackManage/FeedbackManagement";
import CustomerList from "@/components/Manager/Customers/CustomerList";
import EmployeeList from "@/components/Manager/Employee/EmployeeList";
import PromotionsList from "@/components/Manager/Promotions/PromotionsList";
import TransactionsList from "@/components/Manager/Transactions/TransactionsList";
// Bỏ các import chưa có

const router = createBrowserRouter([
  {
    path: "/",
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
  //Admin
  {
    path: "/admin",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
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
        path: "orders",
        element: <OrdersList />,
      },
      {
        path: "orders/:id",
        element: <OrderDetail />,
      },
      {
        path: "users",
        element: <UsersList />,
      },
      {
        path: "users/:id",
        element: <UserDetail />,
      },
      {
        path: "products",
        element: <ProductsList />,
      },
      {
        path: "products/:id",
        element: <ProductDetail />,
      },
      {
        path: "products/categories",
        element: <Categories />,
      },
      {
        path: "staff",
        element: <StaffList />,
      },
      {
        path: "staff/roles",
        element: <StaffRoles />,
      },
      {
        path: "design-orders",
        children: [
          {
            index: true,
            element: <DesignOrdersList />,
          },
          {
            path: "template-orders",
            children: [
              {
                index: true,
                element: <TemplateOrdersList />,
              },
              {
                path: ":id",
                element: <TemplateOrderDetail />,
              },
            ],
          },
          {
            path: "custom-template-orders",
            element: <CustomTemplateOrdersList />,
          },
          {
            path: "custom-orders",
            element: <CustomOrdersList />,
          },
          {
            path: "new-design-orders",
            children: [
              {
                index: true,
                element: <NewDesignOrdersList />,
              },
              {
                path: ":id",
                element: <NewDesignOrderDetail />,
              },
            ],
          },
        ],
      },
      {
        path: "design-orders/:id",
        element: <DesignOrderDetail />,
      },
      {
        path: "design-orders/pending",
        element: <PendingDesignOrders />,
      },
      {
        path: "design-orders/new-design-orders",
        element: <NewDesignOrdersList />,
      },
      {
        path: "design-orders/new-design-orders/:id",
        element: <NewDesignOrderDetail />,
      },
      // Bỏ các route chưa có
    ],
  },
  //Manager
  {
    path: "/Manager",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
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
        path: "customer-list",
        element: <CustomerList />,
      },
      {
        path: "employee-list",
        element: <EmployeeList />,
      },
      // {
      //   path: "orders",
      //   element: <OrdersList />,
      // },
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
        path: "promotions",
        element: <PromotionsList />,
      },
      {
        path: "transactions",
        element: <TransactionsList />,
      }
    ],
  },
  //Acountant
  {
    path: "/Accountant",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
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
        path: "orders",
        element: <OrdersList />,
      },
      {
        path: "orders/:id",
        element: <OrderDetail />,
      },
      {
        path: "design-orders",
        element: <DesignOrdersList />,
      },
      {
        path: "design-orders/pending",
        element: <PendingDesignOrders />,
      },
    ],
  },
  {
    path: "/staff",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
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
        path: "orders",
        element: <OrdersList />,
      },
      {
        path: "orders/:id",
        element: <OrderDetail />,
      },
      {
        path: "design-orders",
        children: [
          {
            index: true,
            element: <DesignOrdersList />,
          },
          {
            path: "template-orders",
            children: [
              {
                index: true,
                element: <TemplateOrdersList />,
              },
              {
                path: ":id",
                element: <TemplateOrderDetail />,
              },
            ],
          },
          {
            path: "custom-template-orders",
            children: [
              {
                index: true,
                element: <CustomTemplateOrdersList />,
              },
              {
                path: ":id",
                element: <CustomTemplateOrderDetail />,
              },
            ],
          },
          {
            path: "new-design-orders",
            children: [
              {
                index: true,
                element: <NewDesignOrdersList />,
              },
              {
                path: ":id",
                element: <NewDesignOrderDetail />,
              },
            ],
          },
          {
            path: "pending",
            element: <PendingDesignOrders />,
          },
        ],
      },
      {
        path: "schedule",
        element: <ScheduleList />,
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
      // {
      //   path: 'products',
      //   element: <ProductsList />,
      // },
      // {
      //   path: 'products/:id',
      //   element: <ProductDetail />,
      // },
      // {
      //   path: 'products/categories',
      //   element: <Categories />,
      // },
      {
        path: "feedback",
        element: <FeedbackManagement />,
      },
    ],
  },
  {
    path: "/designer",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
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
        path: "schedule",
        element: <DesignerScheduleView />,
      },
      {
        path: "tasks/:id",
        element: <TaskDetail />,
      },
    ],
  },
  {
    path: "/staff/design-orders/custom-template-orders",
    element: <CustomTemplateOrdersList />,
  },
  {
    path: "/staff/design-orders/custom-template-orders/:id",
    element: <CustomTemplateOrderDetail />,
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

export default router;
