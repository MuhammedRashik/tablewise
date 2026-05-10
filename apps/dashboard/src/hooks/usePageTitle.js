import { useLocation } from "react-router-dom";

const TITLES = {
  "/":          "Queue board",
  "/floor":     "Floor view",
  "/orders":    "Order manager",
  "/menu":      "Menu manager",
  "/analytics": "Analytics",
  "/settings":  "Settings",
};

export const usePageTitle = () => {
  const { pathname } = useLocation();
  return TITLES[pathname] || "TableWise";
};