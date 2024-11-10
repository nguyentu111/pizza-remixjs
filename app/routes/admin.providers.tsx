import { Outlet } from "@remix-run/react";
export default function ProviderManagement() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
