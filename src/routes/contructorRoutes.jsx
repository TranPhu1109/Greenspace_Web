import ContractorSchedule from "@/components/Staff/ContractorSchedule/ContractorSchedule";
import Dashboard from "../pages/Admin/Dashboard";
import ContractorTasks from "@/components/Contructor/ContractorTasks";
import ContractorTaskDetail from "@/components/Contructor/ContractorTaskDetail";
// import UsersList from "../pages/Admin/Users/UsersList";
export const contructorRoutes = {
  path: "/contructor",
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
      element: <ContractorSchedule />,
    },
    {
      path: "tasks",
      element: <ContractorTasks />,
    },
    {
      path: "tasks/:id",
      element: <ContractorTaskDetail />,
    },
  ],
};
