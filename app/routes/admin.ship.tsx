import { Outlet } from "@remix-run/react";
export default function Layout() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
