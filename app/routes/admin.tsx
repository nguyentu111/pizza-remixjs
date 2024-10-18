import { Media, User } from "@prisma/client";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { Link, NavLink, Outlet } from "@remix-run/react";
import {
  deleteMediaAction,
  updateMediaAction,
  uploadMedia,
} from "~/actions/media";
import { getAllMedia, updateMedia } from "~/models/media.server";
import { requireUser } from "~/session.server";
import { cn } from "~/lib/utils";

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);
  const formData = await request.formData();
  const method = request.method;
  const values = Object.fromEntries(formData) as any;
  if (method === "POST") {
    if (values._action === "update-media") {
      return updateMediaAction(values);
    }
    if (values._action === "upload-media") {
      return uploadMedia(formData);
    }
  }
  if (method === "DELETE") {
    if (values._action === "delete-media") {
      return deleteMediaAction(request);
    }
  }
  return null;
};
export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  const media = await getAllMedia();
  return json({ user, media }, { status: 200 });
};
export type AdminLayoutData = { user: User; media: Media[] };
export default function AdminLayout() {
  return (
    <div className="flex h-full">
      <div className="bg-gray-100 h-full min-w-[300px]">
        <nav>
          <ul>
            <li>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
                }
              >
                Users
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/permissions"
                className={({ isActive }) =>
                  cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
                }
              >
                Permisions
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/roles"
                className={({ isActive }) =>
                  cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
                }
              >
                Roles
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
