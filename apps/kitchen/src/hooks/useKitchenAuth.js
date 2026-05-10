import { useState } from "react";
import { authApi } from "../services/auth.api";
import { useKitchenStore } from "../store/kitchenStore";
import { connectSocket } from "../lib/socket";

export const useKitchenAuth = () => {
  const { setAuth, logout, isLoggedIn } = useKitchenStore();
  const [error,     setError]     = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email, password) => {
    setError("");
    setIsLoading(true);
    try {
      const res  = await authApi.login(email, password);
      const { user, accessToken } = res.data;

      if (!["staff", "owner"].includes(user.role)) {
        setError("Only staff and owners can access the kitchen display");
        return;
      }

      setAuth(accessToken, user.restaurantId, user.name);
      connectSocket(accessToken);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return { login, logout, isLoggedIn, isLoading, error };
};