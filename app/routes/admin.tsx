import { Media, Staff } from "@prisma/client";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { Form, Outlet, ShouldRevalidateFunction } from "@remix-run/react";
import { LogOut } from "lucide-react";
import {
  deleteMediaAction,
  updateMediaAction,
  uploadMedia,
} from "~/use-cases/media.server";
import { Button } from "~/components/ui/button";
import { PermissionsEnum } from "~/lib/type";
import { prisma } from "~/lib/db.server";
import { ca, cn } from "~/lib/utils";
import { getAllMedia } from "~/models/media.server";
import { requireStaff } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";
import { getUserPermission } from "~/models/permission.server";
import Sidebar from "~/components/admin/sidebar";
import { getStaffRoles } from "~/models/role.server";

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
  const permissions = await getUserPermission(prisma, staff.id);
  const roles = await getStaffRoles(prisma, staff.id);
  return json({ staff, media, permissions, roles }, { status: 200 });
};
export type AdminLayoutData = { staff: Staff; media: Media[] };
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formAction,
  formData,
}) => {
  const _action = formData?.get("_action");
  return (
    _action === "upload-media" ||
    _action === "delete-media" ||
    !!formAction?.startsWith("/admin/staffs")
  );
};
export default function AdminLayout() {
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="p-4 w-full max-h-screen overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
