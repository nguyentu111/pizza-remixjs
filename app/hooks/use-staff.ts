import { Staff } from "@prisma/client";
import { useMatchesData } from "./use-matches-data";

export function useOptionalStaff(): Staff | undefined {
  const data = useMatchesData<{ staff?: Staff }>("routes/admin");
  if (!data) {
    return undefined;
  }
  return data.staff;
}

export function useStaff(): Staff {
  const maybeStaff = useOptionalStaff();
  if (!maybeStaff) {
    throw new Error(
      "No staff found in root loader, but staff is required by useStaff. If staff is optional, try useOptionalStaff instead.",
    );
  }
  return maybeStaff;
}
