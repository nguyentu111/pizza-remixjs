import { useMatchesData } from "./use-matches-data";

export function useStaffPermissions(): { name: string }[] | undefined {
  const data = useMatchesData<{ permissions?: { name: string }[] }>(
    "routes/admin",
  );
  if (!data) {
    return undefined;
  }
  return data.permissions;
}
