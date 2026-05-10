import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { menuApi } from "../services/menu.api";
import { useAuthStore } from "../store/authStore";

export const useMenuManager = () => {
  const restaurantId = useAuthStore((s) => s.restaurantId);
  const qc           = useQueryClient();
  const key          = ["menu-full", restaurantId];

  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn:  () => menuApi.getAll(restaurantId),
    enabled:  !!restaurantId,
    select:   (res) => res.data,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const createMutation   = useMutation({ mutationFn: (d)       => menuApi.create(restaurantId, d),           onSuccess: invalidate });
  const updateMutation   = useMutation({ mutationFn: ({id,d})  => menuApi.update(restaurantId, id, d),       onSuccess: invalidate });
  const toggleMutation   = useMutation({ mutationFn: ({id,val})=> menuApi.toggleAvailability(restaurantId, id, val), onSuccess: invalidate });
  const deleteMutation   = useMutation({ mutationFn: (id)      => menuApi.remove(restaurantId, id),          onSuccess: invalidate });

  // Flatten grouped menu into a single array for the table view
  const allItems = data?.menu
    ? Object.values(data.menu).flat()
    : [];

  return {
    menu:     data?.menu || {},
    allItems,
    isLoading,
    createItem:        createMutation.mutate,
    updateItem:        updateMutation.mutate,
    toggleAvailability:toggleMutation.mutate,
    deleteItem:        deleteMutation.mutate,
    isCreating:        createMutation.isPending,
    isSaving:          updateMutation.isPending,
  };
};