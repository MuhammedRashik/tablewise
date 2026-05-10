import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tableApi } from "../services/table.api";
import { useAuthStore } from "../store/authStore";
import { useDashboardStore } from "../store/dashboardStore";

export const useFloor = () => {
  const restaurantId = useAuthStore((s) => s.restaurantId);
  const { tables, setTables, updateTableStatus } = useDashboardStore();
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["tables", restaurantId],
    queryFn:  () => tableApi.getAll(restaurantId),
    enabled:  !!restaurantId,
    select:   (res) => res.data,
    refetchInterval: 30_000, // refresh every 30s as fallback
  });

  // Sync query data into store
  useEffect(() => {
    if (data?.tables) setTables(data.tables);
  }, [data]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ tableId, status }) =>
      tableApi.updateStatus(restaurantId, tableId, status),
    onSuccess: (res, { tableId, status }) => {
      updateTableStatus(tableId, status);
      qc.invalidateQueries({ queryKey: ["tables", restaurantId] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (tableData) => tableApi.create(restaurantId, tableData),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["tables", restaurantId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (tableId) => tableApi.remove(restaurantId, tableId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["tables", restaurantId] }),
  });

  return {
    tables,
    counts:       data?.counts || {},
    isLoading,
    refetch,
    updateStatus: updateStatusMutation.mutate,
    createTable:  createMutation.mutate,
    deleteTable:  deleteMutation.mutate,
    isUpdating:   updateStatusMutation.isPending,
  };
};