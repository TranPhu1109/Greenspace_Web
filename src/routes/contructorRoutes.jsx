import ContractorSchedule from "@/components/Staff/ContractorSchedule/ContractorSchedule";
import Dashboard from "../pages/Admin/Dashboard";
import WorkTaskDashboard from "../pages/WorkTask/Dashboard";
import ContractorTasks from "@/components/Contructor/ContractorTasks";
import ContractorTaskDetail from "@/components/Contructor/ContractorTaskDetail";
// import UsersList from "../pages/Admin/Users/UsersList";
export const contructorRoutes = {
  path: "/contructor",
  children: [
    {
      index: true,
      element: <WorkTaskDashboard />,
    },
    {
      path: "dashboard",
      element: <WorkTaskDashboard />,
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
