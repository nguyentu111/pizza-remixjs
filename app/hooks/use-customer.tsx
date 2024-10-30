import { Customer } from "@prisma/client";
import { useOptionalCustomer } from "./use-optional-customer";

export function useCustomer(): Customer {
  const maybeCustomer = useOptionalCustomer();
  if (!maybeCustomer) {
    throw new Error(
      "No customer found in root loader, but customer is required by useCustomer. If customer is optional, try useOptionalCustomer instead.",
    );
  }
  return maybeCustomer;
}
