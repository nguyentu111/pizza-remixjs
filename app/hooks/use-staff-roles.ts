import { useMatchesData } from "./use-matches-data";

export function useStaffRoles() {
  const data = useMatchesData<{ roles?: { name: string }[] }>("routes/admin");

  return {
    roles: data.roles || [],
    isManager: data.roles?.some((r) => r.name === "Manager"),
    isShipper: data.roles?.some((r) => r.name === "Shipper"),
    isChef: data.roles?.some((r) => r.name === "Chef"),
    isAccountant: data.roles?.some((r) => r.name === "Accountant"),
  };
}
