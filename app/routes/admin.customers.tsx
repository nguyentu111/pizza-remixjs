import { Outlet } from "@remix-run/react";

export default function CustomerLayout() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
