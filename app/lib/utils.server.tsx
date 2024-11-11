import { Role } from "@prisma/client";
import {
  CHEF_REDIRECT,
  SHIPPER_REDIRECT,
  ACCOUNTANT_REDIRECT,
  MANAGER_REDIRECT,
  DEFAULT_ADMIN_REDIRECT,
} from "./config.server";

export function isManager(roles: Role[]) {
  return roles.some((r) => r.name === "Manager");
}

export function isChef(roles: Role[]) {
  return roles.some((r) => r.name === "Chef");
}

export function isShipper(roles: Role[]) {
  return roles.some((r) => r.name === "Shipper");
}

export function isAccountant(roles: Role[]) {
  return roles.some((r) => r.name === "Accountant");
}

export function safeAdminRedirect(roles: Role[], redirectTo?: string) {
  if (isManager(roles)) return redirectTo ?? MANAGER_REDIRECT;

  if (isChef(roles)) return CHEF_REDIRECT;
  if (isShipper(roles)) return SHIPPER_REDIRECT;
  if (isAccountant(roles)) return ACCOUNTANT_REDIRECT;
  return DEFAULT_ADMIN_REDIRECT;
}
