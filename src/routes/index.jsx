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
import { contructorRoutes } from "./contructorRoutes";
import LandingPage from "@/pages/LandingPage";
import Home from "@/pages/Home/index";
import DesignsPage from "@/pages/Designs";
import ScrollToTop from "@/components/ScrollToTop";
import ProductsPage from "@/pages/Products";
import ProductDetail from "@/pages/Products/ProductDetail";
import WalletPage from "@/pages/Wallet";
import PaymentCallback from "@/pages/Wallet/components/PaymentCallback";
import CartPage from "@/pages/Cart";
import AboutPage from "@/pages/About";
import VNPayCallback from "@/pages/Wallet/components/VNPayCallback";
import DesignDetailPage from "@/pages/Designs/Detail";
import ProfilePage from "@/pages/Profile";
import OrderHistoryDetail from "@/pages/ServiceOrder/OrderHistoryDetail";
import DesignOrderHistory from "@/pages/ServiceOrder/DesignOrderHistory";
import OrderService from "@/pages/ServiceOrder/OrderService";
import Checkout from "@/pages/Cart/Checkout";
import OrderHistory from "@/pages/Order/OrderHistory";
import ServiceOrderHistory from "@/pages/Order/ServiceOrderHistory";
import ServiceOrderDetail from "@/pages/Order/ServiceOrderDetail";
import OrderServiceCustomize from "@/pages/ServiceOrder/OrderServiceCustomize";
import StandardOrderDetail from "@/pages/ServiceOrder/StandardOrderDetail";
import BookDesign from "@/pages/ServiceOrder/BookingServicesDesign/BookDesign";
import RouteGuard from "@/components/RouteGuard";
import { PolicyListPage, PolicyView } from "@/pages/Policy";
// import ServiceOrderHistory from "@/pages/Order/ServiceOrderHistory";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <ScrollToTop />
        <Home />
      </>
    ),
    // element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/landing",
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
    element: (
      <RouteGuard allowedRoles={["admin", "accountant", "staff", "designer", "manager", "contructor"]}>
        <AdminLayout />
      </RouteGuard>
    ),
    errorElement: <ErrorPage />,
    children: [
      adminRoutes,
      managerRoutes,
      accountantRoutes,
      staffRoutes,
      designerRoutes,
      contructorRoutes,
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
    path: "/designs/:id",
    element: (
      <>
        <ScrollToTop />
        <DesignDetailPage />
      </>
    ),
  },
  {
    path: "/order-service/:id",
    element: (
      <>
        <ScrollToTop />
        <OrderService />
      </>
    ),
  },
  {
    path: "/create-design",
    element: (
      <>
        <ScrollToTop />
        <BookDesign />
      </> 
    ),
  },
  {
    path: "/serviceorderhistory",
    element: (
      <>
        <ScrollToTop />
        <DesignOrderHistory />
      </>
    ),
  },
  {
    path: "/serviceorderhistory/detail/:id",
    element: (
      <>
        <ScrollToTop />
        <OrderHistoryDetail />
      </>
    ),
  },
  {
    path: "/serviceorderhistory/standard/:id",
    element: (
      <>
        <ScrollToTop />
        <StandardOrderDetail />
      </>
    ),
  },
  {
    path: "/orderhistory",
    element: (
      <>
        <ScrollToTop />
        <OrderHistory />
      </>
    ),
  },
  {
      path: "/history-booking-services",
      element: (
        <>
          <ScrollToTop />
          <ServiceOrderHistory />
        </>
      ),
  },
  {
      path: "/service-order/:id",
      element: (
        <>
          <ScrollToTop />
          <ServiceOrderDetail />
        </>
      ),
  },
  {
    path: "/service-order-customize/:id",
    element: (
      <>
        <ScrollToTop />
        <OrderServiceCustomize />
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
    path: "/products/:id",
    element: (
      <>
        <ScrollToTop />
        <ProductDetail />
      </>
    ),
  },
  {
    path: "/cart",
    element: (
      <>
        <ScrollToTop />
        <CartPage />
      </>
    ),
  },
  {
    path: "/cart/checkout",
    element: (
      <>
        <ScrollToTop /> 
        <Checkout />
      </>
    ),
  },
  {
    path: "/about",
    element: (
      <>
        <ScrollToTop />
        <AboutPage />
      </>
    ),
  },
  {
    path: "/userwallets",
    element: (
      <>
        <ScrollToTop />
        <WalletPage />
      </>
    ),
  },
  {
    path: "/userwallets/response",
    element: <VNPayCallback />,
  },
  {
    path: "/profile",
    element: (
      <>
        <ScrollToTop />
        <ProfilePage />
      </>
    ),
  },
  {
    path: "/policy",
    element: (
      <>
        <ScrollToTop />
        <PolicyListPage />
      </>
    ),
  },
  {
    path: "/policy/:id",
    element: (
      <>
        <ScrollToTop />
        <PolicyView />
      </>
    ),
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

export default router;
