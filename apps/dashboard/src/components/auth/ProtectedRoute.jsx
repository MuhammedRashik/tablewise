import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useEffect } from "react";
import { connectSocket } from "../../lib/socket";
import { useMyRestaurant } from "../../hooks/useRestaurant";
import Spinner from "../ui/Spinner";

export default function ProtectedRoute() {
  const { isLoggedIn, token, user } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (isLoggedIn() && token) connectSocket(token);
  }, []);

  if (!isLoggedIn()) return <Navigate to="/login" replace />;

  // Owner with no restaurant → onboarding
  // Skip this check if already on onboarding page
  if (
    user?.role === "owner" &&
    !user?.restaurantId &&
    location.pathname !== "/onboarding"
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}