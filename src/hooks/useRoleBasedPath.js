import { useLocation } from "react-router-dom";

export const useRoleBasedPath = () => {
  const location = useLocation();
  const isManagerRoute = location.pathname.includes("");

  const getBasePath = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes("admin")) return "/admin";
    if (path.includes("manager")) return "/manager";
    if (path.includes("staff")) return "/staff";
    if (path.includes("accountant")) return "/accountant";
    if (path.includes("designer")) return "/designer";
    if (path.includes("contructor")) return "/contructor";
    return "/staff"; // default path
  };

  const getAccountPath = (type) => {
    const basePath = getBasePath();
    switch (type) {
      case "profile":
        return `${basePath}/profile`;
      case "settings":
        return `${basePath}/settings`;
      default:
        return basePath;
    }
  };

  return {
    getBasePath,
    getAccountPath,
    isManagerRoute,
  };
};
