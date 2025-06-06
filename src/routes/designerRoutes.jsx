import Dashboard from "../pages/Admin/Dashboard";
import WorkTaskDashboard from "../pages/WorkTask/Dashboard";
import DesignerScheduleView from "../pages/Admin/Designer/Schedule/DesignerScheduleView";
import TaskList from "@/components/Designer/Tasks/TaskList";
import TaskDetail from "@/components/Designer/Tasks/TaskDetail";
import DesignCategories from "@/components/Designer/Designs/DesignCategories";
import DesignTemplates from "@/components/Designer/Designs/DesignTemplates";
import DesignTemplateDetail from "@/components/Designer/Designs/DesignTemplateDetail";

export const designerRoutes = {
  path: "/designer",
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
      path: "designs",
      children: [
        {
          path: "templates",
          element: <DesignTemplates />,
        },
        {
          path: "templates/:id",
          element: <DesignTemplateDetail />,
        },
        {
          path: "categories",
          element: <DesignCategories />,
        },
      ]
    },
    // {
    //   path: "schedule",
    //   element: <DesignerScheduleView />,
    // },
    {
      path: "tasks",
      children: [
        {
          index: true,
          element: <TaskList />,
        },
        {
          path: ":id",
          element: <TaskDetail />,
        },
      ],
    },
  ],
};