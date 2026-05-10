import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/auth.api";
import { useAuthStore } from "../store/authStore";
import { connectSocket } from "../lib/socket";
import { useState } from "react";

export const useLogin = () => {
  const navigate = useNavigate();
  const setAuth  = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: ({ email, password }) => authApi.login(email, password),
    onSuccess: (res) => {
      const { user, accessToken } = res.data;
      setAuth(user, accessToken);
      connectSocket(accessToken);
      navigate("/");
    },
    onError: (err) => setError(err.message),
  });

  return { login: mutation.mutate, isLoading: mutation.isPending, error };
};