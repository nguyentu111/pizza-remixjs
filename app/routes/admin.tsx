import { Media, User } from "@prisma/client";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { Form, Link, NavLink, Outlet } from "@remix-run/react";
import {
  deleteMediaAction,
  updateMediaAction,
  uploadMedia,
} from "~/actions/media.server";
import { getAllMedia, updateMedia } from "~/models/media.server";
import { requireUser } from "~/session.server";
import { cn, useUser } from "~/lib/utils";
import { prisma } from "~/lib/db.server";
import { Button } from "~/components/ui/button";
import { LogOut } from "lucide-react";

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(prisma, request);
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
  const user = await requireUser(prisma, request);
  const media = await getAllMedia();
  return json({ user, media }, { status: 200 });
};
export type AdminLayoutData = { user: User; media: Media[] };
export default function AdminLayout() {
  const user = useUser();
  return (
    <div className="flex h-full">
      <div className="bg-gray-100 h-full min-w-[200px] flex flex-col justify-between py-4">
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
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img
              className="rounded-full w-10 h-10"
              src={user.avatarUrl ?? ""}
            />
            <div className="font-bold capitalize">{user.fullName}</div>
          </div>
          <Form action="/logout" method="post">
            <Button
              variant={"link"}
              type="submit"
              className="rounded px-4 py-2 "
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </Form>
        </div>
      </div>
      <div className="p-4 w-full max-h-screen overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
