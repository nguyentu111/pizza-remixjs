import { Outlet } from "@remix-run/react";

export default function MaterialLayout() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
