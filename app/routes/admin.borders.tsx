import { Outlet } from "@remix-run/react";
export default function BorderManagement() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
