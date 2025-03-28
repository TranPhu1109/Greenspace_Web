import Dashboard from "../pages/Admin/Dashboard";
import OrdersList from "../components/Staff/Orders/OrdersList";
import OrderDetail from "../components/Staff/Orders/OrderDetail";
import DesignOrdersList from "../pages/Admin/DesignOrders/DesignOrdersList";
import TemplateOrdersList from "../components/Staff/TemplateOrders/TemplateOrdersList";
import TemplateOrderDetail from "../components/Staff/TemplateOrders/TemplateOrderDetail";
import CustomTemplateOrdersList from "../components/Staff/CustomTemplateOrders/CustomTemplateOrdersList";
import CustomTemplateOrderDetail from "../components/Staff/CustomTemplateOrders/CustomTemplateOrderDetail";
import NewDesignOrdersList from "../components/Staff/NewDesignOrders/NewDesignOrdersList";
import NewDesignOrderDetail from "../components/Staff/NewDesignOrders/NewDesignOrderDetail";
import PendingDesignOrders from "../pages/Admin/DesignOrders/PendingDesignOrders";
import ScheduleList from "../components/Staff/Schedule/ScheduleList";
import ProductsList from "../components/Staff/Products/ProductsList";
import ProductDetail from "../components/Staff/Products/ProductDetail";
import Categories from "../components/Staff/Products/Categories";
import FeedbackManagement from "@/components/Staff/FeedbackManage/FeedbackManagement";

export const staffRoutes = {
  path: "/staff",
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
    {
      path: "feedback",
      element: <FeedbackManagement />,
    },
  ],
};