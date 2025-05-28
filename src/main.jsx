import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import "./index.css";
import router from "./routes";
import { Analytics } from "@vercel/analytics/react";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#4caf50",
          colorBgBase: "#ffffff",
          // colorPrimary: "#4ade80",
          colorSuccess: "#22c55e",
          colorWarning: "#eab308",
          colorError: "#ef4444",
          colorInfo: "#3b82f6",
          borderRadius: 8,
        },
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <RouterProvider router={router} />
      <Analytics />
    </ConfigProvider>
  </React.StrictMode>
);
