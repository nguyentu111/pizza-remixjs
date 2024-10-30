import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

export function useMatchesData<T = Record<string, unknown>>(id: string): T {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id],
  );
  return route?.data as T;
}
