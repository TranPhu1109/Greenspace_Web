import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
// import Home from "../pages/Home";
import ErrorPage from "../pages/Error";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import { adminRoutes } from "./adminRoutes";
import { managerRoutes } from "./managerRoutes";
import { accountantRoutes } from "./accountantRoutes";
import { staffRoutes } from "./staffRoutes";
import { designerRoutes } from "./designerRoutes";
import LandingPage from "@/pages/LandingPage";
import Home from "@/pages/Home/index";
import DesignsPage from "@/pages/Designs";
import ScrollToTop from '@/components/ScrollToTop';
import ProductsPage from "@/pages/Products";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <ScrollToTop />
        <LandingPage />
      </>
    ),
    // element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/home",
    element: (
      <>
        <ScrollToTop />
        <Home />
      </>
    ),
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
    path: "/designs",
    element: (
      <>
        <ScrollToTop />
        <DesignsPage />
      </>
    ),
  },
  {
    path: "/products",
    element: (
      <>
        <ScrollToTop />
        <ProductsPage />
      </>
    ),
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

export default router;
