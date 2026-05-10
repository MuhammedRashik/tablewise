import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useEffect } from "react";
import { connectSocket } from "../../lib/socket";

export default function ProtectedRoute() {
  const { isLoggedIn, token } = useAuthStore();

  // Reconnect socket if page was refreshed
  useEffect(() => {
    if (isLoggedIn() && token) connectSocket(token);
  }, []);

  return isLoggedIn() ? <Outlet /> : <Navigate to="/login" replace />;
}