import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { restaurantApi } from "../services/restaurant.api";
import { useAuthStore } from "../store/authStore";

export const useMyRestaurant = () => {
  return useQuery({
    queryKey: ["restaurant", "me"],
    queryFn:  restaurantApi.getMe,
    select:   (res) => res.data.restaurant,
    staleTime: 60_000,
  });
};

export const useUpdateSettings = () => {
  const qc           = useQueryClient();
  const restaurantId = useAuthStore((s) => s.restaurantId);

  return useMutation({
    mutationFn: (settings) => restaurantApi.updateSettings(restaurantId, settings),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["restaurant", "me"] }),
  });
};

export const useToggleQueue = () => {
  const qc           = useQueryClient();
  const restaurantId = useAuthStore((s) => s.restaurantId);

  return useMutation({
    mutationFn: (isOpen) => restaurantApi.toggleQueue(restaurantId, isOpen),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["restaurant", "me"] }),
  });
};