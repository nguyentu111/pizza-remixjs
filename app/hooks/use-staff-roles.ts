import { useMatchesData } from "./use-matches-data";

export function useStaffRoles(): { name: string }[] | undefined {
  const data = useMatchesData<{ roles?: { name: string }[] }>("routes/admin");
  if (!data) {
    return undefined;
  }
  return data.roles;
}
