import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import Home from "../pages/Home";
import ErrorPage from "../pages/Error";
import { adminRoutes } from "./adminRoutes";
import { managerRoutes } from "./managerRoutes";
import { accountantRoutes } from "./accountantRoutes";
import { staffRoutes } from "./staffRoutes";
import { designerRoutes } from "./designerRoutes";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      adminRoutes,
      managerRoutes,
      accountantRoutes,
      staffRoutes,
      designerRoutes,
    ],
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

export default router;
