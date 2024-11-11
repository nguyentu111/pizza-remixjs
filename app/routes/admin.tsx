import { Media, Staff } from "@prisma/client";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { Outlet, ShouldRevalidateFunction } from "@remix-run/react";
import Sidebar from "~/components/admin/sidebar";
import { prisma } from "~/lib/db.server";
import { PermissionsEnum } from "~/lib/type";
import { ca } from "~/lib/utils";
import { getAllMedia } from "~/models/media.server";
import { getUserPermission } from "~/models/permission.server";
import { getStaffRoles } from "~/models/role.server";
import { requireStaff } from "~/session.server";
import {
  deleteMediaAction,
  updateMediaAction,
  uploadMedia,
} from "~/use-cases/media.server";
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
    !!formAction?.startsWith("/admin/staffs") ||
    !!formAction?.startsWith("/admin/roles") ||
    !!formAction?.startsWith("/admin/permissions")
  );
};
export default function AdminLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 max-h-screen overflow-auto relative">
        <Outlet />
      </main>
    </div>
  );
}
