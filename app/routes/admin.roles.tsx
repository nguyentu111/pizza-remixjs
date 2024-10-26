import { Outlet } from "@remix-run/react";

export default function RoleLayout() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
