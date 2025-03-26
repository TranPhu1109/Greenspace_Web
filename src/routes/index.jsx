import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import Home from "../pages/Home";
import ErrorPage from "../pages/Error";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
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
    path: "/login",
    element: <Login />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/register",
    element: <Register />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
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
