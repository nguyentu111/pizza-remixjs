import { Customer } from "@prisma/client";

import { useMatchesData } from "./use-matches-data";

export function useOptionalCustomer(): Customer | undefined {
  const data = useMatchesData<{ customer?: Customer }>("routes/_client");
  if (!data) {
    return undefined;
  }
  return data.customer;
}
