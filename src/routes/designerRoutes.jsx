import Dashboard from "../pages/Admin/Dashboard";
import DesignerScheduleView from "../pages/Admin/Designer/Schedule/DesignerScheduleView";
import TaskDetail from "../pages/Admin/Designer/Tasks/TaskDetail";
import DesignCategories from "@/components/Designer/Designs/DesignCategories";
import DesignTemplates from "@/components/Designer/Designs/DesignTemplates";

export const designerRoutes = {
  path: "/designer",
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
      path: "designs",
      children: [
        {
          path: "templates",
          element: <DesignTemplates />,
        },
        {
          path: "categories",
          element: <DesignCategories />,
        },
      ]
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
};