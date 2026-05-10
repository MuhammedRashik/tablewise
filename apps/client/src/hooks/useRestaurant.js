import { useQuery } from "@tanstack/react-query";
import { restaurantApi } from "../services/restaurant.api";

export const useRestaurant = (restaurantId) => {
  return useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn:  () => restaurantApi.getPublic(restaurantId),
    enabled:  !!restaurantId,
    staleTime: 5 * 60 * 1000, // restaurant info rarely changes
    select: (res) => res.data.restaurant,
  });
};