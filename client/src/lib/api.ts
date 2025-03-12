// We don't need to specify a host since we're running on the same server
export const baseUrl = "";
export const apiUrl = "/api";

import { queryClient } from "./queryClient";

export function invalidateQueries(queryKey: string | string[]) {
  queryClient.invalidateQueries({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
  });
}