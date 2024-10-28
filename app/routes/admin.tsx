import { Media, Staff } from "@prisma/client";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import {
  Form,
  NavLink,
  Outlet,
  ShouldRevalidateFunction,
} from "@remix-run/react";
import { LogOut } from "lucide-react";
import {
  deleteMediaAction,
  updateMediaAction,
  uploadMedia,
} from "~/actions/media.server";
import { Button } from "~/components/ui/button";
import { PermissionsEnum } from "~/lib/config.server";
import { prisma } from "~/lib/db.server";
import { ca, cn, useStaff } from "~/lib/utils";
import { getAllMedia } from "~/models/media.server";
import { requireStaff } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export const action: ActionFunction = ca(async ({ request }) => {
  const user = await requireStaff(prisma, request);
  const formData = await request.formData();
  const method = request.method;
  const values = Object.fromEntries(formData) as any;
  if (method === "POST") {
    if (values._action === "update-media") {
      await requirePermissions(prisma, user.id, [PermissionsEnum.UpdateMedia]);
      return updateMediaAction(values);
    }
    if (values._action === "upload-media") {
      await requirePermissions(prisma, user.id, [PermissionsEnum.UpLoadMedia]);
      return uploadMedia(formData);
    }
  }
  if (method === "DELETE") {
    if (values._action === "delete-media") {
      await requirePermissions(prisma, user.id, [PermissionsEnum.DeleteMedia]);
      return deleteMediaAction(request);
    }
  }
  return null;
});
export const loader: LoaderFunction = async ({ request }) => {
  const [staff, media] = await Promise.all([
    requireStaff(prisma, request),
    getAllMedia(),
  ]);
  return json({ staff, media }, { status: 200 });
};
export type AdminLayoutData = { staff: Staff; media: Media[] };
export const shouldRevalidate: ShouldRevalidateFunction = ({ formAction }) => {
  return (
    formAction === "/admin" || (formAction?.startsWith("/admin/staff") ?? false)
  );
};
export default function AdminLayout() {
  const staff = useStaff();
  return (
    <div className="flex h-full">
      <div className="bg-gray-100 h-full min-w-[200px] flex flex-col justify-between py-4">
        <nav>
          <ul>
            <li>
              <NavLink
                to="/admin/staffs"
                className={({ isActive }) =>
                  cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
                }
              >
                Staffs
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/admin/providers"
                className={({ isActive }) =>
                  cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
                }
              >
                Providers
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/permissions"
                className={({ isActive }) =>
                  cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
                }
              >
                Permissions
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
            <li>
              <NavLink
                to="/admin/products"
                className={({ isActive }) =>
                  cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
                }
              >
                Products
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/categories"
                className={({ isActive }) =>
                  cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
                }
              >
                Categories
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/borders"
                className={({ isActive }) =>
                  cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
                }
              >
                Borders
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/materials"
                className={({ isActive }) =>
                  cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
                }
              >
                Materials
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/sizes"
                className={({ isActive }) =>
                  cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
                }
              >
                Sizes
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/toppings"
                className={({ isActive }) =>
                  cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
                }
              >
                Toppings
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/coupons"
                className={({ isActive }) =>
                  cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
                }
              >
                Coupons
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/imports"
                className={({ isActive }) =>
                  cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
                }
              >
                Imports
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img className="rounded-full w-10 h-10" src={staff.image ?? ""} />
            <div className="font-bold capitalize">{staff.fullname}</div>
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
