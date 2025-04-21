import Dashboard from "../pages/Admin/Dashboard";
import OrdersList from "../components/Staff/Orders/OrdersList";
import OrderDetail from "../components/Staff/Orders/OrderDetail";
import DesignOrdersList from "../pages/Admin/DesignOrders/DesignOrdersList";
import PendingDesignOrders from "../pages/Admin/DesignOrders/PendingDesignOrders";
import ServiceOrderList from "@/components/Accountant/ServiceOrderList";
import ServiceOrderDetail from "@/components/Accountant/ServiceOrderDetail";

export const accountantRoutes = {
  path: "/accountant",
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
      path: "service-orders",
      children: [
        {
          index: true,
          element: <ServiceOrderList />,
        },
        {
          path: ":id",
          element: <ServiceOrderDetail />,
        },
      ],
    },
  ],
};