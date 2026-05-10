import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh for 30 seconds before background refetch
      staleTime: 30 * 1000,
      // Keep unused data in cache for 5 minutes
      gcTime: 5 * 60 * 1000,
      // Retry failed requests twice with exponential backoff
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      // Don't refetch just because the window regains focus on mobile
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0, // never retry mutations (POST/PATCH/DELETE)
    },
  },
});

export default queryClient;