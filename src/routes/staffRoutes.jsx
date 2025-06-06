import Dashboard from "../pages/Admin/Dashboard";
import WorkTaskDashboard from "../pages/WorkTask/Dashboard";
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
import BlogManagement from "@/components/Staff/Blog/BlogManagement";
import NewBlog from "@/components/Staff/Blog/NewBlog";
import EditBlog from "@/components/Staff/Blog/EditBlog";
import BlogDetail from "@/components/Staff/Blog/BlogDetail";
import DesignerScheduleManager from "@/components/Staff/DesignerSchedule/DesignerScheduleManager";
import ComplaintsList from "@/components/Staff/Complaints/ComplaintsList";
import ContractorSchedule from "@/components/Staff/ContractorSchedule/ContractorSchedule";
import ExternalProductList from "@/components/Staff/ExternalProduct/ExternalProductList";

export const staffRoutes = {
  path: "/staff",
  children: [
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
      path: "complaints",
      element: <ComplaintsList />,
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
      // element: <ScheduleList />,
      element: <DesignerScheduleManager />,

    },
    // {
    //   path: "schedule-new",
    //   element: <DesignerScheduleManager />,
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
      path: "external-products",
      element: <ExternalProductList />,
    },
    {
      path: "feedback",
      element: <FeedbackManagement />,
    },
    {
      path: "blog",
      children: [
        {
          index: true,
          element: <BlogManagement />,
        },
        {
          path: "new-blog",
          element: <NewBlog />,
        },
        {
          path: "edit/:id",
          element: <EditBlog />,
        },
        {
          path: ":id",
          element: <BlogDetail />,
        },
      ]
    },
    {
      path: "/staff/schedule-contructor",
      element: <ContractorSchedule />,
    },
  ],
};