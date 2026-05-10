import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { menuApi } from "../services/menu.api";

export const useMenu = (restaurantId) => {
  const [vegFilter, setVegFilter]         = useState(null);   // null | true | false
  const [activeCategory, setActiveCategory] = useState(null); // null = all

  const { data, isLoading, error } = useQuery({
    queryKey: ["menu", restaurantId],
    queryFn:  () => menuApi.getPublic(restaurantId),
    enabled:  !!restaurantId,
    staleTime: 2 * 60 * 1000,
    select: (res) => res.data,
  });

  // Build flat list of categories from the grouped response
  const categories = data?.menu ? Object.keys(data.menu) : [];

  // Apply filters
  let filteredMenu = data?.menu || {};

  if (activeCategory) {
    filteredMenu = { [activeCategory]: filteredMenu[activeCategory] || [] };
  }

  if (vegFilter !== null) {
    filteredMenu = Object.fromEntries(
      Object.entries(filteredMenu).map(([cat, items]) => [
        cat,
        items.filter((item) => item.isVeg === vegFilter),
      ]).filter(([, items]) => items.length > 0)
    );
  }

  return {
    menu:            filteredMenu,
    categories,
    restaurant:      data?.restaurant,
    totalItems:      data?.totalItems || 0,
    isLoading,
    error:           error?.message,
    vegFilter,       setVegFilter,
    activeCategory,  setActiveCategory,
  };
};