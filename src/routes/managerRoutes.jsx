import Dashboard from "../pages/Admin/Dashboard";
import CustomerList from "@/components/Manager/Customers/CustomerList";
import EmployeeList from "@/components/Manager/Employee/EmployeeList";
import OrdersList from "../components/Staff/Orders/OrdersList";
import OrderDetail from "../components/Staff/Orders/OrderDetail";
import ProductsList from "../components/Staff/Products/ProductsList";
import ProductDetail from "../components/Staff/Products/ProductDetail";
import Categories from "../components/Staff/Products/Categories";
import PromotionsList from "@/components/Manager/Promotions/PromotionsList";
import TransactionsList from "@/components/Manager/Transactions/TransactionsList";
import NewDesignOrdersList from "@/components/Manager/NewDesignOrders/NewDesignOrdersList";
import NewDesignOrderDetail from "@/components/Manager/NewDesignOrders/NewDesignOrderDetail";
import WebManage from "@/components/Manager/WebManage/WebManage";
import ComplaintsRefundList from "@/components/Manager/Complaints/ComplaintsRefundList";
import TransactionPercentageManagement from "@/components/Manager/Percentage/TransactgionPercentageManagement";
import ComplaintReasonManage from "@/components/Manager/Complaints/ComplaintsResion";
import Policy from "@/components/Manager/Policy/Policy";
import ContractList from "@/components/Manager/Contracts/ContractsList";

export const managerRoutes = {
  path: "/manager",
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
      path: "complaints",
      element: <ComplaintsRefundList />,
    },
    {
      path: "transactions",
      element: <TransactionsList />,
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
      path: "deposit-management",
      element: <TransactionPercentageManagement />,
    },
    {
      path: "contracts",
      element: <ContractList />,
    },
    {
      path: "logo",
      element: <WebManage />,
    },
    {
      path: "complaint-reasons",
      element: <ComplaintReasonManage />,
    },
    {
      path: "policy",
      element: <Policy />,
    },
  ],
};