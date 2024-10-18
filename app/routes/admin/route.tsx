import { json, LoaderFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { requireUser } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  return json({ user }, { status: 200 });
};
export default function AdminLayout() {
  return (
    <div className="flex h-full">
      <div className="bg-gray-100 h-full min-w-[400px]">Side bar</div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
