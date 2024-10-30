/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */

import { Staff } from "@prisma/client";

import { useMatchesData } from "./use-matches-data";

export function useOptionalStaff(): Staff | undefined {
  const data = useMatchesData<{ staff?: Staff }>("routes/admin");
  if (!data) {
    return undefined;
  }
  return data.staff;
}
